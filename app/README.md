# Me System 2.0

A personal life system website with planetary navigation, timeline events, value circles, and philosophy space with comment system.

## Features

- **Planetary Navigation**: Three orbiting planets as hidden navigation to different sections
- **Timeline**: Supports time ranges, sub-events, images, and PDFs
- **Value Circles**: Interactive bubbles with squeeze effect
- **Philosophy Space**: Starfield with comment system (requires approval)
- **Edit Mode**: Password-protected editing with Supabase persistence

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS
- Framer Motion
- Supabase
- Lucide React

## Setup

### 1. Clone and Install

```bash
git clone <your-repo>
cd me-system-2.0
npm install
```

### 2. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the following SQL:

```sql
-- Events table (for timeline and value circles)
create table events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  summary text,
  start_year integer not null,
  end_year integer,
  category text not null check (category in ('exploration', 'connection', 'creative')),
  images text[] default '{}',
  pdf_url text,
  parent_id uuid references events(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Thoughts table (for philosophy space)
create table thoughts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  x numeric default 50,
  y numeric default 50,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Comments table (for philosophy discussions)
create table comments (
  id uuid default gen_random_uuid() primary key,
  thought_id uuid references thoughts(id) on delete cascade not null,
  content text not null,
  author text default 'Anonymous',
  is_public boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table events enable row level security;
alter table thoughts enable row level security;
alter table comments enable row level security;

-- Create policies for public read access
create policy "Public can read events" on events for select to anon using (true);
create policy "Public can read thoughts" on thoughts for select to anon using (true);
create policy "Public can read comments" on comments for select to anon using (is_public = true);

-- Create policies for authenticated users (for edit mode)
create policy "Authenticated can manage events" on events for all to authenticated using (true) with check (true);
create policy "Authenticated can manage thoughts" on thoughts for all to authenticated using (true) with check (true);
create policy "Authenticated can manage comments" on comments for all to authenticated using (true) with check (true);
```

3. Go to Project Settings > API and copy:
   - Project URL
   - anon public API key

### 3. Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run Development Server

```bash
npm run dev
```

### 5. Build for Production

```bash
npm run build
```

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/me-system.git
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. In "Environment Variables", add:
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
5. Click "Deploy"

## Edit Mode

- Click the tiny dot at bottom-right corner (5% opacity)
- Enter password: `life2024`
- Now you can add/edit/delete content
- All changes are automatically saved to Supabase

## Password Change

To change the edit mode password, modify `src/hooks/useEditMode.tsx`:

```typescript
const CORRECT_PASSWORD = 'your-new-password';
```

## Project Structure

```
src/
├── components/
│   └── custom/
│       ├── EditEntry.tsx      # Hidden edit button
│       └── PasswordModal.tsx  # Password input modal
├── hooks/
│   └── useEditMode.tsx        # Edit mode context
├── lib/
│   └── supabase.ts            # Supabase client & API
├── sections/
│   ├── Hero.tsx               # Planetary navigation
│   ├── Timeline.tsx           # Timeline with events
│   ├── ValueCircles.tsx       # Interactive bubbles
│   ├── PhilosophySpace.tsx    # Starfield & comments
│   └── Footer.tsx             # Simple footer
├── types/
│   └── index.ts               # TypeScript types
├── App.tsx                    # Main app
└── index.css                  # Global styles
```

## License

MIT
