// Fix RLS policies for admin access
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

async function fixRLSPolicies() {
  try {
    console.log('🔧 Checking RLS policies for admin access...\n')
    
    // First, login as admin
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'lushheirloom@gmail.com',
      password: 'Karthik@lushheirloom2025'
    })

    if (authError) {
      console.error('❌ Login failed:', authError.message)
      return
    }

    console.log('✅ Logged in as admin')

    // Test if we can read admin_users table while authenticated
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (adminError) {
      console.error('❌ Cannot read admin_users table while authenticated:', adminError.message)
      console.log('\n📋 SOLUTION: Please run this SQL in Supabase to fix RLS:')
      console.log('═'.repeat(60))
      console.log(`
-- Drop existing policies and recreate them
DROP POLICY IF EXISTS "Users can view own record" ON admin_users;
DROP POLICY IF EXISTS "Users can view own admin record" ON admin_users;
DROP POLICY IF EXISTS "Super admins can manage all" ON admin_users;

-- Create a simple policy that allows authenticated users to read their own admin record
CREATE POLICY "Allow authenticated users to read own admin record" ON admin_users
  FOR SELECT 
  USING (auth.uid() = id);

-- Also allow authenticated users to read admin records (needed for admin checks)
CREATE POLICY "Allow authenticated users to check admin status" ON admin_users
  FOR SELECT 
  USING (auth.role() = 'authenticated');
      `)
      console.log('═'.repeat(60))
      return
    }

    console.log('✅ Admin table access working!')
    console.log('👑 Role:', adminData.role)

    // Test menu_items table access
    console.log('\n🍽️ Testing menu_items table access...')
    const { data: menuData, error: menuError } = await supabase
      .from('menu_items')
      .select('*')
      .limit(1)

    if (menuError) {
      console.error('❌ Menu items table error:', menuError.message)
      console.log('\n📋 Please also run this SQL for menu_items:')
      console.log('═'.repeat(60))
      console.log(`
-- Create menu_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS menu_items (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  href VARCHAR(255) NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Allow public to read active menu items
CREATE POLICY "Allow public to read active menu items" ON menu_items
  FOR SELECT 
  USING (is_active = true);

-- Allow admins to manage all menu items
CREATE POLICY "Allow admins to manage menu items" ON menu_items
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Insert sample data
INSERT INTO menu_items (name, href, order_index, is_active) VALUES
('New & Featured', '/new-featured', 1, true),
('Family', '/family', 2, true),
('Memories', '/memories', 3, true),
('Emotions', '/emotions', 4, true),
('Customize', '/customize', 5, true),
('Sale', '/sale', 6, true)
ON CONFLICT DO NOTHING;
      `)
      console.log('═'.repeat(60))
      return
    }

    console.log('✅ Menu items table access working!')
    console.log('📋 Menu items found:', menuData?.length || 0)

    console.log('\n🎉 All database access is working!')
    console.log('🌐 Try accessing: http://localhost:8081/admin/login')

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

fixRLSPolicies()