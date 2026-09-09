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

## 🛠️ Hızlı Kurulum ve Başlatma

### Yöntem 1: Docker Compose ile Tek Komutta Çalıştırma (Önerilen)

```bash
# Servisleri ayağa kaldırın (Postgres + Node.js API)
docker-compose up --build -d

# Logları takip etmek için:
docker-compose logs -f api
```

API `http://localhost:5000` adresinde kullanıma hazır olacaktır.

### Yöntem 2: Yerel Geliştirme (Local Development)

1. **Bağımlılıkları Yükleyin:**
   ```bash
   npm install
   ```

2. **Çevre Değişkenlerini Tanımlayın:**
   `.env.example` dosyasını `.env` olarak kopyalayın ve PostgreSQL bağlantı adresinizi güncelleyin:
   ```bash
   cp .env.example .env
   ```

3. **Prisma Şemasını Senkronize Edin ve Tohum Verileri (Seed) Ekleyin:**
   ```bash
   # Şemayı veritabanına yansıtın
   npx prisma db push

   # Zengin başlangıç verilerini yükleyin (Stoacılık, Varoluşçuluk, vb.)
   npx prisma db seed
   ```

4. **Geliştirme Sunucusunu Başlatın:**
   ```bash
   npm run dev
   ```

---

## 🔑 Varsayılan Tohum Kullanıcıları (Seed Users)

Veritabanı tohumlandığında aşağıdaki hesaplar hazır gelir:

| Rol | E-Posta | Kullanıcı Adı | Şifre |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@philosophy.local` | `admin` | `Admin123!@#` |
| **USER** | `demo@philosophy.local` | `demouser` | `User123!@#` |

---

## 📡 API Uç Noktaları (Endpoints) & Kullanım Örnekleri

Tüm API uç noktaları `/api/v1` önekiyle çalışır.

### 1. Sistem Sağlık Kontrolü (Health Check)
- **`GET /api/v1/health`**
  ```json
  {
    "success": true,
    "data": {
      "status": "healthy",
      "timestamp": "2026-09-07T13:45:00.000Z",
      "service": "philosophy-recommendation-engine-backend"
    }
  }
  ```

---

### 2. Kimlik Doğrulama (Auth)

- **`POST /api/v1/auth/register`**
  - **Body:** `{ "email": "user@example.com", "username": "aristoteles", "password": "Password123!" }`
  - **Dönüş:** Access Token, Refresh Token ve Kullanıcı profili.

- **`POST /api/v1/auth/login`**
  - **Body:** `{ "identifier": "admin", "password": "Admin123!@#" }`
  - **Dönüş:** Access & Refresh Token çifti.

- **`POST /api/v1/auth/refresh`**
  - **Body:** `{ "refreshToken": "<token>" }`
  - **Dönüş:** Rotasyona tabi tutulmuş yeni Access & Refresh Token çifti.

- **`GET /api/v1/auth/me`**
  - **Header:** `Authorization: Bearer <access_token>`
  - **Dönüş:** Aktif kullanıcının profil bilgileri.

---

### 3. Felsefi Akımlar (Philosophy)

- **`GET /api/v1/philosophies`**
  - Tüm akımları (`Stoacılık`, `Varoluşçuluk`, `Absürdizm`, `Nihilizm`), ana ilkelerini ve öneri sayılarını döner.

- **`GET /api/v1/philosophies/:slug?difficultyLevel=BEGINNER`**
  - İlgili akımın detaylarını, felsefi ilkelerini ve zorluk derecesine göre filtrelenmiş öneri içeriklerini döner.

- **`POST /api/v1/philosophies`** *(Admin Only)*
  - Yeni akım ekleme (Zod ile valide edilir).

- **`PUT /api/v1/philosophies/:id`** *(Admin Only)*
  - Akım güncelleme.

- **`DELETE /api/v1/philosophies/:id`** *(Admin Only)*
  - Akım silme.

---

### 4. Öneri Motoru (Recommendations)

#### 🎯 Dinamik Paket Getir (Dynamic Pack)
- **`GET /api/v1/recommendations/pack?philosophy=stoicism&level=BEGINNER`**
- Belirtilen akım ve zorluk seviyesine göre **1 Kitap + 1 Film + 1 Dizi**'den oluşan dengeli bir kültür paketi oluşturur:
  ```json
  {
    "success": true,
    "message": "Dinamik felsefi öneri paketi başarıyla hazırlandı",
    "data": {
      "philosophy": {
        "name": "Stoacılık (Stoicism)",
        "slug": "stoicism",
        "era": "Antik Çağ (MÖ 3. Yüzyıl - MS 2. Yüzyıl)",
        "coreTenets": [
          "Kontrol İkilemi: Yalnızca kendi düşünce ve tepkilerini kontrol edebilirsin.",
          "Amor Fati: Başına gelen her şeyi kabullen ve sev.",
          "Memento Mori: Ölümlü olduğunu hatırla."
        ]
      },
      "requestedLevel": "BEGINNER",
      "pack": {
        "book": {
          "title": "Kendime Düşünceler",
          "creator": "Marcus Aurelius",
          "releaseYear": 180,
          "summary": "İçsel huzur ve kontrol ikilemini işleyen antik bilgelik günlüğü."
        },
        "movie": {
          "title": "The Martian",
          "creator": "Ridley Scott",
          "releaseYear": 2015,
          "summary": "Sadece çözebileceği adımlara odaklanan modern bir Stoacı anlatı."
        },
        "series": {
          "title": "Star Trek: The Next Generation",
          "creator": "Gene Roddenberry",
          "releaseYear": 1987,
          "summary": "Kaptan Picard'ın soğukkanlılığı ve adil liderliği."
        }
      },
      "hasCompletePack": true
    }
  }
  ```

#### ☀️ Günün Paketi (Daily Inspiration Pack)
- **`GET /api/v1/recommendations/daily`**
- Her gün için deterministik olarak bir felsefe seçer, günün aforizmasını/ilkesini (Daily Tenet) belirler ve 1 Kitap, 1 Film, 1 Dizi'den oluşan ilham paketini sunar.

#### 🔍 Öneri Kataloğu ve Filtreleme
- **`GET /api/v1/recommendations?type=MOVIE&difficultyLevel=INTERMEDIATE&search=blade`**
  - Tip, zorluk, felsefe ve metin araması ile sayfalanmış (paginated) liste döner.

---

### 5. Kullanıcı Etkileşimleri & Kişisel Kütüphane (Interactions)

*(Tüm isteklerde `Authorization: Bearer <token>` gereklidir)*

- **`POST /api/v1/interactions`**
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

- **`GET /api/v1/interactions/my-library?status=SAVED`**
  - Kullanıcının kaydettiği veya tamamladığı eserleri listeler.

- **`GET /api/v1/interactions/stats`**
  - Kullanıcının okuma/izleme alışkanlıklarını, ortalama puanını ve hangi felsefi akımlara ağırlık verdiğini gösteren analitik özeti döner.

- **`DELETE /api/v1/interactions/:itemId`**
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
