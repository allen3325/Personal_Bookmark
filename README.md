# Reading List - Cross-Device Web Application

A minimalist reading list web application that allows users to save, organize, and manage web URLs they want to read. Features cloud synchronization across devices via Supabase.

## Features

- **User Authentication**: Secure email/password authentication with Supabase Auth
- **Bookmark Management**: Add, edit, delete, and organize bookmarks
- **Rich Metadata**: Auto-fetch page titles and favicons
- **Tags & Organization**: Tag system for categorization
- **Search & Filter**: Search by title/URL, filter by status and tags
- **Reading Status**: Track reading progress (unread, reading, completed)
- **Priority Marking**: Pin important bookmarks to the top
- **Import/Export**: Export to JSON/CSV, import from browser bookmarks
- **Dark Mode**: Toggle between light and dark themes
- **Real-time Sync**: Automatic synchronization across devices
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Backend/Database**: Supabase (PostgreSQL + Auth + Realtime)
- **Icons**: lucide-react
- **Routing**: React Router DOM v6

## Prerequisites

- Node.js 16+ and npm
- A Supabase account (free tier available at https://supabase.com)

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd reading-list
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

#### Create a Supabase Project

1. Go to https://supabase.com and create a new project
2. Wait for your database to be provisioned

#### Create the Database Schema

Run the following SQL in the Supabase SQL Editor (Database → SQL Editor):

```sql
-- Create bookmarks table
create table public.bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  url text not null,
  title text not null,
  favicon_url text,
  description text,
  notes text,
  status text check (status in ('unread', 'reading', 'completed')) default 'unread',
  priority integer default 0 check (priority in (0, 1)),
  tags text[] default '{}',
  estimated_reading_time integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone
);

-- Enable Row Level Security
alter table public.bookmarks enable row level security;

-- Create RLS Policies
create policy "Users can view their own bookmarks"
  on public.bookmarks for select
  using (auth.uid() = user_id);

create policy "Users can insert their own bookmarks"
  on public.bookmarks for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own bookmarks"
  on public.bookmarks for update
  using (auth.uid() = user_id);

create policy "Users can delete their own bookmarks"
  on public.bookmarks for delete
  using (auth.uid() = user_id);

-- Create updated_at trigger
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_bookmarks_updated_at
  before update on public.bookmarks
  for each row
  execute procedure update_updated_at_column();
```

#### Get Your Supabase Credentials

1. Go to Project Settings → API
2. Copy your **Project URL** and **anon public** API key

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Run the Development Server

```bash
npm run dev
```

The application will be available at http://localhost:3000

## Building for Production

```bash
npm run build
```

The production-ready files will be in the `dist` directory.

## Project Structure

```
reading-list/
├── src/
│   ├── components/
│   │   ├── Auth/              # Authentication components
│   │   ├── Bookmarks/         # Bookmark-related components (Phase 3)
│   │   ├── Filters/           # Search and filter components (Phase 4)
│   │   ├── Layout/            # Layout components (Header, etc.)
│   │   └── UI/                # Reusable UI components
│   ├── contexts/
│   │   ├── AuthContext.jsx    # Authentication state
│   │   └── ThemeContext.jsx   # Theme management
│   ├── hooks/
│   │   ├── useAuth.js         # Auth hook (via context)
│   │   ├── useBookmarks.js    # Bookmark management hook
│   │   ├── useTheme.js        # Theme hook (via context)
│   │   └── useToast.js        # Toast notifications hook
│   ├── lib/
│   │   ├── supabase.js        # Supabase client setup
│   │   ├── api.js             # API helper functions
│   │   └── utils.js           # Utility functions
│   ├── pages/
│   │   ├── Home.jsx           # Main bookmarks page
│   │   ├── Login.jsx          # Login page
│   │   ├── Register.jsx       # Registration page
│   │   └── Stats.jsx          # Statistics dashboard
│   ├── App.jsx                # Main app component with routing
│   ├── main.jsx               # Application entry point
│   └── index.css              # Global styles with Tailwind
├── .env.example               # Environment variables template
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```

## Current Implementation Status

### ✅ Phase 1: Project Setup (Completed)
- Vite + React project initialized
- Dependencies installed
- Tailwind CSS configured
- Supabase client setup
- Environment configuration

### ✅ Phase 2: Authentication (Completed)
- Authentication context
- Login component
- Registration component
- Protected routes
- Session persistence
- Logout functionality

### 🚧 Phase 3-7: Coming Next
- Bookmark CRUD operations
- Filtering and search
- Advanced features (tags, bulk operations)
- UI polish and animations
- Statistics dashboard
- Additional features

## Usage

1. **Register**: Create an account with your email and password
2. **Login**: Sign in to access your reading list
3. **Add Bookmarks**: (Coming in Phase 3)
4. **Organize**: Use tags and status to organize your reading list
5. **Sync**: Your bookmarks automatically sync across all your devices

## Database Schema

### Bookmarks Table

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Foreign key to auth.users |
| url | text | Bookmark URL |
| title | text | Page title |
| favicon_url | text | Favicon URL |
| description | text | Page description |
| notes | text | User notes |
| status | text | unread / reading / completed |
| priority | integer | 0 (normal) or 1 (high) |
| tags | text[] | Array of tags |
| estimated_reading_time | integer | Estimated minutes |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |
| completed_at | timestamp | Completion timestamp |

## Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own bookmarks
- Authentication handled by Supabase Auth
- Environment variables for sensitive data

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues or questions, please open an issue on the GitHub repository.

---

**Note**: This is Phase 1 completion. Bookmark management features will be added in subsequent phases as outlined in the implementation plan.
