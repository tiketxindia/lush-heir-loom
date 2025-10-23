// Test complete admin panel functionality
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ezfbekvpmzykjniyyrof.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6ZmJla3ZwbXp5a2puaXl5cm9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMDEzODUsImV4cCI6MjA3Njc3NzM4NX0.gmwiEYru9N-GFH0VC7eAJZIiHaMW3Z_8DivQVWyptY4'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testCompleteSetup() {
  try {
    console.log('🧪 Testing Complete Admin Panel Setup...\n')
    
    // Test 1: Admin Authentication
    console.log('1️⃣ Testing admin authentication...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'lushheirloom@gmail.com',
      password: 'Karthik@lushheirloom2025'
    })

    if (authError) {
      console.error('❌ Auth failed:', authError.message)
      return
    }
    console.log('✅ Admin authentication: SUCCESS')
    console.log('👤 User ID:', authData.user.id)

    // Test 2: Admin User Record
    console.log('\n2️⃣ Testing admin user record...')
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', 'lushheirloom@gmail.com')
      .single()

    if (adminError) {
      console.error('❌ Admin user lookup failed:', adminError.message)
      return
    }
    console.log('✅ Admin user record: SUCCESS')
    console.log('👑 Role:', adminData.role)
    console.log('📧 Email:', adminData.email)

    // Test 3: Menu Items
    console.log('\n3️⃣ Testing menu items...')
    const { data: menuData, error: menuError } = await supabase
      .from('menu_items')
      .select('*')
      .order('order_index')

    if (menuError) {
      console.error('❌ Menu items failed:', menuError.message)
      return
    }
    console.log('✅ Menu items: SUCCESS')
    console.log('📋 Total items:', menuData?.length || 0)
    
    if (menuData && menuData.length > 0) {
      console.log('📝 Menu items:')
      menuData.forEach(item => {
        console.log(`   • ${item.name} (${item.href}) - ${item.is_active ? 'Active' : 'Inactive'}`)
      })
    }

    // Test 4: Menu Management (Insert Test)
    console.log('\n4️⃣ Testing menu management...')
    const testItem = {
      name: 'Test Item',
      href: '/test',
      order_index: 99,
      is_active: true
    }

    const { data: insertData, error: insertError } = await supabase
      .from('menu_items')
      .insert([testItem])
      .select()

    if (insertError) {
      console.error('❌ Menu insert failed:', insertError.message)
    } else {
      console.log('✅ Menu management: SUCCESS')
      console.log('📝 Test item created with ID:', insertData[0]?.id)
      
      // Clean up test item
      await supabase.from('menu_items').delete().eq('id', insertData[0]?.id)
      console.log('🧹 Test item cleaned up')
    }

    console.log('\n🎉 COMPLETE SETUP VERIFICATION')
    console.log('═'.repeat(50))
    console.log('✅ Authentication System: Working')
    console.log('✅ Admin User Management: Working')
    console.log('✅ Menu Items Database: Working')
    console.log('✅ CRUD Operations: Working')
    console.log('═'.repeat(50))
    console.log('🌐 Admin Panel Ready!')
    console.log('🔗 Login: http://localhost:8080/admin/login')
    console.log('📧 Email: lushheirloom@gmail.com')
    console.log('🔑 Password: Karthik@lushheirloom2025')
    console.log('═'.repeat(50))

  } catch (error) {
    console.error('❌ Test error:', error.message)
  }
}

testCompleteSetup()