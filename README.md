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

### 1. Real-time Multi-Tab Updates (No Refresh)
- **Problem**: Bookmark list updates in real-time without page refresh (if you open two tabs and add a bookmark in one, it should appear in the other). Initially, changes made in session A were not reflected in session B without a manual refresh.
- **Solution**: Implemented **Supabase Realtime** by subscribing to `postgres_changes`. The application now listens for all `INSERT`, `UPDATE`, and `DELETE` events on the `bookmarks` table and synchronizes the UI state across all active tabs instantly.

### 2. Secure Data Access
**Problem**: Ensuring User A cannot see or delete User B's bookmarks.
**Solution**: Leveraged Supabase's Row Level Security (RLS). Policies were created to restrict `SELECT`, `INSERT`, and `DELETE` operations based on the `auth.uid()`, making data privacy a core part of the database architecture.

### 3. Realtime Subscription Instability
- **Problem**: The Supabase client was being recreated on every render, causing the WebSocket connection to drop and reconnect constantly.
- **Solution**: Stabilized the Supabase client instance using React's `useState` hooks to ensure a persistent connection across renders.

### 4. Restricted Networks & WebSocket Blocks
- **Problem**: In some environments, WebSockets (used for Realtime) are blocked, resulting in a permanent `TIMEOUT` or `CLOSED` status.
- **Solution**: Implemented an **Automatic Polling Fallback**. If the realtime status is not `SUBSCRIBED`, the application automatically refreshes the bookmark list every 5 seconds, ensuring a seamless experience even without a live WebSocket connection.

### 5. Instant UI Feel (Optimistic Updates)
- **Problem**: Deleting a bookmark felt slow because it waited for the database confirmation.
- **Solution**: Used **Optimistic UI updates** to remove the bookmark from the screen immediately while the API call is still in progress, with a silent rollback if it fails.

## Deployment

This app is ready to be deployed on **Vercel**. 
1. Push the code to GitHub.
2. Connect the repository to Vercel.
3. Add the environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in the Vercel project settings.
