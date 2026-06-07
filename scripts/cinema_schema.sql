-- Family Cinema Canon — Supabase schema
-- Run this in the Supabase SQL editor at https://supabase.com/dashboard

CREATE TABLE IF NOT EXISTS cc_families (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  username TEXT UNIQUE NOT NULL,
  pin TEXT NOT NULL,
  family_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cc_kids (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL REFERENCES cc_families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dob TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#C4621D',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cc_watches (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  family_id TEXT NOT NULL REFERENCES cc_families(id) ON DELETE CASCADE,
  kid_id TEXT NOT NULL,
  movie_id TEXT NOT NULL,
  watched BOOLEAN NOT NULL DEFAULT false,
  watch_date TEXT,
  note TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(kid_id, movie_id)
);

CREATE TABLE IF NOT EXISTS cc_custom_movies (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL REFERENCES cc_families(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  year INTEGER,
  category TEXT,
  age_min INTEGER,
  age_ideal INTEGER,
  series TEXT,
  must_watch BOOLEAN DEFAULT false,
  description TEXT,
  watch_order TEXT,
  family_note TEXT,
  omdb_plot TEXT,
  omdb_director TEXT,
  omdb_runtime TEXT,
  omdb_rating TEXT,
  omdb_imdb_rating TEXT,
  omdb_poster TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE cc_families ENABLE ROW LEVEL SECURITY;
ALTER TABLE cc_kids ENABLE ROW LEVEL SECURITY;
ALTER TABLE cc_watches ENABLE ROW LEVEL SECURITY;
ALTER TABLE cc_custom_movies ENABLE ROW LEVEL SECURITY;

-- Open policies (auth is handled via username+PIN at app level)
DO $$ BEGIN
  CREATE POLICY cc_fam_all ON cc_families FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY cc_kid_all ON cc_kids FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY cc_wat_all ON cc_watches FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY cc_cus_all ON cc_custom_movies FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
