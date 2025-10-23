-- ===============================================
-- HEADER SETTINGS TABLE CREATION SCRIPT
-- ===============================================
-- Copy and paste this entire script into your Supabase SQL Editor
-- Go to: https://app.supabase.com/project/ezfbekvpmzykjniyyrof/sql/new

-- Create header_settings table
CREATE TABLE header_settings (
  id SERIAL PRIMARY KEY,
  is_sticky BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Insert default settings (sticky header enabled)
INSERT INTO header_settings (is_sticky) VALUES (true);

-- Enable Row Level Security
ALTER TABLE header_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access (so frontend can read header settings)
CREATE POLICY "Allow public read access to header_settings" ON header_settings
    FOR SELECT USING (true);

-- Allow admin update access (only admins can modify header settings)
CREATE POLICY "Allow admin update access to header_settings" ON header_settings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Create function for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update the updated_at column
CREATE TRIGGER update_header_settings_updated_at
    BEFORE UPDATE ON header_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verify the table was created successfully
SELECT * FROM header_settings;