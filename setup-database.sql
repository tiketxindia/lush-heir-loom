-- LushHeirLoom Database Setup Script
-- Run this in your Supabase SQL Editor

-- 1. Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  href VARCHAR(255) NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create products table
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  price INTEGER NOT NULL,
  image TEXT,
  tag VARCHAR(50),
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Add indexes
CREATE INDEX IF NOT EXISTS idx_menu_items_order ON menu_items(order_index);
CREATE INDEX IF NOT EXISTS idx_menu_items_active ON menu_items(is_active);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_tag ON products(tag);

-- 5. Enable Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS Policies for admin_users
DROP POLICY IF EXISTS "Users can view own record" ON admin_users;
CREATE POLICY "Users can view own record" ON admin_users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Super admins can manage all" ON admin_users;
CREATE POLICY "Super admins can manage all" ON admin_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- 7. Create RLS Policies for menu_items
DROP POLICY IF EXISTS "Public can view active menu items" ON menu_items;
CREATE POLICY "Public can view active menu items" ON menu_items
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage menu items" ON menu_items;
CREATE POLICY "Admins can manage menu items" ON menu_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- 8. Create RLS Policies for products
DROP POLICY IF EXISTS "Public can view active products" ON products;
CREATE POLICY "Public can view active products" ON products
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage products" ON products;
CREATE POLICY "Admins can manage products" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- 9. Insert sample menu items
INSERT INTO menu_items (name, href, order_index, is_active) VALUES
('New & Featured', '/new-featured', 1, true),
('Family', '/family', 2, true),
('Memories', '/memories', 3, true),
('Emotions', '/emotions', 4, true),
('Customize', '/customize', 5, true),
('Sale', '/sale', 6, true)
ON CONFLICT DO NOTHING;

-- 10. Insert sample products
INSERT INTO products (name, category, price, image, tag, description, is_active) VALUES
('Family Memory Album', 'Handcrafted Album', 2499, 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80', 'New', 'Beautiful handcrafted album for preserving family memories', true),
('Personalized Family Tree', 'Wall Art', 3999, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80', NULL, 'Custom family tree artwork for your home', true),
('Heritage Memory Box', 'Storage', 1899, 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=800&q=80', 'Sale', 'Elegant storage box for keeping precious memories', true),
('Custom Photo Frame', 'Home Decor', 1299, 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&q=80', NULL, 'Personalized photo frame for your cherished moments', true),
('Emotional Journey Journal', 'Journal', 899, 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&q=80', NULL, 'A journal to document your emotional journey', true),
('Family Recipe Book', 'Handcrafted Book', 1599, 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80', 'Popular', 'Preserve your family recipes for generations', true),
('Memory Keepsake Locket', 'Jewelry', 2199, 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80', NULL, 'Beautiful locket to keep memories close to your heart', true),
('Vintage Photo Display', 'Wall Art', 3299, 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=800&q=80', NULL, 'Elegant vintage-style photo display for your home', true)
ON CONFLICT DO NOTHING;