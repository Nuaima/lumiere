# Lumière

Lumière is an AI-powered skincare and beauty companion built with React, TypeScript, and TanStack Start.

## Features

- Skin analysis workflow with image upload and server-side analysis endpoint
- Skincare guidance and product discovery
- Brand exploration and customization
- Virtual try-on experience
- Beauty passport and downloadable PDF reports
- Supabase integration for application data and authentication

## Tech stack

- React 19 and TypeScript
- TanStack Start and TanStack Router
- Vite
- Tailwind CSS and Radix UI components
- Supabase
- MediaPipe Tasks Vision
- jsPDF

## Getting started

### Requirements

- Node.js (current LTS recommended)
- npm

### Install

```bash
npm install
```

### Configure environment variables

Copy `.env.example` to `.env` and fill in your Supabase project values:

```bash
cp .env.example .env
```

The Supabase publishable key is intended for client-side use. Never put service-role keys, API secrets, or other privileged credentials in frontend code or version control.

### Run locally

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Environment variables

| Variable | Description |
| --- | --- |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key |
| `VITE_SUPABASE_URL` | Public Supabase project URL for the Vite client |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Public Supabase publishable key for the Vite client |
| `SUPABASE_PROJECT_ID` | Supabase project identifier |
| `VITE_SUPABASE_PROJECT_ID` | Public project identifier used by the frontend |

## Deployment

The repository includes a Netlify configuration. Set environment variables in your deployment provider rather than committing a local `.env` file.

## Security notes

- Never commit `.env`, local credentials, private API keys, or service-role keys.
- Review Supabase Row Level Security policies before using the project with real user data.
- Keep privileged API operations on the server.

## License

No license has been added. All rights reserved unless a license is added to this repository.
