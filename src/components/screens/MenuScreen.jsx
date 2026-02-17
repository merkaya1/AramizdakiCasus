import { useState } from 'react';
import { useGame } from '../../context/GameContext';

export default function MenuScreen() {
    const { createRoom, joinRoom, addToast } = useGame();
    const [showJoin, setShowJoin] = useState(false);
    const [showRules, setShowRules] = useState(false);
    const [name, setName] = useState(localStorage.getItem('playerName') || '');
    const [joinCode, setJoinCode] = useState('');

    const handleCreateRoom = async () => {
        if (!name.trim()) {
            addToast('Lütfen bir isim girin!', 'error');
            return;
        }
        await createRoom(name.trim());
    };

    const handleJoinRoom = async () => {
        if (!name.trim()) {
            addToast('Lütfen bir isim girin!', 'error');
            return;
        }
        if (joinCode.length !== 4) {
            addToast('Oda kodu 4 karakter olmalı!', 'error');
            return;
        }
        await joinRoom(joinCode.toUpperCase(), name.trim());
    };

    return (
        <div className="w-full min-h-dvh flex flex-col items-center justify-center px-4 py-8 animate-fade-in">
            {/* Logo */}
            <div className="text-center mb-10">
                <span className="text-7xl block animate-float">🕵️</span>
                <h1 className="text-gradient-gold text-4xl font-black mt-4 font-heading tracking-tight">
                    Aramızdaki Casus
                </h1>
                <p className="text-gray-400 mt-2 text-sm">
                    Casusu bul, ama mekanı açık etme!
                </p>
            </div>

            {/* Name Input */}
            <div className="w-full max-w-sm mb-6">
                <label className="text-xs text-gray-500 mb-1 block">Oyuncu Adın</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="İsmini gir..."
                    maxLength={20}
                    className="w-full px-4 py-3.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-white placeholder-gray-600 outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(255,215,0,0.1)] transition-all font-body"
                />
            </div>

            {/* Main Buttons */}
            {!showJoin ? (
                <div className="w-full max-w-sm flex flex-col gap-3">
                    <button
                        onClick={handleCreateRoom}
                        className="btn-gold w-full py-4 rounded-xl font-heading font-bold text-lg transition-all active:scale-[0.97] cursor-pointer"
                    >
                        🏠 Oda Kur
                    </button>
                    <button
                        onClick={() => setShowJoin(true)}
                        className="glass glass-hover w-full py-4 rounded-xl font-heading font-semibold text-gray-200 transition-all active:scale-[0.97] cursor-pointer"
                    >
                        🔗 Odaya Katıl
                    </button>
                    <button
                        onClick={() => setShowRules(true)}
                        className="text-gray-500 hover:text-gray-300 text-sm mt-2 transition-colors cursor-pointer"
                    >
                        📖 Nasıl Oynanır?
                    </button>
                </div>
            ) : (
                /* Join Room Panel */
                <div className="w-full max-w-sm flex flex-col gap-3 animate-slide-up">
                    <input
                        type="text"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 4))}
                        placeholder="Oda Kodu"
                        maxLength={4}
                        className="w-full px-4 py-4 bg-white/[0.04] border border-gold/30 rounded-xl text-gold text-center text-3xl font-heading font-black tracking-[12px] placeholder-gray-600 outline-none focus:border-gold focus:shadow-[0_0_0_3px_rgba(255,215,0,0.1)] transition-all uppercase"
                    />
                    <button
                        onClick={handleJoinRoom}
                        className="btn-gold w-full py-4 rounded-xl font-heading font-bold text-lg transition-all active:scale-[0.97] cursor-pointer"
                    >
                        Katıl
                    </button>
                    <button
                        onClick={() => setShowJoin(false)}
                        className="text-gray-500 hover:text-gray-300 text-sm transition-colors cursor-pointer"
                    >
                        ← Geri
                    </button>
                </div>
            )}

            {/* Rules Modal */}
            {showRules && (
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setShowRules(false)}
                >
                    <div
                        className="bg-spy-card border border-white/[0.06] rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto animate-slide-up"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="font-heading font-bold text-xl text-gold mb-4">📖 Nasıl Oynanır?</h2>

                        <div className="space-y-4 text-sm text-gray-300 leading-relaxed">
                            <div>
                                <h3 className="font-heading font-semibold text-white mb-1">🎯 Amaç</h3>
                                <p>Herkes bir mekan bilir, ama aralarında bir <span className="text-danger font-semibold">casus</span> var! Casus mekanı bilmez.</p>
                            </div>

                            <div>
                                <h3 className="font-heading font-semibold text-white mb-1">🃏 Kartlar</h3>
                                <p><span className="text-innocent">Masumlar:</span> Mekanı ve rolünü görür.<br />
                                    <span className="text-danger">Casus:</span> Sadece "SEN CASUSSUN!" yazar.</p>
                            </div>

                            <div>
                                <h3 className="font-heading font-semibold text-white mb-1">🎤 Soru-Cevap</h3>
                                <p>Sırayla birbirinize sorular sorun. Casusa ipucu vermeden, kimin casus olduğunu anlamaya çalışın.</p>
                            </div>

                            <div>
                                <h3 className="font-heading font-semibold text-white mb-1">🗳️ Oylama</h3>
                                <p>Süre dolunca casusu oylamayla seçin. Doğru bilirseniz masumlar, yanlış bilirseniz casus kazanır!</p>
                            </div>

                            <div>
                                <h3 className="font-heading font-semibold text-white mb-1">🕵️ Son Tahmin</h3>
                                <p>Casus yakalanırsa, mekanı doğru bilirse yine kazanabilir!</p>
                            </div>

                            <div>
                                <h3 className="font-heading font-semibold text-white mb-1">👥 Oyuncu Sayısı</h3>
                                <p>3-12 kişi. 8+ kişide <span className="text-danger font-semibold">2 casus</span> olur!</p>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowRules(false)}
                            className="btn-gold w-full py-3 rounded-xl font-heading font-bold mt-6 transition-all active:scale-[0.97] cursor-pointer"
                        >
                            Anladım!
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
