create table taps (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  submission_name text not null,
  date text not null,
  note text default '',
  created_at timestamptz default now()
);

alter table taps enable row level security;

create policy "Users can manage their own taps"
  on taps for all using (auth.uid() = user_id);
