# Catalyst Web

> Official website for **Catalyst IEDC** — Mar Baselios College of Engineering and Technology (MBCET).

Built with **Next.js 16**, **Appwrite**, **Shadcn/ui**, **GSAP**, and **Tailwind CSS v4**.

---

## Features

- **Public Website** — Showcases initiatives, events, achievements, gallery, and campus stats.
- **Admin Dashboard** — Secure, session-based admin panel for managing Members, Events, Roles, Achievements, and Logs.
- **Dark / Light Mode** — System-aware theme toggle powered by `next-themes`.
- **Optimized Performance** — ISR (Incremental Static Regeneration) with per-resource cache revalidation, AVIF/WebP images, and tree-shaken icon bundles.
- **GSAP Animations** — Smooth entrance animations for key UI sections.
- **Fully Responsive** — Mobile-first layout with a collapsible sidebar and adaptive data tables.

--

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4, Shadcn/ui, Radix UI |
| Animations | GSAP + `@gsap/react`, Motion |
| 3D | Three.js + React Three Fiber |
| Backend / DB | Appwrite (Cloud) |
| Forms | React Hook Form + Zod |
| State | Zustand |
| Tables | TanStack Table v8 |

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-org/catalyst-web.git
cd catalyst-web
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example env file and fill in your Appwrite credentials:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `NEXT_APPWRITE_ENDPOINT` | Appwrite API endpoint (e.g. `https://cloud.appwrite.io/v1`) |
| `NEXT_APPWRITE_PROJECT_ID` | Your Appwrite project ID |
| `NEXT_APPWRITE_DATABASE_ID` | Your Appwrite database ID |
| `NEXT_APPWRITE_API_KEY` | Server-side Appwrite API key |
| `NEXT_APPWRITE_BUCKET_ID` | Storage bucket for media uploads |
| `NEXT_PUBLIC_APP_URL` | Public base URL (e.g. `https://catalyst.mbcet.ac.in`) |
| `DISCORD_WEBHOOK_URL` | Optional — for Discord notifications |
| `NEXT_PUBLIC_APPWRITE_*_COLLECTION_ID` | Collection IDs for each data type |

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the development server (Turbopack) |
| `npm run build` | Creates a production build |
| `npm run start` | Starts the production server |
| `npm run lint` | Runs ESLint |

---

## Project Structure

```
catalyst-web/
├── app/
│   ├── admin/           # Admin dashboard (auth-protected)
│   │   ├── members/
│   │   ├── events/
│   │   ├── roles/
│   │   ├── achievements/
│   │   ├── logs/
│   │   ├── layout.tsx   # Admin layout with sidebar + topnav
│   │   └── admin.css    # Isolated admin theme variables
│   ├── api/             # Next.js API routes (proxy to Appwrite)
│   ├── globals.css      # Global styles
│   └── layout.tsx       # Root layout
├── components/
│   ├── ui/              # Shadcn/ui base components
│   ├── app-sidebar.tsx  # Admin sidebar
│   └── top-nav.tsx      # Admin top navigation bar
├── lib/
│   ├── admin-fetcher.ts # Centralized ISR-aware fetch utility
│   ├── appwrite/        # Appwrite client & server SDK helpers
│   ├── auth.ts          # Session auth helpers
│   └── get-base-url.ts  # Base URL resolver
├── hooks/               # Custom React hooks
├── public/              # Static assets
└── proxy.ts             # Dev API proxy
```

---

## Admin Dashboard

The admin section is accessible at `/admin` and requires a valid `admin_session` cookie issued by Appwrite.

| Route | Description |
|---|---|
| `/admin` | Dashboard overview |
| `/admin/members` | Member management |
| `/admin/events` | Events management |
| `/admin/roles` | Roles management |
| `/admin/achievements` | Achievements management |
| `/admin/logs` | Action log viewer |

---

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push and open a Pull Request.

Please follow the existing code style and run `npm run lint` before submitting.

---

## License

This project is private and maintained by the **Catalyst IEDC** team at MBCET. All rights reserved.
