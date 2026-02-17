import { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';

export default function RoleRevealScreen() {
    const { state, seeRole } = useGame();
    const { player, room } = state;
    const [isFlipped, setIsFlipped] = useState(false);
    const [canProceed, setCanProceed] = useState(false);

    useEffect(() => {
        // 1 saniye sonra kartı çevir
        const flipTimer = setTimeout(() => setIsFlipped(true), 1000);
        // 4 saniye sonra "Gördüm" butonunu aktif et
        const proceedTimer = setTimeout(() => setCanProceed(true), 4000);
        return () => {
            clearTimeout(flipTimer);
            clearTimeout(proceedTimer);
        };
    }, []);

    const handleSeen = () => {
        seeRole();
    };

    const location = room.currentLocation;
    const isSpy = player.isSpy;

    return (
        <div className="w-full min-h-dvh flex flex-col items-center justify-center px-4 py-8 animate-fade-in">
            <p className="text-gray-500 text-sm mb-6 font-heading">Kartını gizlice gör...</p>

            {/* Card Container - 3D Flip */}
            <div className="perspective-1000 w-[280px] h-[400px] mb-8">
                <div
                    className={`relative w-full h-full preserve-3d transition-transform duration-800 ease-[cubic-bezier(0.4,0,0.2,1)] ${isFlipped ? 'rotate-y-180' : ''
                        }`}
                >
                    {/* Back of card */}
                    <div className="absolute inset-0 backface-hidden rounded-2xl border-2 border-gold/30 bg-gradient-to-br from-spy-card to-spy-surface flex flex-col items-center justify-center glow-gold">
                        <span className="text-6xl opacity-30">🃏</span>
                        <p className="text-gold/50 font-heading font-bold mt-4 text-lg">Aramızdaki Casus</p>
                    </div>

                    {/* Front of card */}
                    <div
                        className={`absolute inset-0 backface-hidden rotate-y-180 rounded-2xl border-2 flex flex-col items-center justify-center p-8 text-center gap-4 ${isSpy
                                ? 'bg-gradient-to-br from-[#3a0a0f] to-[#5c1a22] border-danger glow-red'
                                : 'bg-gradient-to-br from-[#0d2137] to-[#1a3a5c] border-blue-500'
                            }`}
                    >
                        {isSpy ? (
                            /* Spy Card */
                            <>
                                <span className="text-6xl animate-bounce-in">🕵️</span>
                                <h2 className="text-danger font-heading font-black text-2xl drop-shadow-[0_0_20px_rgba(230,57,70,0.5)]">
                                    SEN CASUSSUN!
                                </h2>
                                <p className="text-gray-400 text-sm mt-2">
                                    Mekanı bilmiyorsun. Konuşmalardan ipucu topla ve deşifre olmamaya çalış!
                                </p>
                                <div className="mt-4 px-4 py-2 rounded-lg bg-danger/10 border border-danger/20">
                                    <p className="text-danger text-xs font-semibold">
                                        💡 İpucu: Sorulan sorulara yuvarlak cevaplar ver
                                    </p>
                                </div>
                            </>
                        ) : (
                            /* Innocent Card */
                            <>
                                <span className="text-5xl animate-bounce-in">{location?.emoji}</span>
                                <div>
                                    <p className="text-blue-400 text-xs uppercase tracking-widest mb-1">Mekan</p>
                                    <h2 className="text-gold font-heading font-bold text-xl">{location?.name}</h2>
                                </div>
                                <div className="w-full h-px bg-white/10" />
                                <div>
                                    <p className="text-blue-400 text-xs uppercase tracking-widest mb-1">Rolün</p>
                                    <h3 className="text-white font-heading font-semibold text-lg">{player.role}</h3>
                                </div>
                                <p className="text-gray-500 text-xs mt-2">
                                    Mekanı açık etmeden casusu bulmaya çalış!
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Gördüm Button */}
            <button
                onClick={handleSeen}
                disabled={!canProceed}
                className="btn-gold px-10 py-4 rounded-xl font-heading font-bold text-lg transition-all active:scale-[0.97] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
                {canProceed ? '✅ Gördüm, Devam Et' : '⏳ Kartını oku...'}
            </button>
        </div>
    );
}
