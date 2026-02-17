# Aramızdaki Casus

Spyfall benzeri gerçek zamanlı çok oyunculu web tabanlı parti oyunu.

## Oyun Hakkında

Herkese gizli bir mekan ve rol verilir, ama aralarında bir **casus** vardır. Casus mekanı bilmez! Oyuncular birbirlerine sorular sorarak casusu bulmaya çalışırken, casus da konuşmalardan mekanı anlamaya çalışır.

### Özellikler

- 3-12 oyuncu desteği (8+ oyuncuda 2 casus)
- 25 farklı mekan, her biri 7 benzersiz rol ile
- Gerçek zamanlı senkronizasyon (Firestore)
- Soru geçmişi takibi
- Oylama sistemi (kimin kime oy verdiği görünür)
- Casus yakalanırsa son tahmin hakkı
- Mobil uyumlu tasarım
- Karanlık tema, glassmorphism UI

## Teknoloji

- **Frontend:** React 19 + Vite
- **Styling:** Tailwind CSS v4
- **Backend:** Firebase (Firestore, Anonymous Auth)
- **State Management:** React Context + useReducer
- **Real-time:** Firestore onSnapshot listeners

## Kurulum

```bash
# Repo'yu klonla
git clone https://github.com/merkaya1/AramizdakiCasus.git
cd AramizdakiCasus

# Bağımlılıkları kur
npm install

# .env dosyasını oluştur
cp .env.example .env
# .env dosyasına kendi Firebase config bilgilerini ekle

# Geliştirme sunucusunu başlat
npm run dev
```

## Firebase Kurulumu

1. [Firebase Console](https://console.firebase.google.com/)'dan yeni proje oluştur
2. **Authentication** > Sign-in method > Anonymous Auth'u aç
3. **Firestore Database** oluştur
4. Firebase config bilgilerini `.env` dosyasına ekle
5. Firestore Security Rules'ı `firestore.rules` dosyasından kopyalayıp uygula

## Oyun Akışı

```
Ana Menü → Lobi → Rol Dağılımı → Soru-Cevap → Oylama → (Casus Tahmini) → Sonuç
```

1. **Lobi:** Host oda kurar, diğerleri kodla katılır
2. **Rol Dağılımı:** Herkes kartını gizlice görür
3. **Soru-Cevap:** Sırayla birbirine soru sorulur
4. **Oylama:** Casus olduğu düşünülen kişi oylanır
5. **Son Tahmin:** Casus yakalanırsa mekanı tahmin edebilir
6. **Sonuç:** Kazanan açıklanır, roller görünür

## Lisans

MIT
