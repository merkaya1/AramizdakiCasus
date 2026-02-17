import { useState, useEffect, useRef } from 'react';
import { useGame, SCREENS } from '../../context/GameContext';
import { getInitials, getAvatarColor, formatTime } from '../../utils/helpers';
import locations from '../../data/locations';

function QuestionHistory({ history, players }) {
    const [expanded, setExpanded] = useState(false);

    if (!history || history.length === 0) return null;

    const getName = (id) => players.find(p => p.id === id)?.name || '?';

    // En yeni en üstte
    const sorted = [...history].reverse();
    const visibleCount = 5;
    const visible = expanded ? sorted : sorted.slice(0, visibleCount);
    const hasMore = sorted.length > visibleCount;

    return (
        <div className="fixed bottom-24 right-3 z-30 w-52 md:bottom-6 md:right-6 md:w-64">
            <div className="glass rounded-xl border border-white/[0.08] overflow-hidden shadow-lg">
                {/* Header */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.06]">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Soru Gecmisi</span>
                    <span className="text-[10px] text-gray-600 bg-white/5 px-1.5 py-0.5 rounded-full">{history.length}</span>
                </div>

                {/* Items */}
                <div className={`flex flex-col ${expanded ? 'max-h-60 overflow-y-auto' : ''}`}>
                    {visible.map((q, i) => {
                        const orderNum = history.length - i;
                        return (
                            <div
                                key={`${q.from}-${q.to}-${q.t}`}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] ${i === 0 ? 'bg-gold/5' : ''} ${i < visible.length - 1 ? 'border-b border-white/[0.03]' : ''}`}
                            >
                                <span className="text-gray-600 w-4 text-right shrink-0 font-mono">{orderNum}</span>
                                <span className="text-white font-medium truncate max-w-16">{getName(q.from)}</span>
                                <span className="text-gold shrink-0">→</span>
                                <span className="text-gray-300 truncate max-w-16">{getName(q.to)}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Expand/Collapse */}
                {hasMore && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="w-full px-3 py-1.5 text-[10px] text-gray-500 hover:text-gray-300 border-t border-white/[0.06] transition-colors cursor-pointer text-center"
                    >
                        {expanded ? '▲ Daralt' : `▼ Tumunu gor (${sorted.length - visibleCount} daha)`}
                    </button>
                )}
            </div>
        </div>
    );
}

export default function InterrogationScreen() {
    const { state, setScreen, nextTurn, makeSpyGuess, startVoting, addToast } = useGame();
    const { player, room } = state;
    const roundDuration = room.settings?.roundDuration || 300;

    // roundStartTime Firestore Timestamp'den başlangıç hesapla
    const getInitialTimeLeft = () => {
        if (room.roundStartTime?.seconds) {
            const startSec = room.roundStartTime.seconds;
            const nowSec = Math.floor(Date.now() / 1000);
            const elapsed = nowSec - startSec;
            return Math.max(0, roundDuration - elapsed);
        }
        return roundDuration;
    };

    const [timeLeft, setTimeLeft] = useState(getInitialTimeLeft);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [showSpyGuess, setShowSpyGuess] = useState(false);
    const [spyGuess, setSpyGuess] = useState(null);
    const timerExpired = useRef(false);

    const currentAsker = room.currentAsker;
    const isMyTurn = currentAsker === player.id;
    const isSpy = player.isSpy;

    // Timer
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    if (!timerExpired.current) {
                        timerExpired.current = true;
                        // Host oylama fazını başlatır, diğerleri Firestore status değişimini bekler
                        if (player.isHost) {
                            startVoting();
                        }
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [player.isHost, startVoting]);

    const handleSelectPlayer = (playerId) => {
        if (!isMyTurn || playerId === player.id) return;
        setSelectedPlayer(playerId);
    };

    const handleConfirmQuestion = async () => {
        if (!selectedPlayer) return;
        await nextTurn(selectedPlayer);
        const targetName = room.players.find(p => p.id === selectedPlayer)?.name;
        setSelectedPlayer(null);
        addToast(`Sıra ${targetName}'da`, 'info');
    };

    const handleSpyGuess = async () => {
        if (!spyGuess) {
            addToast('Bir mekan seçin!', 'error');
            return;
        }
        try {
            await makeSpyGuess(spyGuess);
        } catch (err) {
            addToast(err.message, 'error');
        }
    };

    const timerClass = timeLeft <= 30 ? 'text-danger animate-pulse' : timeLeft <= 60 ? 'text-gold' : 'text-white';

    return (
        <div className="w-full min-h-dvh flex flex-col items-center px-4 py-6 animate-fade-in">
            {/* Timer */}
            <div className="text-center mb-2">
                <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Kalan Süre</p>
                <p className={`font-heading font-black text-5xl ${timerClass} transition-colors`}>
                    {formatTime(timeLeft)}
                </p>
            </div>

            {/* Current Turn Indicator */}
            <div className="glass rounded-xl px-4 py-2 mb-6">
                <p className="text-sm text-center">
                    {isMyTurn ? (
                        <span className="text-gold font-semibold">🎤 Senin sıran! Birine soru sor</span>
                    ) : (
                        <span className="text-gray-400">
                            🎤 <span className="text-white font-semibold">{room.players.find(p => p.id === currentAsker)?.name}</span> soru soruyor
                        </span>
                    )}
                </p>
            </div>

            {/* Your Role Reminder */}
            <div className={`glass rounded-xl px-4 py-2 mb-4 ${isSpy ? 'border-danger/30' : 'border-blue-500/20'}`}>
                {isSpy ? (
                    <p className="text-xs text-center text-danger font-semibold">🕵️ Sen casussun • Konuşmalardan mekanı anlamaya çalış</p>
                ) : (
                    <p className="text-xs text-center text-gray-400">
                        📍 <span className="text-gold">{room.currentLocation?.name}</span> • Rolün: <span className="text-white">{player.role}</span>
                    </p>
                )}
            </div>

            {/* Player Circle */}
            <div className="flex flex-wrap justify-center gap-3 py-4 mb-4">
                {room.players.map((p, index) => {
                    const isCurrentAsker = p.id === currentAsker;
                    const isSelected = p.id === selectedPlayer;
                    const isMe = p.id === player.id;

                    return (
                        <button
                            key={p.id}
                            onClick={() => handleSelectPlayer(p.id)}
                            disabled={!isMyTurn || isMe}
                            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all cursor-pointer disabled:cursor-default ${isCurrentAsker ? 'animate-pulse-glow' : ''
                                } ${isSelected ? 'bg-blue-500/15' : 'hover:bg-white/[0.04]'} ${isMe ? 'opacity-50' : ''
                                }`}
                        >
                            <div
                                className={`w-14 h-14 rounded-full flex items-center justify-center text-sm font-bold text-white border-3 transition-all ${getAvatarColor(index)
                                    } ${isCurrentAsker
                                        ? 'border-gold shadow-[0_0_20px_rgba(255,215,0,0.3)]'
                                        : isSelected
                                            ? 'border-blue-500'
                                            : 'border-white/10'
                                    }`}
                            >
                                {getInitials(p.name)}
                            </div>
                            <span className="text-[11px] text-gray-400 max-w-[70px] text-center truncate">
                                {isMe ? 'Sen' : p.name}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Confirm Question Button */}
            {isMyTurn && selectedPlayer && (
                <button
                    onClick={handleConfirmQuestion}
                    className="btn-gold px-8 py-3 rounded-xl font-heading font-bold mb-4 animate-slide-up transition-all active:scale-[0.97] cursor-pointer"
                >
                    ✅ {room.players.find(p => p.id === selectedPlayer)?.name}'a Sordum
                </button>
            )}

            {/* Bottom Buttons */}
            <div className="w-full max-w-sm flex flex-col gap-3 mt-auto">
                {/* Spy: Guess Location */}
                {isSpy && (
                    <button
                        onClick={() => setShowSpyGuess(true)}
                        className="w-full py-3 rounded-xl font-heading font-semibold bg-danger/10 border border-danger/30 text-danger hover:bg-danger/20 transition-all active:scale-[0.97] cursor-pointer animate-pulse"
                    >
                        🎯 Mekanı Tahmin Et
                    </button>
                )}

                {/* Emergency Meeting */}
                <button
                    onClick={() => {
                        addToast('Acil Toplantı özelliği yakında!', 'warning');
                    }}
                    className="w-full py-3 rounded-xl font-heading font-semibold glass glass-hover text-gray-400 transition-all active:scale-[0.97] cursor-pointer"
                >
                    🚨 Acil Toplantı
                </button>
            </div>

            {/* Question History Panel */}
            <QuestionHistory history={room.questionHistory} players={room.players} />

            {/* Spy Guess Modal */}
            {showSpyGuess && (
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setShowSpyGuess(false)}
                >
                    <div
                        className="bg-spy-card border border-danger/30 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto animate-slide-up"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="font-heading font-bold text-xl text-danger mb-1 text-center">🎯 Mekanı Tahmin Et</h2>
                        <p className="text-gray-500 text-xs text-center mb-4">Dikkatli ol! Yanlış bilirsen deşifre olursun.</p>

                        <div className="grid grid-cols-2 gap-2 mb-4">
                            {locations.map(loc => (
                                <button
                                    key={loc.id}
                                    onClick={() => setSpyGuess(loc.id)}
                                    className={`flex items-center gap-2 px-3 py-3 rounded-xl text-left text-sm transition-all cursor-pointer ${spyGuess === loc.id
                                            ? 'bg-gold/10 border-2 border-gold'
                                            : 'glass glass-hover border border-transparent'
                                        }`}
                                >
                                    <span className="text-lg">{loc.emoji}</span>
                                    <span className={spyGuess === loc.id ? 'text-gold font-semibold' : 'text-gray-300'}>
                                        {loc.name}
                                    </span>
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowSpyGuess(false)}
                                className="flex-1 py-3 rounded-xl glass text-gray-400 font-heading font-semibold transition-all cursor-pointer"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleSpyGuess}
                                disabled={!spyGuess}
                                className="flex-1 py-3 rounded-xl bg-danger text-white font-heading font-bold transition-all active:scale-[0.97] disabled:opacity-40 cursor-pointer"
                            >
                                Tahmin Et!
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
