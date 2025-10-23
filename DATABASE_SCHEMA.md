# LushHeirLoom Database Schema

This document outlines the Supabase database schema for the LushHeirLoom admin panel.

## Required Tables

### 1. menu_items
Stores navigation menu items that can be managed through the admin panel.

```sql
CREATE TABLE menu_items (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  href VARCHAR(255) NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for ordering
CREATE INDEX idx_menu_items_order ON menu_items(order_index);
CREATE INDEX idx_menu_items_active ON menu_items(is_active);
```

### 2. products
Stores product information manageable through admin panel.

```sql
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  price INTEGER NOT NULL, -- Price in cents
  image TEXT,
  tag VARCHAR(50), -- e.g., "New", "Sale", "Popular"
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_tag ON products(tag);
```

### 3. admin_users
Stores admin user roles and permissions.

```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own record
CREATE POLICY "Users can view own record" ON admin_users
  FOR SELECT USING (auth.uid() = id);

-- Policy: Only super_admins can insert/update/delete
CREATE POLICY "Super admins can manage all" ON admin_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );
```

### 4. Row Level Security (RLS) Policies

#### For menu_items table:
```sql
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Allow public read access for active items
CREATE POLICY "Public can view active menu items" ON menu_items
  FOR SELECT USING (is_active = true);

-- Allow admin management
CREATE POLICY "Admins can manage menu items" ON menu_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );
```

#### For products table:
```sql
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow public read access for active products
CREATE POLICY "Public can view active products" ON products
  FOR SELECT USING (is_active = true);

-- Allow admin management
CREATE POLICY "Admins can manage products" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );
```

## Initial Data

### Sample Menu Items
```sql
INSERT INTO menu_items (name, href, order_index, is_active) VALUES
('New & Featured', '/new-featured', 1, true),
('Family', '/family', 2, true),
('Memories', '/memories', 3, true),
('Emotions', '/emotions', 4, true),
('Customize', '/customize', 5, true),
('Sale', '/sale', 6, true);
```

### Sample Products
```sql
INSERT INTO products (name, category, price, image, tag, description, is_active) VALUES
('Family Memory Album', 'Handcrafted Album', 2499, 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80', 'New', 'Beautiful handcrafted album for preserving family memories', true),
('Personalized Family Tree', 'Wall Art', 3999, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80', NULL, 'Custom family tree artwork for your home', true),
('Heritage Memory Box', 'Storage', 1899, 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=800&q=80', 'Sale', 'Elegant storage box for keeping precious memories', true);
```

## Setup Instructions

1. **Create tables**: Run the SQL commands above in your Supabase SQL editor
2. **Enable Authentication**: Make sure Supabase Auth is enabled in your project
3. **Create admin user**: 
   - Sign up a user through Supabase Auth
   - Add their record to the `admin_users` table with role 'super_admin'
4. **Environment Variables**: Update your `.env` file with your Supabase credentials

## Environment Variables Required

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Features Included

- ✅ Menu management (CRUD operations)
- ✅ User authentication and authorization
- ✅ Role-based access control (admin, super_admin)
- ✅ Row Level Security (RLS)
- ✅ Protected admin routes
- 🔄 Product management (structure ready)
- 🔄 User management (structure ready)
- 🔄 Analytics dashboard (structure ready)

## Next Steps

1. Set up your Supabase project
2. Run the SQL schema commands
3. Update environment variables
4. Create your first admin user
5. Access admin panel at `/admin/login`