import { useGame } from '../../context/GameContext';
import { getInitials, getAvatarColor } from '../../utils/helpers';
import { addBot } from '../../services/roomService'; // Geçici olarak direkt servisten çağıralım veya Context'e ekleyelim

export default function LobbyScreen() {
    const { state, startGame, kickPlayer, leaveRoom, updateSettings, addToast } = useGame();

    // GameContext'ten gelen adaptedState.room
    const { room, player } = state;
    const isHost = player.isHost;
    // Botlar dummy id ile ekleniyor, gerçek oyuncular auth id ile.
    const canStart = (room?.players?.length || 0) >= 3;

    const handleCopyCode = () => {
        if (!room?.code) return;
        navigator.clipboard.writeText(room.code).then(() => {
            addToast('Oda kodu kopyalandı!', 'success');
        }).catch(() => {
            addToast(`Oda kodu: ${room.code}`, 'info');
        });
    };

    const handleStartGame = async () => {
        if ((room?.players?.length || 0) < 3) {
            addToast('En az 3 oyuncu gerekli!', 'error');
            return;
        }
        await startGame();
        // Status değişince Context ekranı otomatik değiştirecek
    };

    const handleAddBot = async () => {
        if ((room?.players?.length || 0) >= 12) {
            addToast('Oda dolu! (Maks 12 oyuncu)', 'warning');
            return;
        }
        // Context action'ı yoksa direkt servisi çağırırız
        // addBot servisi roomId istiyor
        try {
            await addBot(room.id);
            addToast("Bot eklendi", "success");
        } catch (e) {
            addToast("Bot eklenemedi: " + e.message, "error");
        }
    };

    const handleKickPlayer = async (playerId) => {
        try {
            await kickPlayer(playerId);
            addToast('Oyuncu çıkarıldı', 'info');
        } catch (e) {
            addToast(e.message, "error");
        }
    };

    const handleLeave = async () => {
        await leaveRoom();
    };

    const handleDurationChange = (val) => {
        updateSettings({ ...room.settings, roundDuration: val });
    };

    const durationOptions = [
        { label: '3 dk', value: 180 },
        { label: '5 dk', value: 300 },
        { label: '8 dk', value: 480 },
    ];

    if (!room) return <div className="text-center mt-20">Oda yükleniyor...</div>;

    return (
        <div className="w-full min-h-dvh flex flex-col items-center px-4 py-6 animate-fade-in">
            {/* Header */}
            <div className="text-center mb-6">
                <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Oda Kodu</p>
                <button
                    onClick={handleCopyCode}
                    className="group flex items-center gap-3 glass border-gold/30 rounded-xl px-6 py-3 transition-all hover:shadow-[0_0_30px_rgba(255,215,0,0.15)] cursor-pointer"
                >
                    <span className="text-gold text-4xl font-heading font-black tracking-[8px]">
                        {room.code}
                    </span>
                    <span className="text-gray-600 text-xs group-hover:text-gray-400 transition-colors">
                        📋 Kopyala
                    </span>
                </button>
            </div>

            {/* Player Count */}
            <div className="text-center mb-4">
                <span className="text-sm text-gray-400">
                    👥 {room.players.length} / 12 Oyuncu
                    {room.players.length > 8 && (
                        <span className="text-danger ml-2 font-semibold">🕵️ 2 Casus!</span>
                    )}
                </span>
            </div>

            {/* Player List */}
            <div className="w-full max-w-sm flex flex-col gap-2 mb-6">
                {room.players.map((p, index) => (
                    <div
                        key={p.id}
                        className={`flex items-center gap-3 px-4 py-3 glass rounded-xl animate-slide-up ${p.isHost ? 'border-gold/30' : ''
                            }`}
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        {/* Avatar */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 ${getAvatarColor(index)}`}>
                            {getInitials(p.name)}
                        </div>

                        {/* Name */}
                        <span className="flex-1 font-medium truncate">{p.name} {p.id === player.id && "(Sen)"}</span>

                        {/* Host badge */}
                        {p.isHost && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gold/15 text-gold font-semibold">
                                👑 Host
                            </span>
                        )}

                        {/* Connection */}
                        <span className={`w-2 h-2 rounded-full shrink-0 ${p.isConnected ? 'bg-innocent shadow-[0_0_6px_#2ecc71]' : 'bg-gray-600'}`} />

                        {/* Kick button */}
                        {isHost && !p.isHost && (
                            <button
                                onClick={() => handleKickPlayer(p.id)}
                                className="text-gray-600 hover:text-danger transition-colors text-lg cursor-pointer ml-2"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Host Settings */}
            {isHost && (
                <div className="w-full max-w-sm mb-6 animate-slide-up">
                    <div className="glass rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">⏱️ Tur Süresi</span>
                            <div className="flex gap-1">
                                {durationOptions.map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => handleDurationChange(opt.value)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${(room.settings?.roundDuration || 300) === opt.value
                                                ? 'bg-gold text-spy-dark'
                                                : 'border border-white/10 text-gray-400 hover:text-white'
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="w-full max-w-sm flex flex-col gap-3 mt-auto">
                {isHost && (
                    <>
                        <button
                            onClick={handleStartGame}
                            disabled={!canStart}
                            className="btn-gold w-full py-4 rounded-xl font-heading font-bold text-lg transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {canStart ? '🚀 Oyunu Başlat' : `⏳ ${3 - room.players.length} oyuncu daha gerekli`}
                        </button>
                        <button
                            onClick={handleAddBot}
                            className="glass glass-hover w-full py-3 rounded-xl font-heading font-semibold text-gray-300 transition-all active:scale-[0.97] cursor-pointer"
                        >
                            🤖 Test Oyuncusu Ekle
                        </button>
                    </>
                )}
                <button
                    onClick={handleLeave}
                    className="text-gray-500 hover:text-danger text-sm transition-colors cursor-pointer"
                >
                    🚪 Odadan Ayrıl
                </button>
            </div>
        </div>
    );
}
