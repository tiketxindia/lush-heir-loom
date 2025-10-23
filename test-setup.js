// Continue setup - Create menu items and policies
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

async function setupMenuItems() {
  try {
    console.log('🍽️ Setting up menu items...')
    
    // Step 1: Check if menu_items table exists and create if needed
    const { data: existingItems, error: checkError } = await supabase
      .from('menu_items')
      .select('id')
      .limit(1)

    if (checkError && checkError.message.includes('does not exist')) {
      console.log('❌ menu_items table does not exist yet')
      console.log('📋 Please create the menu_items table in Supabase SQL Editor first:')
      console.log(`
CREATE TABLE IF NOT EXISTS menu_items (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  href VARCHAR(255) NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
      `)
      return
    }

    // Step 2: Insert sample menu items
    console.log('📝 Adding sample menu items...')
    const menuItems = [
      { name: 'New & Featured', href: '/new-featured', order_index: 1, is_active: true },
      { name: 'Family', href: '/family', order_index: 2, is_active: true },
      { name: 'Memories', href: '/memories', order_index: 3, is_active: true },
      { name: 'Emotions', href: '/emotions', order_index: 4, is_active: true },
      { name: 'Customize', href: '/customize', order_index: 5, is_active: true },
      { name: 'Sale', href: '/sale', order_index: 6, is_active: true }
    ]

    const { data: insertData, error: insertError } = await supabase
      .from('menu_items')
      .insert(menuItems)
      .select()

    if (insertError) {
      if (insertError.message.includes('duplicate') || insertError.message.includes('already exists')) {
        console.log('✅ Menu items already exist')
      } else {
        console.error('❌ Error inserting menu items:', insertError.message)
        return
      }
    } else {
      console.log('✅ Sample menu items added successfully')
      console.log('📋 Added items:', insertData?.length || 0)
    }

    // Step 3: Test admin authentication
    console.log('🔐 Testing admin login...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'lushheirloom@gmail.com',
      password: 'Karthik@lushheirloom2025'
    })

    if (authError) {
      console.error('❌ Auth test failed:', authError.message)
      return
    }

    console.log('✅ Admin login test successful')

    // Step 4: Test admin user lookup
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', 'lushheirloom@gmail.com')
      .single()

    if (adminError) {
      console.error('❌ Admin user lookup failed:', adminError.message)
      return
    }

    console.log('✅ Admin user found:', adminData.role)

    // Step 5: Test menu items retrieval
    const { data: menuData, error: menuError } = await supabase
      .from('menu_items')
      .select('*')
      .order('order_index')

    if (menuError) {
      console.error('❌ Menu items retrieval failed:', menuError.message)
      return
    }

    console.log('✅ Menu items retrieved:', menuData?.length || 0)

    console.log('\n🎉 Setup Verification Complete!')
    console.log('═══════════════════════════════════════')
    console.log('✅ Admin user: Working')
    console.log('✅ Authentication: Working') 
    console.log('✅ Menu items: Working')
    console.log('🌐 Ready to login at: http://localhost:8080/admin/login')
    console.log('═══════════════════════════════════════')

  } catch (error) {
    console.error('❌ Setup error:', error.message)
  }
}

setupMenuItems()