// Debug authentication script
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

async function debugAuth() {
  try {
    console.log('🔍 Debugging Authentication Issues...\n')
    
    // Test 1: Check current session
    console.log('1️⃣ Checking current session...')
    const { data: session, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) {
      console.error('❌ Session error:', sessionError.message)
    } else {
      console.log('✅ Session check:', session.session ? 'User logged in' : 'No session')
      if (session.session) {
        console.log('👤 User ID:', session.session.user.id)
        console.log('📧 Email:', session.session.user.email)
      }
    }

    // Test 2: Try login
    console.log('\n2️⃣ Testing admin login...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'lushheirloom@gmail.com',
      password: 'Karthik@lushheirloom2025'
    })

    if (authError) {
      console.error('❌ Login failed:', authError.message)
      return
    }

    console.log('✅ Login successful!')
    console.log('👤 User ID:', authData.user.id)
    console.log('📧 Email:', authData.user.email)

    // Test 3: Check admin_users table
    console.log('\n3️⃣ Checking admin_users table...')
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (adminError) {
      console.error('❌ Admin table error:', adminError.message)
      console.log('🔧 This is likely the issue causing the redirect!')
      
      // Check if table exists at all
      const { data: allAdmins, error: allError } = await supabase
        .from('admin_users')
        .select('*')
        .limit(1)

      if (allError) {
        console.error('❌ admin_users table error:', allError.message)
        console.log('\n📋 SOLUTION: Run this SQL in Supabase:')
        console.log('═'.repeat(50))
        console.log(`
-- First, create admin_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert the admin user (replace with actual user ID)
INSERT INTO admin_users (id, email, role) 
VALUES ('${authData.user.id}', 'lushheirloom@gmail.com', 'super_admin')
ON CONFLICT (id) DO UPDATE SET role = 'super_admin';

-- Enable RLS but allow read access for authenticated users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read their own record
CREATE POLICY "Users can view own admin record" ON admin_users
  FOR SELECT USING (auth.uid() = id);
        `)
        console.log('═'.repeat(50))
      }
      return
    }

    console.log('✅ Admin record found!')
    console.log('👑 Role:', adminData.role)
    console.log('📅 Created:', adminData.created_at)

    console.log('\n🎉 All checks passed! Admin should work now.')

  } catch (error) {
    console.error('❌ Debug error:', error.message)
  }
}

debugAuth()