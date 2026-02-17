/**
 * Yardımcı fonksiyonlar
 */

// 4 haneli alfanumerik oda kodu üret
export function generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Karıştırılabilecek karakterler çıkarıldı (0,O,1,I)
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Rastgele avatar rengi
const avatarColors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
    'bg-yellow-500', 'bg-red-500', 'bg-indigo-500', 'bg-teal-500',
    'bg-orange-500', 'bg-cyan-500', 'bg-rose-500', 'bg-emerald-500',
];

export function getAvatarColor(index) {
    return avatarColors[index % avatarColors.length];
}

// İsmin baş harflerini al
export function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

// Saniyeyi MM:SS formatına çevir
export function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// Diziyi karıştır (Fisher-Yates)
export function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Casus sayısını belirle
export function getSpyCount(playerCount) {
    return playerCount > 8 ? 2 : 1;
}
