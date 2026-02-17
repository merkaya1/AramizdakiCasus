import { useGame } from '../../context/GameContext';
import { getAvatarColor, getInitials } from '../../utils/helpers';
import locations from '../../data/locations';

export default function GameOverScreen() {
    const { state, leaveRoom, playAgain, addToast } = useGame();
    const { room, player } = state;
    const result = room.gameResult || { winner: 'none', reason: 'unknown' };

    const winner = result.winner || 'none';
    const reason = result.reason;

    const spyGuessedLocation = result.spyGuessedLocation ? locations.find(l => l.id === result.spyGuessedLocation) : null;
    const currentLocation = room.currentLocation || { name: 'Bilinmiyor', emoji: '❓' };

    const handlePlayAgain = async () => {
        try {
            await playAgain();
        } catch (err) {
            addToast(err.message, 'error');
        }
    };

    const handleExit = async () => {
        await leaveRoom();
    };

    const winText = winner === 'spy'
        ? 'CASUS KAZANDI! 🕵️'
        : 'MASUMLAR KAZANDI! 🎉';

    const reasonText = {
        'spy_guessed_location': `Casus mekanı doğru bildi! (${currentLocation.name})`,
        'spy_wrong_guess': `Casus yanlış tahmin etti! (${spyGuessedLocation?.name || '?'})`,
        'innocents_wrong_vote': 'Masumlar yanlış kişiyi oyladı!',
        'spy_timeout': 'Casus tahmin süresini kaçırdı!',
        'spy_caught': 'Casus yakalandı!',
    }[reason] || 'Oyun bitti.';

    return (
        <div className="w-full min-h-dvh flex flex-col items-center justify-center px-4 py-8 animate-fade-in text-center relative overflow-hidden">
            {/* Background Glow */}
            <div className={`absolute inset-0 z-0 bg-gradient-to-b opacity-20 ${winner === 'spy' ? 'from-danger/30' : 'from-innocent/30'} to-transparent`} />

            {/* Result Badge */}
            <div className={`relative z-10 animate-bounce-in mb-6`}>
                <span className="text-8xl filter drop-shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                    {winner === 'spy' ? '🕵️' : '🎉'}
                </span>
            </div>

            <h1 className={`relative z-10 text-4xl font-heading font-black mb-2 animate-shimmer ${winner === 'spy' ? 'text-danger' : 'text-innocent'}`}>
                {winText}
            </h1>
            <p className="relative z-10 text-gray-300 text-sm mb-8 bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">
                {reasonText}
            </p>

            {/* Location Reveal */}
            <div className="w-full max-w-sm glass p-4 rounded-xl mb-6 border-gold/20 relative z-10 animate-slide-up">
                <p className="text-xs text-blue-400 uppercase tracking-widest mb-1">Mekan Neydi?</p>
                <div className="flex items-center justify-center gap-2">
                    <span className="text-3xl">{currentLocation.emoji}</span>
                    <span className="text-2xl font-bold text-white font-heading">{currentLocation.name}</span>
                </div>
            </div>

            {/* Roles List */}
            <div className="w-full max-w-sm flex flex-col gap-2 mb-8 relative z-10 animate-slide-up" style={{ animationDelay: '200ms' }}>
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1 text-left px-2">KİM NEYDİ?</p>
                {room.players.map((p, index) => (
                    <div
                        key={p.id}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-left ${p.isSpy ? 'bg-danger/10 border border-danger/30' : 'bg-white/5'}`}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${getAvatarColor(index)}`}>
                            {getInitials(p.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold truncate ${p.isSpy ? 'text-danger' : 'text-gray-200'}`}>
                                {p.name} {p.isSpy && '🕵️'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                {p.isSpy ? 'Casus' : p.role || 'Masum'}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Buttons */}
            <div className="w-full max-w-sm flex gap-3 relative z-10 mt-auto animate-slide-up" style={{ animationDelay: '400ms' }}>
                {player.isHost && (
                    <button
                        onClick={handlePlayAgain}
                        className="flex-1 btn-gold py-4 rounded-xl font-heading font-bold transition-all active:scale-[0.97] cursor-pointer"
                    >
                        🔄 Tekrar Oyna
                    </button>
                )}
                <button
                    onClick={handleExit}
                    className="flex-1 glass glass-hover py-4 rounded-xl font-heading font-semibold text-gray-300 transition-all active:scale-[0.97] cursor-pointer"
                >
                    🚪 Çıkış
                </button>
            </div>
        </div>
    );
}
