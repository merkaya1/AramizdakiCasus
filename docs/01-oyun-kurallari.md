# 🕵️ Aramızdaki Casus - Oyun Kuralları ve Mekanikler

## 1. Oyun Genel Bakış

**Aramızdaki Casus**, 4-12 kişi arasında oynanan bir sosyal çıkarım oyunudur. Oyuncuların çoğu aynı gizli mekanı bilir ve belirli roller üstlenir. Aralarındaki **casus** ise mekanı bilmez ve diğerlerinin konuşmalarından ipucu toplamaya çalışır.

---

## 2. Oyuncu Gereksinimleri

| Kural | Değer |
|-------|-------|
| **Minimum oyuncu** | 4 |
| **Maksimum oyuncu** | 12 |
| **Casus sayısı (≤8 oyuncu)** | 1 |
| **Casus sayısı (>8 oyuncu)** | 2 |

---

## 3. Oyun Aşamaları

### 3.1 Oda Kurma (Lobby Phase)

1. Bir oyuncu **"Oda Kur"** butonuna tıklar.
2. Sistem **4 haneli alfanumerik** bir oda kodu oluşturur (Örn: `A7B2`).
3. Oda kuran kişi otomatik olarak **Host** (Oda Sahibi) olur.
4. Diğer oyuncular oda kodunu girerek katılır.
5. Host, lobide tüm oyuncuları görebilir.
6. Host, minimum 4 oyuncu olduğunda **"Oyunu Başlat"** butonuna tıklayabilir.

**Host Yetkileri:**
- Oyunu başlatma
- Oyuncuyu odadan çıkarma
- Tur süresini ayarlama (3 / 5 / 8 dakika)
- Oyunu sonlandırma

### 3.2 Rol Dağıtımı (Role Assignment Phase)

1. Sistem mevcut mekan setlerinden **rastgele bir mekan** seçer.
2. Her mekanın kendine özgü **5-7 adet rolü** vardır.
3. Oyuncular rastgele olarak roller ve casus ataması yapılır:
   - **Casus olmayan oyuncular:** Mekan adı + Rol gösterilir.
   - **Casus olan oyuncular:** Sadece **"SEN CASUSSUN! 🕵️"** mesajı gösterilir.
4. Rol kartı, oyuncunun kendi ekranında **5 saniye** boyunca büyük gösterilir.
5. Oyuncu kartını gördükten sonra **"Gördüm"** butonuna tıklar.
6. Tüm oyuncular kartını gördükten sonra **Soru-Cevap turu** başlar.

**Rol Dağıtım Kuralları:**
- 2 casus varsa, ikisi de casusluğunu bilir ama birbirlerini bilmez.
- Aynı rol birden fazla oyuncuya verilemez.
- Casus seçimi tamamen rastgeledir.

### 3.3 Soru-Cevap Turu (Interrogation Phase)

1. Host'un belirlediği süre ile bir **geri sayım zamanlayıcısı** başlar.
2. İlk soru sorma hakkı **rastgele bir oyuncuya** verilir.
3. Soru soran oyuncu, **herhangi bir başka oyuncunun ismini seçer** ve ona soru sorar.
4. Soru sorulan oyuncu cevap verdikten sonra, **soru soranı hariç tutarak** başka birine soru sorma hakkı kazanır.
5. Bu döngü süre dolana kadar devam eder.

**Kurallar:**
- Soru ve cevaplar **sözel/sözlü** olarak yapılır (oyun yüz yüze veya sesli oynandığı için chat sistemi yoktur).
- Uygulama sadece **kimin kime soru sorduğunu** ve **sırayı** takip eder.
- Her oyuncu tur boyunca **en az 1 kez** soru sorma fırsatı bulmalıdır (sistem bunu garantilemez ama önerilir).
- Oyuncular mekana doğrudan ismiyle bahsedemez, bu yasaktır.

### 3.4 Acil Toplantı (Emergency Meeting) - Opsiyonel

- Herhangi bir oyuncu süre dolmadan **"Acil Toplantı!"** butonuna basabilir.
- Bu, oylamayı süre dolmadan başlatır.
- Acil toplantı çağırmak için **en az 2 oyuncunun** onay vermesi gerekir (troll engeli).

### 3.5 Casus'un Tahmin Hakkı (Spy Guess)

- **Süre boyunca herhangi bir anda**, casus kendi ekranında **"Mekanı Tahmin Et"** butonuna basabilir.
- Casus, mevcut mekan listesinden birini seçer.
- **Doğru tahmin:** Casus anında kazanır! Oyun biter.
- **Yanlış tahmin:** Casus deşifre olur ve elenir (masa oyunundaki gibi), oylama yapılmaz, masumlar kazanır.

### 3.6 Oylama (Voting Phase)

1. Süre dolduğunda veya acil toplantı onaylandığında oylama başlar.
2. Tüm oyuncuların ekranında **oyuncu listesi** görünür.
3. Her oyuncu, casusu olduğunu düşündüğü kişiyi seçer.
4. Herkes oyunu verdikten sonra (veya 30 saniyelik oylama süresi dolduktan sonra) sonuçlar açıklanır.
5. **En çok oyu alan oyuncu** "sanık" olur.
6. Eşitlik durumunda **kimse seçilmez** ve casus kazanır.

### 3.7 Oyunun Sonu (Game End)

**Üç olası senaryo:**

| Senaryo | Kazanan | Detay |
|---------|---------|-------|
| Casus doğru oylanır + Mekanı bilemez | ✅ Masumlar | Casus yakalandı ve beklenen ceza verildi |
| Casus doğru oylanır + Mekanı bilir | ✅ Casus | Casus son anda kozunu oynadı |
| Yanlış kişi oylanır | ✅ Casus | Masum biri suçlandı |
| Casus mekanı süre içinde tahmin eder | ✅ Casus | Casus erken tahmin hakkını kullandı |
| Casus mekanı süre içinde yanlış tahmin eder | ✅ Masumlar | Casus kendi kendini deşifre etti |

> **2 Casuslu Oyunda:** Her iki casusun da yakalanması gerekir. Sadece biri yakalanırsa, diğer casus hâlâ aktiftir ve burada 2 tur oylama yapılır. İlk tur sonucu açıklandıktan sonra, eğer casus yakalandıysa ikinci bir oylama yapılır.

---

## 4. Puan Sistemi (Opsiyonel)

Birden fazla tur oynamak isteyenler için:

| Durum | Puan |
|-------|------|
| Masumlar casusu yakalar + Casus mekanı bilemez | Masumlar: +2 her biri |
| Masumlar casusu yakalar + Casus mekanı bilir | Casus: +4 |
| Yanlış kişi oylanır | Casus: +4 |
| Casus mekanı erken tahmin eder (doğru) | Casus: +4 |
| Casus mekanı erken tahmin eder (yanlış) | Masumlar: +2 her biri |

---

## 5. Tur Tekrarı

Oyun sonunda, Host iki seçeneğe sahiptir:
1. **"Tekrar Oyna"**: Aynı oyuncularla yeni bir tur başlatır (yeni mekan + yeni roller).
2. **"Lobiye Dön"**: Tüm oyuncular lobiye geri döner (ayar değişikliği yapılabilir).

---

## 6. Oyun İçi Yasaklar ve Kurallar

- Hiçbir oyuncu mekanın ismini açıkça söyleyemez.
- Casus, casus olduğunu gönüllü olarak açıklayamaz (sadece mekan tahmini yapabilir).
- Oyuncular kart ekranlarını birbirlerine gösteremez.
- AFK (Away From Keyboard) oyuncular 60 saniye sonra uyarılır, 120 saniye sonra oyundan atılır.
