# Pogled Movies App

## Description

Web application for discovering movies, exploring popular and highly-rated films, getting personalized recommendations, and saving your favorite movies. Features include user authentication, movie filtering, and integration with external movie databases.

## Link

Deployed and available on: [pogled.vercel.app](https://pogled.vercel.app/)

## Visuals

![Movie App Screenshot](https://via.placeholder.com/800x400?text=Movie+App+Screenshot) (replace with actual screenshot)

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
