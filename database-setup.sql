-- Reading List Application - Database Setup
-- Run this SQL in your Supabase SQL Editor

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

-- Create updated_at trigger function
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger
create trigger update_bookmarks_updated_at
  before update on public.bookmarks
  for each row
  execute procedure update_updated_at_column();

-- Create indexes for better performance
create index bookmarks_user_id_idx on public.bookmarks(user_id);
create index bookmarks_status_idx on public.bookmarks(status);
create index bookmarks_priority_idx on public.bookmarks(priority);
create index bookmarks_created_at_idx on public.bookmarks(created_at desc);
create index bookmarks_tags_idx on public.bookmarks using gin(tags);

-- Done! Your database is ready to use.
