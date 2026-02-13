# Smart Bookmark App

A real-time, private bookmark manager built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Features

- **Google OAuth**: Fast and secure sign-in via Supabase Auth.
- **Real-time Updates**: Instant UI sync across devices using Supabase Realtime.
- **Private Bookmarks**: Row Level Security (RLS) ensures only you see your bookmarks.
- **Sleek UI**: Modern, responsive design with "Glassmorphism" aesthetics using Tailwind CSS and Framer Motion.
- **CRUD Operations**: Add, view, and delete bookmarks seamlessly.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Framer Motion, Lucide React.
- **Backend**: Supabase (Auth, Realtime, API).
- **Database**: PostgreSQL (via Supabase).

## Getting Started

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd SmartBookMark
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Setup Database
Run the provided `supabase_setup.sql` in your Supabase SQL Editor. This will:
- Create the `bookmarks` table.
- Enable RLS and set up security policies.
- Enable Realtime for the table.

### 5. Run the development server
```bash
npm run dev
```

## Challenges & Solutions

### 1. Real-time Sync across Tabs
**Problem**: When adding a bookmark in one tab, it wouldn't show up in others without a refresh.
**Solution**: Implemented Supabase Realtime. By subscribing to `postgres_changes`, the application listens for any insert/delete/update events on the `bookmarks` table and updates the local state immediately.

### 2. Secure Data Access
**Problem**: Ensuring User A cannot see or delete User B's bookmarks.
**Solution**: Leveraged Supabase's Row Level Security (RLS). Policies were created to restrict `SELECT`, `INSERT`, and `DELETE` operations based on the `auth.uid()`, making data privacy a core part of the database architecture.

### 3. Authentication Callback Flow
**Problem**: Handling the transition from Google OAuth back to the application.
**Solution**: Created a custom `auth/callback` route for exchange of the temporary code for a session token, ensuring a smooth redirect back to the app with the user's session initialized correctly.

## Deployment

This app is ready to be deployed on **Vercel**. 
1. Push the code to GitHub.
2. Connect the repository to Vercel.
3. Add the environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in the Vercel project settings.
