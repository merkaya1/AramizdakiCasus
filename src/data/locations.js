// Tüm mekanlar ve rolleri - docs/02-mekanlar-ve-roller.md referans
const locations = [
    {
        id: "airport",
        name: "Havalimanı",
        emoji: "✈️",
        description: "Uluslararası bir havalimanı, uçuşlar kalkmak üzere.",
        roles: ["Pilot", "Hostess", "Gümrük Memuru", "Yolcu", "Bagaj Görevlisi", "Kule Kontrolörü", "Duty-Free Satıcısı"]
    },
    {
        id: "school",
        name: "Okul",
        emoji: "🏫",
        description: "Bir ilköğretim okulu, teneffüs zili henüz çaldı.",
        roles: ["Müdür", "Matematik Öğretmeni", "Öğrenci", "Hademe", "Kantinci", "Beden Eğitimi Öğretmeni", "Rehber Öğretmen"]
    },
    {
        id: "pirate_ship",
        name: "Korsan Gemisi",
        emoji: "🏴‍☠️",
        description: "Açık denizlerde bir korsan gemisi, hazine peşinde.",
        roles: ["Kaptan", "Güverte Tayfası", "Topçu", "Aşçı", "Haritacı", "Doktor", "Esir"]
    },
    {
        id: "space_station",
        name: "Uzay İstasyonu",
        emoji: "🚀",
        description: "Yörüngedeki bir uzay istasyonu, dünya aşağıda parlıyor.",
        roles: ["Komutan", "Pilot", "Bilim İnsanı", "Mühendis", "Doktor", "İletişim Uzmanı", "Stajyer"]
    },
    {
        id: "hospital",
        name: "Hastane",
        emoji: "🏥",
        description: "Yoğun bir devlet hastanesi, acil servis dolu.",
        roles: ["Başhekim", "Cerrah", "Hemşire", "Eczacı", "Hasta", "Ambulans Şoförü", "Laborant"]
    },
    {
        id: "circus",
        name: "Sirk",
        emoji: "🎪",
        description: "Rengârenk bir sirk çadırı, gösteri başlamak üzere.",
        roles: ["Cambaz", "Palyaço", "İllüzyonist", "Hayvan Terbiyecisi", "Ateş Yutucusu", "Biletçi", "Sirk Müdürü"]
    },
    {
        id: "underwater_station",
        name: "Sualtı Araştırma İstasyonu",
        emoji: "🌊",
        description: "Okyanus tabanında bir araştırma tesisi.",
        roles: ["Kaptan", "Oşinograf", "Aşçı", "Temizlikçi", "Stajyer", "Dalgıç", "Teknisyen"]
    },
    {
        id: "wild_west",
        name: "Vahşi Batı Kasabası",
        emoji: "🤠",
        description: "1800'lerde bir Vahşi Batı kasabası, toz bulutu içinde.",
        roles: ["Şerif", "Barmen", "Kovboy", "Mezarcı", "Altın Avcısı", "Piyano Çalan Kişi", "Kasaba Doktoru"]
    },
    {
        id: "medieval_castle",
        name: "Ortaçağ Kalesi",
        emoji: "🏰",
        description: "Devasa bir ortaçağ kalesi, düşman kapıda.",
        roles: ["Kral", "Şövalye", "Büyücü", "Kraliçe", "Okçu", "Demirci", "Ulak"]
    },
    {
        id: "film_set",
        name: "Film Seti",
        emoji: "🎬",
        description: "Hollywood'da devasa bir film seti, kamera çekimleri sürüyor.",
        roles: ["Yönetmen", "Başrol Oyuncusu", "Kameraman", "Makyajcı", "Senarist", "Dublör", "Yapımcı"]
    },
    {
        id: "casino",
        name: "Kumarhane",
        emoji: "🎰",
        description: "Las Vegas'ta lüks bir kumarhane, bahisler yüksek.",
        roles: ["Krupiye", "Güvenlik Şefi", "Barmen", "Zengin Müşteri", "Poker Oyuncusu", "Garson", "Kumarhane Müdürü"]
    },
    {
        id: "stadium",
        name: "Futbol Stadyumu",
        emoji: "🏟️",
        description: "50.000 kişilik bir stadyum, derbi maçı başlamak üzere.",
        roles: ["Kaleci", "Forvet", "Teknik Direktör", "Hakem", "Spiker", "Taraftar", "Saha Doktoru"]
    },
    {
        id: "orient_express",
        name: "Orient Ekspres",
        emoji: "🚂",
        description: "1930'larda Orient Ekspres treni, yolculuk devam ediyor.",
        roles: ["Makinist", "Kondüktör", "Garson", "Zengin Yolcu", "Dedektif", "Hostes", "Aşçıbaşı"]
    },
    {
        id: "desert_island",
        name: "Issız Ada",
        emoji: "🏝️",
        description: "Tropik bir ıssız ada, kurtarma bekleniyor.",
        roles: ["Hayatta Kalan Kaptan", "Doktor", "Avcı", "Mühendis", "Aşçı", "Balıkçı", "Sinyal Gözcüsü"]
    },
    {
        id: "theater",
        name: "Tiyatro",
        emoji: "🎭",
        description: "Büyük bir tiyatro sahnesi, perde açılmak üzere.",
        roles: ["Başrol Oyuncusu", "Yönetmen", "Işıkçı", "Sesçi", "Kostümcü", "Suflör", "Seyirci"]
    },
    {
        id: "cruise_ship",
        name: "Cruise Gemisi",
        emoji: "🛳️",
        description: "Lüks bir cruise gemisi, açık denizde eğlence dolu.",
        roles: ["Kaptan", "Eğlence Müdürü", "Şef Aşçı", "Barmen", "Cankurtaran", "Kamaraman", "Müzisyen"]
    },
    {
        id: "secret_lab",
        name: "Gizli Laboratuvar",
        emoji: "🔬",
        description: "Dağların altında gizli bir araştırma laboratuvarı.",
        roles: ["Baş Bilim İnsanı", "Güvenlik Görevlisi", "Deney Kobayı", "Laborant", "Temizlikçi", "IT Uzmanı", "Proje Müdürü"]
    },
    {
        id: "pyramid",
        name: "Antik Mısır Piramidi",
        emoji: "🏜️",
        description: "Bir piramidin derinliklerinde, arkeolojik kazı yapılıyor.",
        roles: ["Arkeolog", "Firavun", "Rehber", "Fotoğrafçı", "İşçi", "Mümyacı", "Finansör"]
    },
    {
        id: "italian_restaurant",
        name: "İtalyan Restoranı",
        emoji: "🍕",
        description: "Küçük bir İtalyan aile restoranı, akşam yemeği servisi yoğun.",
        roles: ["Şef Aşçı", "Garson", "Patron", "Bulaşıkçı", "Pizzacı", "Sommelier", "Müşteri"]
    },
    {
        id: "everest",
        name: "Everest Dağı Kampı",
        emoji: "🏔️",
        description: "Everest'in zirvesine yakın bir üs kamp, fırtına yaklaşıyor.",
        roles: ["Dağcı Lider", "Şerpa", "Doktor", "Meteorolog", "Fotoğrafçı", "Aşçı", "Acemi Dağcı"]
    },
    {
        id: "ottoman_palace",
        name: "Osmanlı Sarayı",
        emoji: "🕌",
        description: "Osmanlı İmparatorluğu'nda görkemli saray, entrikalar dönüyor.",
        roles: ["Padişah", "Sadrazam", "Valide Sultan", "Yeniçeri Ağası", "Saray Aşçıbaşı", "Harem Ağası", "Elçi"]
    },
    {
        id: "antarctica",
        name: "Antarktika Araştırma Üssü",
        emoji: "🧊",
        description: "Buz kaplı Antarktika'da bir araştırma üssü, dış sıcaklık -40°C.",
        roles: ["Üs Komutanı", "Buzul Bilimci", "İletişim Teknisyeni", "Aşçı", "Mekanik", "Biyolog", "Pilot"]
    },
    {
        id: "rock_concert",
        name: "Rock Konseri",
        emoji: "🎸",
        description: "Devasa bir açık hava rock festivali, sahne ışıkları yanıyor.",
        roles: ["Vokal", "Gitarist", "Davulcu", "Sahne Amiri", "Ses Mühendisi", "Güvenlik", "Hayran"]
    },
    {
        id: "bank",
        name: "Banka",
        emoji: "🏦",
        description: "Büyük bir bankanın merkez şubesi, yoğun iş günü.",
        roles: ["Müdür", "Veznedar", "Güvenlik Görevlisi", "Müşteri", "Kredi Uzmanı", "Temizlikçi", "BT Destek Uzmanı"]
    },
    {
        id: "spaceship",
        name: "Uzay Gemisi",
        emoji: "🌌",
        description: "Galaksiler arası bir uzay gemisi, bilinmeyen bir gezegene doğru yol alıyor.",
        roles: ["Kaptan", "Navigatör", "Silah Subayı", "Mühendis", "Doktor", "Android", "Yabancı Tür Uzmanı"]
    }
];

export default locations;
