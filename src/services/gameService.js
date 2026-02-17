import { db } from '../firebase';
import {
    doc,
    updateDoc,
    getDoc,
    arrayUnion,
    serverTimestamp
} from 'firebase/firestore';
import { shuffleArray, getSpyCount } from '../utils/helpers';
import locations from '../data/locations';
import { getCurrentUserId } from './authService';

const ROOMS_COLLECTION = 'rooms';

// Oyunu Başlat (Sadece Host)
export const startGame = async (roomId) => {
    const userId = getCurrentUserId();
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    const snap = await getDoc(roomRef);

    if (!snap.exists()) throw new Error("Oda yok!");

    const roomData = snap.data();
    if (roomData.hostId !== userId) throw new Error("Sadece Host oyunu başlatabilir!");
    if (roomData.players.length < 3) throw new Error("En az 3 oyuncu gerekli!");

    // Mekan Seç
    const location = locations[Math.floor(Math.random() * locations.length)];

    // Casus Sayısı
    const spyCount = getSpyCount(roomData.players.length);

    // Rol Dağıtımı
    // Dikkat: Firestore'da object array güncellemek zordur. Tüm diziyi overwrite edeceğiz.
    const players = [...roomData.players];
    const shuffled = shuffleArray(players);
    const spies = shuffled.slice(0, spyCount);
    const spyIds = spies.map(p => p.id);

    const availableRoles = shuffleArray([...location.roles]);

    let roleIndex = 0;
    const updatedPlayers = players.map((p) => {
        const isSpy = spyIds.includes(p.id);
        const role = isSpy ? null : availableRoles[roleIndex++ % availableRoles.length];
        return {
            ...p,
            isSpy,
            role,
            hasSeenRole: false,
            hasVoted: false,
            votedFor: null
        };
    });

    // İlk soran kişi rastgele seçilir (dokümantasyona uygun)
    const starter = shuffled[Math.floor(Math.random() * shuffled.length)];

    await updateDoc(roomRef, {
        status: 'role_reveal',
        currentLocation: location,
        spyIds,
        currentAsker: starter.id, // Casus başlarsa daha eğlenceli (isteğe bağlı)
        players: updatedPlayers,
        roundStartTime: serverTimestamp(),
        votes: {},
        gameResult: null,
        questionHistory: []
    });
};

// Rol Görüldü
export const seeRole = async (roomId) => {
    const userId = getCurrentUserId();
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    const snap = await getDoc(roomRef);
    if (!snap.exists()) return;

    const players = snap.data().players;
    const isBot = (id) => id.startsWith('bot_');
    const newPlayers = players.map(p => {
        // Kendi kartımızı gördük olarak işaretle
        if (p.id === userId) return { ...p, hasSeenRole: true };
        // Botları otomatik olarak "gördü" say
        if (isBot(p.id)) return { ...p, hasSeenRole: true };
        return p;
    });

    // Eğer hepsi gördüyse -> Interrogation'a geç
    const allSeen = newPlayers.every(p => p.hasSeenRole || !p.isConnected);

    await updateDoc(roomRef, {
        players: newPlayers,
        status: allSeen ? 'interrogation' : 'role_reveal',
        // Eğer interrogation başlıyorsa timer'ı şimdi başlat (sunucu saati)
        roundStartTime: allSeen ? serverTimestamp() : null
    });
};

// Sıra Geçişi + Soru Geçmişi Kaydı
export const nextTurn = async (roomId, targetPlayerId) => {
    const userId = getCurrentUserId();
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    await updateDoc(roomRef, {
        currentAsker: targetPlayerId,
        questionHistory: arrayUnion({
            from: userId,
            to: targetPlayerId,
            t: Date.now()
        })
    });
};

// Oylamayı Başlat (Süre dolunca Host tetikler)
export const startVoting = async (roomId) => {
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    await updateDoc(roomRef, {
        status: 'voting',
        votes: {},
        roundStartTime: serverTimestamp()
    });
};

// Oy Kullan
export const castVote = async (roomId, targetId) => {
    const userId = getCurrentUserId();
    if (!userId) throw new Error("Giriş yapılmamış!");
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);

    const snap = await getDoc(roomRef);
    if (!snap.exists()) throw new Error("Oda yok!");

    const data = snap.data();
    if (data.status !== 'voting') throw new Error("Oylama aktif değil!");
    if (data.votes && data.votes[userId]) throw new Error("Zaten oy kullandınız!");
    if (targetId === userId) throw new Error("Kendinize oy veremezsiniz!");

    await updateDoc(roomRef, {
        [`votes.${userId}`]: targetId
    });
};

// Oylamayı Sonlandır (Host Tetikler)
export const finalizeVoting = async (roomId) => {
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    const snap = await getDoc(roomRef);
    if (!snap.exists()) return;

    const data = snap.data();
    const votes = data.votes || {};
    const voteCounts = {};

    Object.values(votes).forEach(targetId => {
        voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
    });

    // En çok oy alan
    let maxVotes = 0;
    let votedPlayerId = null;

    Object.entries(voteCounts).forEach(([pid, count]) => {
        if (count > maxVotes) {
            maxVotes = count;
            votedPlayerId = pid;
        } else if (count === maxVotes) {
            votedPlayerId = null; // Eşitlik -> Kimse seçilmez -> Casus kazanır
        }
    });

    let nextStatus = 'game_over';
    let result = null;

    if (!votedPlayerId) {
        // Eşitlik veya kimse oy vermedi -> Casus kazanır
        result = { winner: 'spy', reason: 'innocents_wrong_vote' }; // Eşitlik casusa yarar
    } else {
        // Seçilen kişi casus mu?
        const isSpy = data.spyIds.includes(votedPlayerId);
        if (isSpy) {
            // Casus yakalandı -> Son şans tahmini
            nextStatus = 'spy_guess';
        } else {
            // Masum seçildi -> Casus kazanır
            result = { winner: 'spy', reason: 'innocents_wrong_vote' };
        }
    }

    const updateData = {
        status: nextStatus,
        gameResult: result
    };
    if (nextStatus === 'spy_guess') {
        updateData.roundStartTime = serverTimestamp();
    }
    await updateDoc(roomRef, updateData);
};

// Casus Tahmini
export const makeSpyGuess = async (roomId, locationId) => {
    const userId = getCurrentUserId();
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    const snap = await getDoc(roomRef);
    if (!snap.exists()) return;

    const data = snap.data();
    if (!data.spyIds.includes(userId)) throw new Error("Sadece casus tahmin yapabilir!");

    // Süre doldu durumu
    if (locationId === '__timeout__') {
        await updateDoc(roomRef, {
            status: 'game_over',
            gameResult: {
                winner: 'innocents',
                reason: 'spy_timeout'
            }
        });
        return;
    }

    const correct = data.currentLocation.id === locationId;

    await updateDoc(roomRef, {
        status: 'game_over',
        gameResult: {
            winner: correct ? 'spy' : 'innocents',
            reason: correct ? 'spy_guessed_location' : 'spy_wrong_guess',
            spyGuessedLocation: locationId
        }
    });
};

// Tekrar Oyna (Host: Lobiye döndür)
export const resetRoom = async (roomId) => {
    const userId = getCurrentUserId();
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    const snap = await getDoc(roomRef);
    if (!snap.exists()) return;

    const data = snap.data();
    if (data.hostId !== userId) throw new Error("Sadece Host tekrar oyna yapabilir!");
    const cleanPlayers = data.players.map(p => ({
        id: p.id,
        name: p.name,
        isHost: p.isHost,
        isConnected: p.isConnected,
        joinedAt: p.joinedAt
    }));

    await updateDoc(roomRef, {
        status: 'lobby',
        currentLocation: null,
        spyIds: [],
        currentAsker: null,
        roundStartTime: null,
        gameResult: null,
        votes: {},
        questionHistory: [],
        players: cleanPlayers
    });
};
