# DashNote

An AI-powered note-taking web app with a Chrome Extension for seamless cross-platform content capture — built independently, end-to-end.

---

## Overview

DashNote is a full-stack personal productivity app that combines note-taking with an integrated AI assistant. Users can capture, organise, and interact with their notes through a conversational AI interface — with AI responses saved directly into the note workflow.

Access is currently whitelist-based (no open registration).

**Live Demo:** [Watch on YouTube](https://youtu.be/CWc3fMy1aAk)

---

## Features

- **Note Management** — Create, edit, delete, and organise notes with full CRUD functionality
- **AI Chat Interface** — Chat with a Gemini AI agent; append AI responses directly to the current note or save them as new standalone notes
- **Tag System** — Many-to-many tagging with dynamic tag filtering; composite primary key junction table with cascade delete
- **Full-Text Search** — Real-time search across all notes
- **Chrome Extension** — Capture content from any webpage directly into DashNote
- **Authentication** — Google OAuth 2.0 via NextAuth.js with JWT session management (whitelist-based access)

---

## Tech Stack

### Frontend
| Technology | Usage |
|---|---|
| Next.js (App Router) | Full-stack React framework |
| TypeScript | Type safety across UI and database schemas |
| Tailwind CSS | Utility-first styling with CSS custom properties |
| React Context API | Global state management |
| Custom React Hooks | Encapsulated logic for search, filtering, and data fetching |

### Backend
| Technology | Usage |
|---|---|
| Next.js Route Handlers | RESTful API endpoints |
| NextAuth.js | Google OAuth 2.0 + JWT session management |
| Gemini AI API | AI agent for note interaction and content generation |

### Database
| Technology | Usage |
|---|---|
| PostgreSQL (Neon) | Serverless relational database |
| Drizzle ORM | Type-safe schema definition and query builder |

### DevOps
| Technology | Usage |
|---|---|
| AWS Amplify | Hosting and deployment |
| CI/CD Pipeline | Automated builds and deployments on push |
| Git | Version control |

---

## Architecture Highlights

**Full-Stack with Next.js Route Handlers**
Migrated from a client-side architecture to a full-stack pattern where all data fetching goes through server-side API routes, improving security and separation of concerns.

**Relational Data Modelling**
Notes and tags share a many-to-many relationship implemented via a composite primary key junction table with cascade delete — enforcing referential integrity at the database level.

**Type Safety End-to-End**
TypeScript and Drizzle ORM are used together so that database schema changes surface as compile-time errors in UI components, reducing runtime bugs.

**Component Design**
Built a reusable component library from scratch using Tailwind CSS and CSS custom properties, prioritising flexibility and performance over third-party UI libraries.

---

## Project Structure

```
dashnote/
├── src/
│   ├── app/          # Next.js App Router pages + API Route Handlers
│   ├── components/   # Reusable UI components
│   ├── constants/    
│   ├── data/         # Static or seed data
│   ├── db/           # Drizzle ORM schema and client
│   ├── features/     # Feature-based modules
│   ├── providers/    # React context providers
│   ├── types/        # TypeScript type definitions
│   └── utils/        # Utility functions
├── chrome-extension/ # Companion Chrome Extension for web content capture
├── drizzle/          # Database migrations
├── public/           # Static assets
├── middleware.ts     # Auth middleware
├── drizzle.config.ts
├── amplify.yml       # AWS Amplify build config
└── next.config.ts
```

---

## Getting Started (Local Development)

### Prerequisites
- Node.js 18+
- PostgreSQL database (or Neon serverless account)
- Google OAuth credentials
- Gemini API key

### Installation

```bash
git clone https://github.com/joan-hq/dashnote
cd dashnote
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
DATABASE_URL=your_neon_postgres_url
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GEMINI_API_KEY=your_gemini_api_key
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment

Deployed on **AWS Amplify** with an automated CI/CD pipeline. Every push to `main` triggers a build and deployment.

---

## What I Learned

This project was built independently after a career break, as a way to return to full-stack development and explore AI integration. Key learnings include:

- Designing normalised relational schemas with Drizzle ORM and PostgreSQL
- Building a full-stack architecture with Next.js App Router and server-side API routes
- Integrating a generative AI agent into a real user workflow
- Setting up a production deployment pipeline on AWS Amplify

---

## Author

**Joan Huang**
[GitHub](https://github.com/joan-hq) · [LinkedIn](https://linkedin.com/in/joan-huang)
