# Pogled movies app

## Description

Web application for discovering movies, exploring popular and highly-rated films, getting personalized recommendations, and saving your favorite movies. Features include user authentication, movie filtering, and integration with external movie databases.

## Link

Deployed and available on: [pogled.netlify.app](https://pogled.netlify.app/)

## Visuals

<p align="center">
  <img width="90%" alt="Pogled movies app" src="https://github.com/user-attachments/assets/69fe2908-a19e-4c9f-bc0d-ac4d7775b6ff" /> 
</p>

## Tech Stack

- **Frontend:** Next.js, React, Tailwind CSS, Shadcn
- **Backend:** Next.js API Routes, MongoDB (Mongoose)
- **Authentication:** NextAuth.js
- **APIs:** The Movie Database (TMDb), Trakt.tv, OMDB, YouTube

## Attribution

Created by: Jakov Jakovac, Stela Dermit, Marko Miškić, Borna Rebić Taučer

## License [![CC BY-NC-SA 4.0][cc-by-nc-sa-shield]][cc-by-nc-sa]

[cc-by-nc-sa]: http://creativecommons.org/licenses/by-nc-sa/4.0/
[cc-by-nc-sa-image]: https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png
[cc-by-nc-sa-shield]: https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-cyan.svg

This work is licensed under a
[Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License][cc-by-nc-sa].

## How to run

### Prerequisites

- Node.js 18+ (or latest LTS)
- MongoDB (local or remote, e.g., MongoDB Atlas)
- API keys for TMDb, Trakt, and other services (see environment variables)

### Startup flow

- Set up the database and environment variables, then start the application.

### Running the app

1. Database (MongoDB)

   - Set up a MongoDB instance (local or cloud).
   - Update connection string in environment variables.

2. Environment setup

   - Configure environment variables by copying the .env.local.example file.
   - You can create a `.env.local` file in the root.

3. Install and run

   - Install dependencies: `npm install`
   - Run development server: `npm run dev`
   - The app runs on port 3000 by default: [http://localhost:3000](http://localhost:3000/)

## Google OAuth Setup

1. Open [Google Cloud Console](https://console.cloud.google.com/)

2. Create a new project (name for example `Pogled Movies App` and id for example `pogled-movies-app`) and open it

3. Create a new OAuth client ID credential under `APIs & Services > Credentials`

   - Configure consent screen (`OAuth consent screen`)

     - Input app name (for example `Pogled Movies App`) and user support email (your account email)
     - Set Audience to External so users outside your organisation can login
     - Add contact email (your account email)

   - Create OAuth client ID (`Credentials`)

     - Set application type to Web application
     - Change name or leave as is
     - Add Authorized JavaScript origins (your app domain): `http://localhost:3000`, `https://pogled.netlify.app`
     - Add Authorized redirect URIs (your app domain): `http://localhost:3000/api/auth/callback/google`, `https://pogled.netlify.app/api/auth/callback/google`

4. Copy-paste Client ID and Client Secret to your `.env.local` file as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

5. Publish your app to Production under `Audience > Publishing status > Publish app`

## Deployment Guide (Netlify)

### 1. Local Build Verification (Optional)

```bash
# Build the application locally to verify everything works
npm run build
```

### 2. Netlify Configuration

1. **Initial Setup**

   - Create a Netlify account
   - Connect your GitHub account
   - Import your repository for continuous deployment

2. **Environment Variables**

   Copy these values as secrets from your `.env.local`:

   - `MONGODB_URI`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` - Set to `https://pogled.netlify.app`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `TMDB_API_KEY`
   - `TRAKT_CLIENT_ID`
   - `TRAKT_CLIENT_SECRET`
   - `OMDB_API_KEY`
   - `YOUTUBE_API_KEY`
