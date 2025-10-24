// Direct database setup using Supabase client
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing required environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function createMenuItemsTable() {
  try {
    console.log('🚀 Creating menu_items table and data...')
    
    // Since we can't use exec_sql, let's try to insert data first to see if table exists
    const testMenuItems = [
      { name: 'New & Featured', href: '/new-featured', order_index: 1, is_active: true },
      { name: 'Family', href: '/family', order_index: 2, is_active: true },
      { name: 'Memories', href: '/memories', order_index: 3, is_active: true },
      { name: 'Emotions', href: '/emotions', order_index: 4, is_active: true },
      { name: 'Customize', href: '/customize', order_index: 5, is_active: true },
      { name: 'Sale', href: '/sale', order_index: 6, is_active: true }
    ]

    console.log('📝 Attempting to insert menu items...')
    const { data: insertData, error: insertError } = await supabase
      .from('menu_items')
      .insert(testMenuItems)
      .select()

    if (insertError) {
      console.log('❌ Table does not exist yet:', insertError.message)
      console.log('\n📋 Please run this SQL in Supabase SQL Editor:')
      console.log('═'.repeat(50))
      
      console.log(`
-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  href VARCHAR(255) NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample menu items
INSERT INTO menu_items (name, href, order_index, is_active) VALUES
('New & Featured', '/new-featured', 1, true),
('Family', '/family', 2, true),
('Memories', '/memories', 3, true),
('Emotions', '/emotions', 4, true),
('Customize', '/customize', 5, true),
('Sale', '/sale', 6, true)
ON CONFLICT DO NOTHING;

-- Enable Row Level Security
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage menu items" ON menu_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Public can view active menu items" ON menu_items
  FOR SELECT USING (is_active = true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_menu_items_order ON menu_items(order_index);
CREATE INDEX IF NOT EXISTS idx_menu_items_active ON menu_items(is_active);
      `)
      
      console.log('═'.repeat(50))
      return
    }

    console.log('✅ Menu items inserted successfully!')
    console.log('📊 Items created:', insertData?.length || 0)

    // Test the complete setup
    console.log('🧪 Testing complete admin setup...')
    
    // Test auth login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'lushheirloom@gmail.com',
      password: 'Karthik@lushheirloom2025'
    })

    if (authError) {
      console.error('❌ Auth test failed:', authError.message)
      return
    }

    console.log('✅ Admin authentication: Working')

    // Test admin user
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', 'lushheirloom@gmail.com')
      .single()

    if (adminError) {
      console.error('❌ Admin user test failed:', adminError.message)
      return
    }

    console.log('✅ Admin user lookup: Working')
    console.log('👑 Role:', adminData.role)

    // Test menu items
    const { data: menuData, error: menuError } = await supabase
      .from('menu_items')
      .select('*')
      .order('order_index')

    if (menuError) {
      console.error('❌ Menu items test failed:', menuError.message)
      return
    }

    console.log('✅ Menu items retrieval: Working')
    console.log('📋 Total items:', menuData?.length || 0)

    console.log('\n🎉 SETUP COMPLETE!')
    console.log('═══════════════════════════════════════')
    console.log('📧 Email: lushheirloom@gmail.com')
    console.log('🔑 Password: Karthik@lushheirloom2025')
    console.log('👑 Role: super_admin')
    console.log('🌐 Login: http://localhost:8080/admin/login')
    console.log('📋 Menu Management: http://localhost:8080/admin/menu')
    console.log('═══════════════════════════════════════')

  } catch (error) {
    console.error('❌ Setup error:', error.message)
  }
}

createMenuItemsTable()