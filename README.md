# 🏛️ Philosophy-Based Recommendation Engine Backend

Ölçeklenebilir, modüler ve Clean Architecture / Service-Repository Pattern prensipleri doğrultusunda geliştirilmiş, felsefe tabanlı dinamik öneri ve keşif motoru RESTful API backend'i.

Bu sistem yalnızca statik veri sunmakla kalmaz; kullanıcı kimlik yönetimi, 4 ana felsefi akım haritası (Stoacılık, Varoluşçuluk, Absürdizm, Nihilizm), çoklu medya öneri mekanizması (Kitap, Film, Dizi), kişiselleştirilmiş kütüphane/etkileşim yönetimi ve kullanıcının zihinsel yatkınlığını ölçen ağırlıklı bir Felsefe Testi (Quiz) algoritması sunar.

---

## 🚀 Teknolojik Yığın

- **Çalışma Zamanı & Dil:** Node.js v22+ & TypeScript
- **Web Çatısı:** Express.js
- **Veritabanı & ORM:** PostgreSQL 16 & Prisma ORM
- **Kimlik Doğrulama & Güvenlik:** JWT (Access & Refresh Token Rotasyonu) + bcryptjs + Helmet + CORS
- **Veri Validasyonu:** Zod (Request Body, Query & Params)
- **Konteynerleştirme:** Docker & Docker Compose (Multi-stage build)
- **Mimari:** Katmanlı Mimari (Controller - Service - Repository - Prisma Client)

---

## 📁 Mimari ve Dizin Yapısı

```
.
├── docker-compose.yml          # Postgres + API konteyner orkestrasyonu
├── Dockerfile                  # Multi-stage production build
├── prisma/
│   ├── schema.prisma           # Veritabanı modelleri, enumlar, indeksler
│   └── seed.ts                 # 4 akım, 25+ öneri ve anket verisi tohumlama
└── src/
    ├── @types/                 # Express Request genişletmeleri (req.user)
    ├── config/                 # Env validasyonu (Zod) ve Prisma singleton
    ├── constants/              # HTTP statüleri ve hata kodları
    ├── controllers/            # İstek/yanıt yönetimi
    ├── middlewares/            # JWT Auth, Role Check, Zod Validator, Error Handler
    ├── repositories/           # Veritabanı sorgu ve CRUD katmanı
    ├── routes/                 # Modüler API yönlendirmeleri
    ├── schemas/                # Zod doğrulama şemaları
    ├── services/               # İş mantığı, dinamik paketleme ve quiz algoritması
    ├── utils/                  # ApiError, ApiResponse, JWT, Password yardımcıları
    ├── app.ts                  # Express uygulama konfigürasyonu
    └── server.ts               # Sunucu başlatma ve graceful shutdown
```

---
#### ☀️ Günün Paketi (Daily Inspiration Pack)

- Her gün için deterministik olarak bir felsefe seçer, günün aforizmasını/ilkesini (Daily Tenet) belirler ve 1 Kitap, 1 Film, 1 Dizi'den oluşan ilham paketini sunar.

#### 🔍 Öneri Kataloğu ve Filtreleme

  - Tip, zorluk, felsefe ve metin araması ile sayfalanmış (paginated) liste döner.

---

### 5. Kullanıcı Etkileşimleri & Kişisel Kütüphane (Interactions)

  - Bir içeriği kütüphaneye ekler, durumunu günceller veya puan verir:
  ```json
  {
    "recommendationItemId": "4b68e9be-8b2f-4886-9a25-c63e414c77aa",
    "status": "COMPLETED",
    "rating": 9,
    "notes": "Filmin sonundaki varoluşsal tercih sahnesi muazzamdı."
  }
  ```
  *(Statü seçenekleri: `SAVED`, `COMPLETED`, `DROPPED`)*

  - Kullanıcının kaydettiği veya tamamladığı eserleri listeler.
  - Kullanıcının okuma/izleme alışkanlıklarını, ortalama puanını ve hangi felsefi akımlara ağırlık verdiğini gösteren analitik özeti döner.
  - İlgili içeriği kütüphaneden çıkarır.

---

### 6. Felsefi Yatkınlık Anketi (Quiz & Algoritma)

- **`GET /api/v1/quiz/questions`**
  - Test sorularını ve seçeneklerini döner (Ağırlık puanları istemciden gizlenir).

- **`POST /api/v1/quiz/submit`**
  - Kullanıcının verdiği yanıtları analiz eder, her felsefi akım için ağırlıklı puanları toplar ve baskın akımı yüzdelik oranla belirler. Ayrıca kullanıcıya başlangıç seviyesinde bir **Öneri Paketi** sunar:
  ```json
  {
    "answers": [
      { "questionId": "<uuid-1>", "selectedOptionId": "<option-uuid-1>" },
      { "questionId": "<uuid-2>", "selectedOptionId": "<option-uuid-2>" }
    ]
  }
  ```
  - **Örnek Yanıt:**
  ```json
  {
    "success": true,
    "data": {
      "resultSummary": {
        "dominantPhilosophy": "Varoluşçuluk (Existentialism)",
        "affinityRate": "62%",
        "description": "Varoluşçuluk, insanın kendi seçimleri ve özgür iradesiyle kendi özünü yarattığını savunur..."
      },
      "primaryMatch": { "slug": "existentialism", "percentage": 62, "score": 18 },
      "secondaryMatch": { "slug": "absurdism", "percentage": 24, "score": 7 },
      "fullScoreBreakdown": [ ... ],
      "recommendedStarterPack": {
        "pack": {
          "book": { "title": "Varoluşçuluk Bir İnsancıllıktır", "creator": "Jean-Paul Sartre" },
          "movie": { "title": "The Truman Show", "creator": "Peter Weir" },
          "series": { "title": "BoJack Horseman", "creator": "Raphael Bob-Waksberg" }
        }
      }
    }
  }
  ```

---

## 🛡️ Hata Yakalama (Global Error Handling)

API, standart ve tahmin edilebilir bir hata formatı sunar:
```json
{
  "success": false,
  "errorCode": "VALIDATION_ERROR",
  "message": "Validasyon hatası meydana geldi",
  "details": [
    { "path": "email", "message": "Geçerli bir e-posta adresi giriniz" }
  ]
}
```
Zod şema hataları, Prisma veritabanı kısıtlamaları (P2002 Unique kısıtı vb.), yetkisiz erişimler ve tanımsız uç noktalar otomatik olarak yakalanır ve uygun HTTP statü koduyla istemciye iletilir.

---

## 🧪 Test ve Derleme

```bash
# TypeScript kodunu dist klasörüne derleyin:
npm run build

# Canlı reload ile geliştirme:
npm run dev
```
