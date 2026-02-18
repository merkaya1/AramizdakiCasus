import { createContext, useContext, useReducer, useEffect } from 'react';
import {
    createRoom,
    joinRoom,
    leaveRoom,
    subscribeRoom,
    kickPlayer,
    updateSettings
} from '../services/roomService';
import {
    startGame,
    seeRole,
    nextTurn,
    startVoting,
    castVote,
    finalizeVoting,
    makeSpyGuess,
    resetRoom
} from '../services/gameService';
import { signInUser, getCurrentUserId } from '../services/authService';

// Ekran Durumları
export const SCREENS = {
    MENU: 'menu',
    LOBBY: 'lobby',
    ROLE_REVEAL: 'role_reveal',
    INTERROGATION: 'interrogation',
    VOTING: 'voting',
    SPY_GUESS: 'spy_guess',
    GAME_OVER: 'game_over',
};

const initialState = {
    currentScreen: SCREENS.MENU,
    user: null,
    room: null,
    error: null,
    loading: false,
    toasts: [],
    myVote: null,
    spyGuessLocation: null,
};

const ACTIONS = {
    SET_SCREEN: 'SET_SCREEN',
    SET_USER: 'SET_USER',
    SET_ROOM: 'SET_ROOM',
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',
    ADD_TOAST: 'ADD_TOAST',
    REMOVE_TOAST: 'REMOVE_TOAST',
    RESET_GAME: 'RESET_GAME',
    SET_VOTE: 'SET_VOTE',
    SET_SPY_GUESS: 'SET_SPY_GUESS',
};

function gameReducer(state, action) {
    switch (action.type) {
        case ACTIONS.SET_SCREEN:
            return { ...state, currentScreen: action.payload };
        case ACTIONS.SET_USER:
            return { ...state, user: action.payload };

        case ACTIONS.SET_ROOM: {
            const roomData = action.payload;
            if (!roomData) return { ...state, room: null };

            // Otomatik Ekran Yönlendirmesi
            let nextScreen = state.currentScreen;

            if (roomData.status === 'lobby' && state.currentScreen !== SCREENS.LOBBY && state.currentScreen !== SCREENS.MENU) {
                nextScreen = SCREENS.LOBBY;
            }
            else if (roomData.status === 'role_reveal' && state.currentScreen !== SCREENS.ROLE_REVEAL) {
                nextScreen = SCREENS.ROLE_REVEAL;
            }

            const me = roomData.players?.find(p => p.id === state.user?.uid);
            if (me?.hasSeenRole && roomData.status === 'interrogation' && state.currentScreen !== SCREENS.INTERROGATION) {
                nextScreen = SCREENS.INTERROGATION;
            }

            if (roomData.status === 'voting' && state.currentScreen !== SCREENS.VOTING) {
                nextScreen = SCREENS.VOTING;
            }
            if (roomData.status === 'spy_guess' && state.currentScreen !== SCREENS.SPY_GUESS) {
                nextScreen = SCREENS.SPY_GUESS;
            }
            if (roomData.status === 'game_over' && state.currentScreen !== SCREENS.GAME_OVER) {
                nextScreen = SCREENS.GAME_OVER;
            }

            return {
                ...state,
                room: roomData,
                currentScreen: nextScreen
            };
        }

        case ACTIONS.SET_LOADING:
            return { ...state, loading: action.payload };
        case ACTIONS.SET_ERROR:
            return { ...state, error: action.payload };
        case ACTIONS.ADD_TOAST:
            return { ...state, toasts: [...state.toasts, action.payload] };
        case ACTIONS.REMOVE_TOAST:
            return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) };
        case ACTIONS.SET_VOTE:
            return { ...state, myVote: action.payload };
        case ACTIONS.SET_SPY_GUESS:
            return { ...state, spyGuessLocation: action.payload };
        case ACTIONS.RESET_GAME:
            return { ...initialState, user: state.user, currentScreen: SCREENS.MENU };
        default:
            return state;
    }
}

const GameContext = createContext(null);

export function GameProvider({ children }) {
    const [state, dispatch] = useReducer(gameReducer, initialState);

    // Auth Init
    useEffect(() => {
        const initAuth = async () => {
            try {
                const user = await signInUser();
                dispatch({ type: ACTIONS.SET_USER, payload: user });
            } catch (error) {
                console.error("Auth failed", error);
            }
        };
        initAuth();
    }, []);

    // Room Listener
    useEffect(() => {
        if (!state.room?.id) return;

        const unsubscribe = subscribeRoom(state.room.id, (roomData) => {
            if (!roomData) {
                addToast("Oda kapatıldı.", "warning");
                dispatch({ type: ACTIONS.SET_ROOM, payload: null });
                dispatch({ type: ACTIONS.SET_SCREEN, payload: SCREENS.MENU });
                return;
            }
            dispatch({ type: ACTIONS.SET_ROOM, payload: { ...roomData, id: state.room.id } });
        });

        return () => unsubscribe();
    }, [state.room?.id]);

    // Atılma Kontrolü (Client-side Security Check)
    // Sadece gerçek Firestore verisi geldiğinde çalışır (status alanı yoksa minimal payload'dır)
    useEffect(() => {
        if (!state.room?.status || !state.user || !state.room.players) return;
        if (state.room.players.length > 0) {
            const me = state.room.players.find(p => p.id === state.user.uid);
            if (!me) {
                addToast("Odadan atıldınız.", "error");
                dispatch({ type: ACTIONS.SET_ROOM, payload: null });
                dispatch({ type: ACTIONS.SET_SCREEN, payload: SCREENS.MENU });
            }
        }
    }, [state.room, state.user]);

    const addToast = (message, type = 'info') => {
        const id = Date.now() + Math.random();
        dispatch({ type: ACTIONS.ADD_TOAST, payload: { id, message, type } });
        setTimeout(() => dispatch({ type: ACTIONS.REMOVE_TOAST, payload: id }), 3000);
    };

    const actions = {
        createRoom: async (playerName) => {
            localStorage.setItem('playerName', playerName);
            try {
                const { roomId, roomCode } = await createRoom(playerName);

                // userId'yi al (state.user.uid veya servisten - servis daha garanti)
                const userId = getCurrentUserId();

                // İlk atama: Kendimizi listeye ekliyoruz ki "Atıldın" uyarısı çıkmasın
                dispatch({
                    type: ACTIONS.SET_ROOM,
                    payload: {
                        id: roomId,
                        code: roomCode,
                        status: 'lobby',
                        // Kendimizi ekliyoruz:
                        players: [{
                            id: userId,
                            name: playerName,
                            isHost: true,
                            isConnected: true
                        }]
                    }
                });

                dispatch({ type: ACTIONS.SET_SCREEN, payload: SCREENS.LOBBY });
                addToast(`Oda oluşturuldu: ${roomCode}`, "success");
            } catch (err) {
                console.error(err);
                addToast(err.message, "error");
            }
        },
        joinRoom: async (code, playerName) => {
            localStorage.setItem('playerName', playerName);
            try {
                const { roomId } = await joinRoom(code, playerName);
                const userId = getCurrentUserId();
                // Tam initial state ver ki LobbyScreen crash etmesin
                dispatch({
                    type: ACTIONS.SET_ROOM,
                    payload: {
                        id: roomId,
                        status: 'lobby',
                        code: code.toUpperCase(),
                        players: [{ id: userId, name: playerName, isHost: false, isConnected: true }],
                        settings: {}
                    }
                });
                dispatch({ type: ACTIONS.SET_SCREEN, payload: SCREENS.LOBBY });
                addToast("Odaya Katıldınız!", "success");
            } catch (err) {
                addToast(err.message, "error");
            }
        },
        leaveRoom: async () => {
            if (state.room?.id) await leaveRoom(state.room.id);
            dispatch({ type: ACTIONS.SET_ROOM, payload: null });
            dispatch({ type: ACTIONS.SET_SCREEN, payload: SCREENS.MENU });
        },
        startGame: () => startGame(state.room.id),
        kickPlayer: (pid) => kickPlayer(state.room.id, pid),
        updateSettings: (s) => updateSettings(state.room.id, s),
        seeRole: async () => {
            await seeRole(state.room.id);
            // Ekran geçişi Firestore listener tarafından otomatik yapılır
        },
        nextTurn: (tid) => nextTurn(state.room.id, tid),
        startVoting: () => startVoting(state.room.id),
        castVote: async (tid) => {
            await castVote(state.room.id, tid);
            dispatch({ type: ACTIONS.SET_VOTE, payload: tid });
        },
        finalizeVoting: () => finalizeVoting(state.room.id),
        makeSpyGuess: async (lid) => {
            await makeSpyGuess(state.room.id, lid);
            dispatch({ type: ACTIONS.SET_SPY_GUESS, payload: lid });
        },
        playAgain: async () => {
            await resetRoom(state.room.id);
            dispatch({ type: ACTIONS.SET_VOTE, payload: null });
            dispatch({ type: ACTIONS.SET_SPY_GUESS, payload: null });
            // Ekran geçişi Firestore listener tarafından lobby'ye yönlendirilir
        },
        setScreen: (s) => dispatch({ type: ACTIONS.SET_SCREEN, payload: s }),
        addToast,
    };

    const currentPlayer = state.room?.players?.find(p => p.id === state.user?.uid) || {
        id: state.user?.uid,
        name: localStorage.getItem('playerName') || '',
        isHost: false,
        isSpy: false,
        role: null
    };

    const adaptedState = {
        ...state,
        player: currentPlayer,
        room: state.room || { players: [], code: '', settings: {} },
        myVote: state.myVote,
        spyGuessLocation: state.spyGuessLocation,
    };

    return (
        <GameContext.Provider value={{ state: adaptedState, ...actions }}>
            {children}
        </GameContext.Provider>
    );
}

export function useGame() {
    const context = useContext(GameContext);
    if (!context) throw new Error('useGame must be used within GameProvider');
    return context;
}

export default GameContext;
