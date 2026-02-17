import { useState, useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { getAvatarColor, getInitials } from '../../utils/helpers';

export default function VotingScreen() {
    const { state, castVote, finalizeVoting, addToast } = useGame();
    const { player, room } = state;
    const VOTING_DURATION = 30;
    const [selectedVote, setSelectedVote] = useState(null);
    const [hasVoted, setHasVoted] = useState(false);
    const timerFinalized = useRef(false);

    const isHost = player.isHost;
    const votes = room.votes || {};

    // Firestore timestamp bazlı başlangıç hesapla
    const getInitialTimeLeft = () => {
        if (room.roundStartTime?.seconds) {
            const elapsed = Math.floor(Date.now() / 1000) - room.roundStartTime.seconds;
            return Math.max(0, VOTING_DURATION - elapsed);
        }
        return VOTING_DURATION;
    };

    const [timeLeft, setTimeLeft] = useState(getInitialTimeLeft);

    // Kimin kime oy verdiğini hesapla: targetId -> [voterNames]
    const votesForPlayer = {};
    Object.entries(votes).forEach(([voterId, targetId]) => {
        if (!votesForPlayer[targetId]) votesForPlayer[targetId] = [];
        const voter = room.players.find(p => p.id === voterId);
        if (voter) votesForPlayer[targetId].push(voter.name);
    });

    // Timer
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    if (!timerFinalized.current) {
                        timerFinalized.current = true;
                        if (!hasVoted) {
                            addToast('Süre doldu, oy kullanmadın!', 'warning');
                        }
                        if (isHost) {
                            finalizeVoting();
                        }
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [hasVoted, isHost, finalizeVoting, addToast]);

    const handleVote = async () => {
        if (!selectedVote || hasVoted) return;
        try {
            await castVote(selectedVote);
            setHasVoted(true);
            addToast('Oyun kaydedildi!', 'info');
        } catch (err) {
            addToast(err.message, 'error');
        }
    };

    return (
        <div className="w-full min-h-dvh flex flex-col items-center px-4 py-8 animate-fade-in">
            <h2 className="text-3xl font-heading font-black text-center mb-2 animate-bounce-in">
                🗳️ Oylama Zamanı!
            </h2>
            <p className="text-gray-400 text-center text-sm mb-6">
                Casus olduğunu düşündüğün kişiyi seç.
            </p>

            {/* Timer Badge */}
            <div className={`px-4 py-1 rounded-full text-sm font-bold mb-6 ${timeLeft <= 10 ? 'bg-danger/20 text-danger animate-pulse' : 'bg-gold/20 text-gold'}`}>
                ⏳ {timeLeft} saniye
            </div>

            {/* Player Grid */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-sm mb-8">
                {room.players.map((p, index) => {
                    if (p.id === player.id) return null;

                    const isSelected = selectedVote === p.id;
                    const voterNames = votesForPlayer[p.id] || [];

                    return (
                        <button
                            key={p.id}
                            onClick={() => !hasVoted && setSelectedVote(p.id)}
                            disabled={hasVoted}
                            className={`relative flex flex-col items-center p-4 rounded-xl border transition-all cursor-pointer ${isSelected
                                    ? 'bg-gold/10 border-gold shadow-[0_0_15px_rgba(255,215,0,0.2)] scale-105'
                                    : 'glass glass-hover border-transparent hover:border-white/10'
                                } ${hasVoted ? 'opacity-80 cursor-not-allowed' : ''}`}
                        >
                            {/* Oy sayısı badge */}
                            {voterNames.length > 0 && (
                                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-danger text-white text-xs font-bold flex items-center justify-center shadow-lg">
                                    {voterNames.length}
                                </span>
                            )}

                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white mb-2 ${getAvatarColor(index)}`}>
                                {getInitials(p.name)}
                            </div>
                            <span className="font-medium text-sm truncate w-full text-center">
                                {p.name}
                            </span>

                            {/* Kimin oy verdiğini göster */}
                            {voterNames.length > 0 && (
                                <div className="flex flex-wrap justify-center gap-1 mt-2 w-full">
                                    {voterNames.map((vn) => (
                                        <span
                                            key={vn}
                                            className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 text-gray-300 truncate max-w-[70px]"
                                        >
                                            {vn}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Confirm Button */}
            {!hasVoted && (
                <button
                    onClick={handleVote}
                    disabled={!selectedVote}
                    className="btn-gold w-full max-w-sm py-4 rounded-xl font-heading font-bold text-lg transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer animate-slide-up"
                >
                    Oyu Gönder 📩
                </button>
            )}

            {hasVoted && (
                <p className="text-gray-400 text-sm animate-pulse">
                    Diğer oyuncular bekleniyor...
                </p>
            )}
        </div>
    );
}
