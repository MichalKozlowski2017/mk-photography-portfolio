# MK Photo Portfolio — Plan projektu

## Stack technologiczny

| Warstwa               | Technologia                                                 |
| --------------------- | ----------------------------------------------------------- |
| Framework             | Next.js 15 (App Router) + TypeScript                        |
| Stylowanie            | Tailwind CSS v4                                             |
| Komponenty UI         | shadcn/ui + Lucide React                                    |
| Baza danych           | Prisma ORM + SQLite (dev) / PostgreSQL (prod)               |
| Autentykacja          | NextAuth.js v5                                              |
| EXIF                  | exifr                                                       |
| Przetwarzanie obrazów | sharp                                                       |
| Upload plików         | Next.js API Routes + lokalny filesystem / Cloudinary (prod) |
| Ikony                 | Lucide React                                                |

---

## Fazy projektu

### Faza 1 — Inicjalizacja projektu

- [ ] Scaffolding projektu Next.js 15 z TypeScript (`create-next-app`)
- [ ] Konfiguracja Tailwind CSS v4
- [ ] Instalacja i konfiguracja shadcn/ui
- [ ] Konfiguracja ESLint + Prettier
- [ ] Inicjalizacja Prisma z SQLite
- [ ] Definicja modeli w schemacie Prisma (`Photo`, `Category`, `User`)
- [ ] Pierwsze migracje bazy danych

### Faza 2 — Autentykacja (panel admina)

- [ ] Instalacja i konfiguracja NextAuth.js v5
- [ ] Strona logowania `/admin/login`
- [ ] Middleware chroniący ścieżki `/admin/*`
- [ ] Prosty user seed (jeden admin)

### Faza 3 — Upload i przetwarzanie zdjęć

- [ ] API route `POST /api/upload` — obsługa przesyłania pliku
- [ ] Integracja `sharp` — generowanie miniatur (thumbnail) i wersji webowej
- [ ] Integracja `exifr` — ekstrakcja danych EXIF podczas uploadu
- [ ] Zapisywanie metadanych EXIF do bazy danych:
  - Czas naświetlania (exposureTime)
  - Przysłona (fNumber / aperture)
  - ISO
  - Ogniskowa (focalLength)
  - Model aparatu i obiektywu
  - Data wykonania zdjęcia
  - GPS (opcjonalnie)
- [ ] Zapisywanie ścieżek obrazów w bazie

### Faza 4 — Panel admina

- [ ] Layout panelu admina (`/admin`)
- [ ] Lista zdjęć w panelu (`/admin/photos`)
- [ ] Formularz dodawania zdjęcia — drag & drop upload
- [ ] Edycja metadanych zdjęcia (tytuł, opis, kategoria)
- [ ] Usuwanie zdjęcia (wraz z plikami)
- [ ] Zarządzanie kategoriami

### Faza 5 — Strona publiczna (portfolio)

- [ ] Strona główna — hero + wybrane zdjęcia
- [ ] Galeria główna `/gallery` — masonry grid lub grid kafelkowy
- [ ] Filtrowanie galerii po kategoriach
- [ ] Strona pojedynczego zdjęcia `/gallery/[slug]`:
  - Pełny podgląd zdjęcia (lightbox)
  - Wyświetlanie danych EXIF (czas naświetlania, ISO, przysłona, ogniskowa, aparat, obiektyw, data)
  - Nawigacja poprzednie/następne
- [ ] Strona "O mnie" `/about`
- [ ] Strona kontaktowa `/contact` (prosty formularz)

### Faza 6 — UX / Funkcje dodatkowe

- [ ] Animacje przejść między stronami (Framer Motion lub CSS)
- [ ] Lightbox (fullscreen viewer z obsługą klawiatury/gesture)
- [ ] Lazy loading obrazów + blur placeholder
- [ ] Dark mode
- [ ] Responsywność (mobile-first)
- [ ] SEO — meta tagi, Open Graph, sitemap

### Faza 7 — Optymalizacja i deployment

- [ ] Optymalizacja `next/image` — rozmiary, formaty (WebP/AVIF)
- [ ] Migracja storage na Cloudinary lub AWS S3 (opcjonalnie)
- [ ] Migracja bazy na PostgreSQL (produkcja)
- [ ] Konfiguracja zmiennych środowiskowych `.env`
- [ ] Deployment na Vercel lub VPS

---

## Modele danych (Prisma)

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
}

model Category {
  id     String  @id @default(cuid())
  name   String  @unique
  slug   String  @unique
  photos Photo[]
}

model Photo {
  id           String    @id @default(cuid())
  title        String?
  description  String?
  slug         String    @unique
  filename     String
  url          String
  thumbnailUrl String
  width        Int
  height       Int
  featured     Boolean   @default(false)
  sortOrder    Int       @default(0)
  categoryId   String?
  category     Category? @relation(fields: [categoryId], references: [id])
  exif         Exif?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}

model Exif {
  id            String   @id @default(cuid())
  photoId       String   @unique
  photo         Photo    @relation(fields: [photoId], references: [id], onDelete: Cascade)
  cameraMake    String?
  cameraModel   String?
  lens          String?
  focalLength   Float?
  aperture      Float?
  exposureTime  String?
  iso           Int?
  takenAt       DateTime?
  latitude      Float?
  longitude     Float?
}
```

---

## Struktura katalogów

```
mk_photo_portfolio/
├── app/
│   ├── (public)/
│   │   ├── page.tsx              # Strona główna
│   │   ├── gallery/
│   │   │   ├── page.tsx          # Galeria
│   │   │   └── [slug]/page.tsx   # Pojedyncze zdjęcie + EXIF
│   │   ├── about/page.tsx
│   │   └── contact/page.tsx
│   ├── admin/
│   │   ├── login/page.tsx
│   │   ├── photos/
│   │   │   ├── page.tsx          # Lista zdjęć
│   │   │   └── new/page.tsx      # Dodaj zdjęcie
│   │   └── layout.tsx            # Layout admina (chroniony)
│   └── api/
│       ├── upload/route.ts
│       └── auth/[...nextauth]/route.ts
├── components/
│   ├── ui/                       # shadcn/ui
│   ├── gallery/
│   │   ├── PhotoGrid.tsx
│   │   ├── PhotoCard.tsx
│   │   └── Lightbox.tsx
│   └── exif/
│       └── ExifPanel.tsx
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── exif.ts                   # Helpery do exifr
│   └── upload.ts                 # Logika uploadu + sharp
├── prisma/
│   └── schema.prisma
├── public/
│   └── uploads/                  # Lokalne uploads (dev)
└── types/
    └── index.ts
```

---

## Notatki

- Zdjęcia w trybie deweloperskim są przechowywane lokalnie w `public/uploads/`
- Na produkcji docelowo Cloudinary (łatwa migracja — zmiana helpera w `lib/upload.ts`)
- Panel admina dostępny pod `/admin`, chroniony przez middleware NextAuth
- EXIF odczytywany jednorazowo podczas uploadu i persistowany w bazie — szybkie wyświetlanie
