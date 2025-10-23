// Complete setup script for LushHeirLoom admin
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ezfbekvpmzykjniyyrof.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6ZmJla3ZwbXp5a2puaXl5cm9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMDEzODUsImV4cCI6MjA3Njc3NzM4NX0.gmwiEYru9N-GFH0VC7eAJZIiHaMW3Z_8DivQVWyptY4'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function completeSetup() {
  try {
    console.log('🎯 Setting up complete LushHeirLoom database...')
    
    // Step 1: Create admin_users table using raw SQL
    console.log('📊 Creating admin_users table...')
    const { error: tableError } = await supabase.rpc('exec_sql', { 
      sql: `
        CREATE TABLE IF NOT EXISTS admin_users (
          id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          email VARCHAR(255) NOT NULL,
          role VARCHAR(20) NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })

    if (tableError) {
      console.log('⚠️  Table creation note:', tableError.message)
    } else {
      console.log('✅ admin_users table created successfully')
    }

    // Step 2: Add the admin user to admin_users table
    console.log('👤 Adding user to admin_users table...')
    const userId = '4cbd62a2-607c-4e9d-9f3e-4dd4983de53e' // From previous creation
    
    const { error: insertError } = await supabase
      .from('admin_users')
      .insert([{
        id: userId,
        email: 'lushheirloom@gmail.com',
        role: 'super_admin'
      }])

    if (insertError) {
      if (insertError.message.includes('already exists') || insertError.message.includes('duplicate')) {
        console.log('✅ User already exists in admin_users table')
      } else {
        console.error('❌ Error adding to admin_users:', insertError.message)
        return
      }
    } else {
      console.log('✅ User added to admin_users table successfully')
    }

    // Step 3: Create menu_items table
    console.log('📋 Creating menu_items table...')
    const { error: menuError } = await supabase.rpc('exec_sql', { 
      sql: `
        CREATE TABLE IF NOT EXISTS menu_items (
          id BIGSERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          href VARCHAR(255) NOT NULL,
          order_index INTEGER NOT NULL DEFAULT 0,
          is_active BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })

    if (menuError) {
      console.log('⚠️  Menu table note:', menuError.message)
    } else {
      console.log('✅ menu_items table created successfully')
    }

    // Step 4: Insert sample menu items
    console.log('🍽️ Adding sample menu items...')
    const menuItems = [
      { name: 'New & Featured', href: '/new-featured', order_index: 1, is_active: true },
      { name: 'Family', href: '/family', order_index: 2, is_active: true },
      { name: 'Memories', href: '/memories', order_index: 3, is_active: true },
      { name: 'Emotions', href: '/emotions', order_index: 4, is_active: true },
      { name: 'Customize', href: '/customize', order_index: 5, is_active: true },
      { name: 'Sale', href: '/sale', order_index: 6, is_active: true }
    ]

    const { error: menuInsertError } = await supabase
      .from('menu_items')
      .insert(menuItems)

    if (menuInsertError) {
      console.log('⚠️  Menu items note:', menuInsertError.message)
    } else {
      console.log('✅ Sample menu items added successfully')
    }

    console.log('\n🎉 Setup Complete!')
    console.log('═══════════════════════════════════════')
    console.log('📧 Admin Email: lushheirloom@gmail.com')
    console.log('🔑 Password: Karthik@lushheirloom2025')
    console.log('👑 Role: super_admin')
    console.log('🌐 Login URL: http://localhost:8080/admin/login')
    console.log('═══════════════════════════════════════')
    
  } catch (error) {
    console.error('❌ Setup error:', error.message)
  }
}

completeSetup()