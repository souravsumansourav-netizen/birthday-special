-- Create surprises table
CREATE TABLE surprises (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url text NOT NULL,
  image_url_2 text,
  title text NOT NULL,
  sub_text text,
  reveal_date date,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS (Row Level Security)
ALTER TABLE surprises ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access
CREATE POLICY "Allow public read access" ON surprises
  FOR SELECT USING (true);

-- Allow authenticated insert/update/delete (or allow anon if testing without auth, but restrict in prod)
CREATE POLICY "Allow anon insert" ON surprises
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update" ON surprises
  FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete" ON surprises
  FOR DELETE USING (true);

-- Create a storage bucket for surprise images
INSERT INTO storage.buckets (id, name, public) VALUES ('surprise-images', 'surprise-images', true);

-- Allow public read access to the bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'surprise-images' );

-- Allow anon upload to bucket
CREATE POLICY "Anon Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'surprise-images' );
