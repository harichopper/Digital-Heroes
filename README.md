# Northstar Studio

Modern, conversion-focused design agency website built with Next.js App Router.

## Live Links

- Live Site: https://northstar-studio-five.vercel.app/
- GitHub: https://github.com/harichopper/Northstar-Studio

## Project Highlights

- Modern landing experience with strong visual hierarchy
- Fully responsive sections for mobile, tablet, and desktop
- Dedicated Start Project flow with its own functional page
- Backend APIs for form submission
- MongoDB persistence for both contact and project requests
- SweetAlert2 popups for success and error feedback

## Sections Included

- Hero Section
  - Agency name, tagline, and CTA buttons
- Services Section
  - 4 service cards with icon, title, and description
- Portfolio Section
  - Responsive project grid with image thumbnails and hover interactions
- Contact Section
  - Name, email, and message form with validations
- Start Project Page
  - Full intake form (project type, budget, timeline, details)

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- MongoDB Node.js Driver
- SweetAlert2
- Lucide React Icons
- next/font

## API Endpoints

- POST /api/contact
  - Stores contact form submissions in `contact_submissions`
- POST /api/start-project
  - Stores project requests in `project_requests`

## Environment Variables

Create `.env.local` using `.env.example` and configure:

- MONGODB_URI=your_mongodb_connection_string
- MONGODB_DB=northstar_studio

## Getting Started

1. Install dependencies

```bash
npm install
```

2. Configure environment variables

```bash
cp .env.example .env.local
```

3. Run the development server

```bash
npm run dev
```

4. Open http://localhost:3000

## Scripts

- `npm run dev` - Start development server
- `npm run lint` - Run ESLint
- `npm run build` - Create production build
- `npm run start` - Run production server

## Notes

- This project was built as a Next.js internship evaluation task.
- Portfolio visuals are placeholder showcase assets.
