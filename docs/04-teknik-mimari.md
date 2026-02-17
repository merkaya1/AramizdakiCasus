# 🏗️ Aramızdaki Casus - Teknik Mimari

## 1. Teknoloji Stack

| Katman | Teknoloji | Neden? |
|--------|-----------|--------|
| **Frontend** | React (Vite) | Component-based, hızlı geliştirme |
| **Styling** | Tailwind CSS v4 | CSS-first config, utility-first |
| **State** | React Context + useReducer | Basit, yeterli |
| **Backend** | Firebase (Serverless) | Real-time sync, ücretsiz tier |
| **Database** | Cloud Firestore | Real-time listeners |
| **Auth** | Firebase Anonymous Auth | Kayıt gerektirmez |
| **Functions** | Firebase Cloud Functions | Güvenli rol dağıtımı |
| **Hosting** | Firebase Hosting | Ücretsiz, hızlı deploy |

---

## 2. Proje Yapısı

```
AramizdakiCasus/
├── docs/                          # İş kuralları dökümanları
├── public/                        # Statik dosyalar
├── src/
│   ├── components/                # React bileşenleri
│   │   ├── screens/               # Ekran bileşenleri
│   │   │   ├── MenuScreen.jsx
│   │   │   ├── LobbyScreen.jsx
│   │   │   ├── RoleRevealScreen.jsx
│   │   │   ├── InterrogationScreen.jsx
│   │   │   ├── VotingScreen.jsx
│   │   │   ├── SpyGuessScreen.jsx
│   │   │   └── GameOverScreen.jsx
│   │   └── ui/                    # Paylaşılan UI bileşenleri
│   │       ├── Button.jsx
│   │       ├── Card.jsx
│   │       ├── Timer.jsx
│   │       ├── PlayerList.jsx
│   │       ├── Modal.jsx
│   │       └── Toast.jsx
│   ├── context/                   # State yönetimi
│   │   └── GameContext.jsx
│   ├── hooks/                     # Custom hooks
│   │   ├── useRoom.js
│   │   ├── useTimer.js
│   │   └── useFirebase.js
│   ├── services/                  # Firebase servisleri
│   │   ├── roomService.js
│   │   ├── gameService.js
│   │   └── authService.js
│   ├── data/                      # Statik veri
│   │   └── locations.js
│   ├── utils/                     # Yardımcı fonksiyonlar
│   │   └── helpers.js
│   ├── firebase.js                # Firebase config
│   ├── App.jsx                    # Ana uygulama
│   ├── main.jsx                   # Entry point
│   └── index.css                  # Tailwind v4 imports + custom theme
├── index.html
├── vite.config.js
├── package.json
└── .gitignore
```

---

## 3. Firestore Veri Modeli

```
rooms/{roomId}
├── roomCode: "A7B2"
├── hostId: "player_uid_123"
├── status: "lobby" | "role_reveal" | "interrogation" | "voting" | "spy_guess" | "game_over"
├── createdAt: Timestamp
├── settings: { roundDuration: 300, maxPlayers: 12 }
├── currentLocation: null | "airport"
├── spyIds: []
├── currentAsker: null | "player_uid"
├── roundStartTime: null | Timestamp
├── votes: { playerId: votedForPlayerId }
├── gameResult: null | { winner, reason, ... }
│
├── players/{playerId}              (Alt Koleksiyon)
│   ├── name: "Ahmet"
│   ├── joinedAt: Timestamp
│   ├── isHost: boolean
│   ├── isConnected: boolean
│   ├── hasSeenRole: boolean
│   ├── hasVoted: boolean
│   ├── votedFor: null | playerId
│   └── lastActive: Timestamp
│
│   └── private/role               (Gizli Alt Döküman)
│       ├── role: "Pilot" | null
│       └── isSpy: boolean
```

**Mekanlar** statik olduğundan `src/data/locations.js` dosyasında client-side tutulur.

---

## 4. Security Rules (Özet)

- Her oyuncu **sadece kendi** `private/role` dökümanını okuyabilir.
- `currentLocation` ve `spyIds` alanları **sadece Cloud Functions** yazabilir.
- Oyuncu sadece üye olduğu odayı okuyabilir.
- Oyuncuları sadece Host çıkarabilir.
- Oy, sadece oylama durumunda verilebilir.

---

## 5. Cloud Functions

| Fonksiyon | Tetikleyici | İşlem |
|-----------|-------------|-------|
| `startGame` | Host HTTP call | Mekan seç, casus ata, roller dağıt, status → role_reveal |
| `castVote` | Oyuncu HTTP call | Oy kaydet, tüm oylar tamam mı kontrol et |
| `spyGuess` | Casus HTTP call | Mekan tahmini, doğru/yanlış → game_over |
| `calculateResults` | castVote tetikler | Oyları say, kazananı belirle |
| `nextTurn` | Oyuncu HTTP call | Soru sırasını güncelle |
| `cleanupRooms` | Scheduled (1 saat) | 2+ saat eski odaları sil |

---

## 6. Real-Time Listeners (React Hooks)

```jsx
// useRoom.js - Oda durumunu dinle
useEffect(() => {
  const unsubRoom = onSnapshot(doc(db, `rooms/${roomId}`), handleRoomUpdate);
  const unsubPlayers = onSnapshot(
    collection(db, `rooms/${roomId}/players`),
    handlePlayersUpdate
  );
  return () => { unsubRoom(); unsubPlayers(); };
}, [roomId]);
```

---

## 7. Güvenlik

| Tehdit | Çözüm |
|--------|-------|
| Casus başkasının rolünü okur | Security Rules: private/role |
| Timer manipülasyonu | Server timestamp |
| Çoklu oy | Cloud Function kontrolü |
| Brute-force oda kodu | Rate limiting |

---

## 8. Maliyet (Firebase Free Tier)

Ekip içi kullanım (~10 oyun/gün) Free Tier'ı rahatça karşılar:
- 50K okuma/gün, 20K yazma/gün, 2M function/ay.
