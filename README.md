# Catalyst | Mar Baselios IEDC

> Catalyst — Innovation and Entrepreneurship Development Centre of Mar Baselios College of Engineering and Technology.

![Catalyst Banner](https://catalyst.mbcet.ac.in/og.png) <!-- Update with an actual banner if available -->

Welcome to the official repository for the Catalyst Web Application. This platform serves as the digital hub for the Innovation and Entrepreneurship Development Centre (IEDC) at Mar Baselios College of Engineering and Technology (MBCET).

## 🚀 Tech Stack

This project is built with modern web technologies to ensure a fast, accessible, and highly interactive user experience.

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Library:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) & [Radix UI](https://www.radix-ui.com/)
- **Animations & Effects:** 
  - [GSAP](https://gsap.com/) & [Framer Motion](https://www.framer.com/motion/)
  - [Lenis](https://studiofreight.github.io/lenis/) (Smooth Scrolling)
  - [Three.js](https://threejs.org/) & React Three Fiber (3D Elements)
- **Backend/BaaS:** [Supabase](https://supabase.com/)
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)

## 🛠️ Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or pnpm

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd Catalyst-Web
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - Copy the `.env.example` file to `.env` or `.env.local`:
     ```bash
     cp .env.example .env.local
     ```
   - Fill in the required environment variables in the `.env.local` file:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `DISCORD_WEBHOOK_URL`
     - `INTERNAL_API_KEY`
     - `VERCEL_AUTOMATION_BYPASS_SECRET` (if deploying on Vercel)

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## 📦 Scripts

- `npm run dev`: Starts the Next.js development server with Turbopack.
- `npm run build`: Creates an optimized production build.
- `npm run start`: Starts the production server.
- `npm run lint`: Runs ESLint to catch syntax and style issues.

## 🗂️ Project Structure

- `/app`: Next.js App Router layout, pages, and API routes.
- `/components`: Reusable UI components (including shadcn/ui).
- `/hooks`: Custom React hooks.
- `/lib`: Utility functions and configuration (e.g., Supabase client).
- `/public`: Static assets like fonts and images.

## 📄 License

This project is licensed under the [MIT License](LICENSE).
