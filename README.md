# Design Agency Homepage - Next.js Internship Task

Modern and responsive Design Agency homepage built with Next.js App Router, inspired by Stich AI generated UI direction.

## Sections Implemented

- Hero Section
	- Agency name and bold value proposition
	- Functional CTA buttons: Get Started and View Work
	- Gradient visual treatment and animated reveal
- Services Section
	- 4 service cards
	- Icon, title, and short description for each service
- Portfolio Section
	- Responsive grid with 4 projects
	- Image thumbnails using Next.js Image optimization
	- Hover interaction and working external case-study links
- Contact Section
	- Name, email, and message fields
	- Client-side + server-side validation
	- Connected backend API endpoint
	- Success and error message states

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- MongoDB (official Node.js driver)
- SweetAlert2
- next/font (Google fonts)

## Setup Instructions

1. Install dependencies:

	 npm install

2. Configure environment variables:

	 Copy .env.example to .env.local and set your MongoDB values.

3. Run the development server:

	 npm run dev

4. Open in browser:

	 http://localhost:3000

## Build and Lint

- Lint:

	npm run lint

- Production build:

	npm run build

## Submission Links

- GitHub Repository: https://github.com/harichopper/Northstar-Studio.git
- Live Deployment (Vercel): ADD_YOUR_VERCEL_LINK_HERE

## Assumptions

- Contact form is connected to a backend API route at /api/contact.
- Start Project form is connected to a backend API route at /api/start-project.
- Both forms persist submissions in MongoDB collections.
- Portfolio project thumbnails are representative placeholders for demonstration.

## Additional Features

- SEO metadata configured in app layout metadata
- Smooth scrolling between sections
- Responsive layouts for mobile, tablet, and desktop
- Stich AI visual direction integrated into reusable Next.js component structure
