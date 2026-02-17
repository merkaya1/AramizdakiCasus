import { useState, useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import locations from '../../data/locations';

export default function SpyGuessScreen() {
    const { state, makeSpyGuess, addToast } = useGame();
    const { player, room } = state;
    const SPY_GUESS_DURATION = 30;
    const [selectedGuess, setSelectedGuess] = useState(null);
    const timeoutHandled = useRef(false);

    const getInitialTimeLeft = () => {
        if (room.roundStartTime?.seconds) {
            const elapsed = Math.floor(Date.now() / 1000) - room.roundStartTime.seconds;
            return Math.max(0, SPY_GUESS_DURATION - elapsed);
        }
        return SPY_GUESS_DURATION;
    };

    const [timeLeft, setTimeLeft] = useState(getInitialTimeLeft);

    // Timer: Casus tahmin yapamazsa masumlar kazanır
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    if (!timeoutHandled.current && player.isSpy) {
                        timeoutHandled.current = true;
                        // Süre doldu, boş bir tahmin gönder (masumlar kazanır)
                        makeSpyGuess('__timeout__');
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [player.isSpy, makeSpyGuess]);

    const handleGuess = async (locId) => {
        if (selectedGuess) return; // Çift tıklama engeli
        setSelectedGuess(locId);
        timeoutHandled.current = true;

        try {
            await makeSpyGuess(locId);
        } catch (err) {
            addToast(err.message, 'error');
            setSelectedGuess(null);
            timeoutHandled.current = false;
        }
    };

    const isSpy = player.isSpy;

    // Eğer casus değilsek, bekleme ekranı göster
    if (!isSpy) {
        return (
            <div className="w-full min-h-dvh flex flex-col items-center justify-center px-4 animate-fade-in text-center">
                <span className="text-6xl animate-bounce mb-4">🕵️</span>
                <h2 className="text-2xl font-heading font-black text-danger mb-2">
                    Casus Yakalandı!
                </h2>
                <p className="text-gray-400">
                    Ama son bir şansı var... Mekanı tahmin etmeye çalışıyor.
                </p>
                <div className="mt-8 text-gold font-bold text-4xl animate-pulse">
                    {timeLeft}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full min-h-dvh flex flex-col items-center px-4 py-6 animate-fade-in">
            <div className="absolute top-4 right-4 text-danger font-bold text-xl animate-pulse">
                {timeLeft}
            </div>

            <h2 className="text-3xl font-heading font-black text-center text-danger mb-1 animate-shimmer">
                SON ŞANSIN! 🎯
            </h2>
            <p className="text-gray-400 text-center text-xs mb-6">
                Yakalandın! Kazanmak için mekanı doğru tahmin etmelisin.
            </p>

            {/* Locations Grid */}
            <div className="grid grid-cols-2 gap-2 w-full max-w-sm overflow-y-auto max-h-[70vh] pb-20">
                {locations.map(loc => (
                    <button
                        key={loc.id}
                        onClick={() => handleGuess(loc.id)}
                        className={`flex items-center gap-2 p-3 rounded-xl border transition-all cursor-pointer text-left group hover:bg-gold/5 ${selectedGuess === loc.id
                                ? 'bg-danger/20 border-danger shadow-[0_0_15px_rgba(230,57,70,0.3)] scale-[.98]'
                                : 'glass border-white/5 hover:border-gold/30'
                            }`}
                    >
                        <span className="text-2xl group-hover:scale-110 transition-transform">
                            {loc.emoji}
                        </span>
                        <span className="font-medium text-xs text-gray-300 group-hover:text-gold transition-colors">
                            {loc.name}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}
