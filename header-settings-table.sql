-- Header Settings Table
CREATE TABLE IF NOT EXISTS header_settings (
  id SERIAL PRIMARY KEY,
  is_sticky BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Insert default settings
INSERT INTO header_settings (is_sticky) VALUES (true) ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE header_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for header_settings table
CREATE POLICY "Allow public read access to header_settings" ON header_settings
    FOR SELECT USING (true);

CREATE POLICY "Allow admin update access to header_settings" ON header_settings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_header_settings_updated_at
    BEFORE UPDATE ON header_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();