-- PIXCA initial sources seed (prompts/08-sources-seed.md)
--
-- Hand-authored, imperative SQL. Applied by hand via Supabase Dashboard ->
-- SQL Editor, same as supabase/schema.sql. Safe to re-run: `on conflict`
-- makes repeat runs a no-op.

insert into public.sources (name, listing_url) values
  ('Reuters', 'https://www.reuters.com'),
  ('NPR', 'https://www.npr.org'),
  ('Fox News', 'https://www.foxnews.com'),
  ('BBC News', 'https://www.bbc.com/news'),
  ('The Guardian (US edition)', 'https://www.theguardian.com/us')
on conflict (listing_url) do nothing;
