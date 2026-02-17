import { db } from '../firebase';
import {
    doc,
    setDoc,
    updateDoc,
    arrayUnion,
    deleteDoc,
    getDoc,
    onSnapshot,
    serverTimestamp
} from 'firebase/firestore';
import { generateRoomCode } from '../utils/helpers';
import { getCurrentUserId } from './authService';

const ROOMS_COLLECTION = 'rooms';

// Oda oluştur
export const createRoom = async (playerName) => {
    const userId = getCurrentUserId();
    if (!userId) throw new Error("Giriş yapılmamış!");

    const roomCode = generateRoomCode();
    const roomId = `room_${roomCode}`;

    const roomRef = doc(db, ROOMS_COLLECTION, roomId);

    const snap = await getDoc(roomRef);
    if (snap.exists()) {
        return createRoom(playerName);
    }

    const newRoom = {
        code: roomCode,
        hostId: userId,
        status: 'lobby',
        createdAt: serverTimestamp(),
        settings: {
            roundDuration: 300
        },
        players: [
            {
                id: userId,
                name: playerName,
                isHost: true,
                isConnected: true,
                joinedAt: new Date().toISOString()
            }
        ],
        currentLocation: null,
        spyIds: [],
        currentAsker: null,
        roundStartTime: null,
        gameResult: null
    };

    await setDoc(roomRef, newRoom);
    return { roomId, roomCode };
};

// Odaya katıl
export const joinRoom = async (roomCode, playerName) => {
    const userId = getCurrentUserId();
    if (!userId) throw new Error("Giriş yapılmamış!");

    const roomId = `room_${roomCode}`;
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    const snap = await getDoc(roomRef);

    if (!snap.exists()) {
        throw new Error("Oda bulunamadı!");
    }

    const roomData = snap.data();

    if (roomData.status !== 'lobby') {
        throw new Error("Oyun zaten başladı!");
    }

    const isAlreadyIn = roomData.players.some(p => p.id === userId);

    if (!isAlreadyIn) {
        if (roomData.players.length >= 12) {
            throw new Error("Oda dolu!");
        }

        const newPlayer = {
            id: userId,
            name: playerName,
            isHost: false,
            isConnected: true,
            joinedAt: new Date().toISOString()
        };

        await updateDoc(roomRef, {
            players: arrayUnion(newPlayer)
        });
    }

    return { roomId };
};

// Odadan ayrıl
export const leaveRoom = async (roomId) => {
    const userId = getCurrentUserId();
    if (!userId) return;

    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    const snap = await getDoc(roomRef);

    if (!snap.exists()) return;

    const roomData = snap.data();
    const player = roomData.players.find(p => p.id === userId);

    if (!player) return;

    if (roomData.players.length <= 1) {
        await deleteDoc(roomRef);
        return;
    }

    const newPlayers = roomData.players.filter(p => p.id !== userId);

    const update = { players: newPlayers };

    if (player.isHost && newPlayers.length > 0) {
        newPlayers[0] = { ...newPlayers[0], isHost: true };
        update.hostId = newPlayers[0].id;
    }

    await updateDoc(roomRef, update);
};

// Oda durumunu dinle
export const subscribeRoom = (roomId, callback) => {
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);

    return onSnapshot(roomRef, (doc) => {
        if (doc.exists()) {
            callback(doc.data());
        } else {
            callback(null);
        }
    }, (error) => {
        console.error("Room subscription error:", error);
    });
};

// Host: Oyuncuyu at
export const kickPlayer = async (roomId, playerId) => {
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    const snap = await getDoc(roomRef);
    if (!snap.exists()) return;

    const players = snap.data().players;
    const newPlayers = players.filter(p => p.id !== playerId);

    if (newPlayers.length < players.length) {
        await updateDoc(roomRef, { players: newPlayers });
    }
};

// Host: Ayarları güncelle
export const updateSettings = async (roomId, settings) => {
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    await updateDoc(roomRef, { settings });
};

// Test: Bot Ekle
export const addBot = async (roomId) => {
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    const names = ['Ahmet', 'Mehmet', 'Ayşe', 'Fatma', 'Can', 'Cem', 'Ali', 'Veli'];
    const botName = names[Math.floor(Math.random() * names.length)] + ' Bot';

    const botPlayer = {
        id: `bot_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name: botName,
        isHost: false,
        isConnected: true,
        joinedAt: new Date().toISOString()
    };

    await updateDoc(roomRef, {
        players: arrayUnion(botPlayer)
    });
};
