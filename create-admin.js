// Create admin user for LushHeirLoom
// Run with: node create-admin.js

import { createClient } from '@supabase/supabase-js'

// Using the same configuration as in the app
const supabaseUrl = 'https://ezfbekvpmzykjniyyrof.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6ZmJla3ZwbXp5a2puaXl5cm9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMDEzODUsImV4cCI6MjA3Njc3NzM4NX0.gmwiEYru9N-GFH0VC7eAJZIiHaMW3Z_8DivQVWyptY4'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function createAdminUser() {
  try {
    console.log('🚀 Creating admin user for LushHeirLoom...')
    
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'lushheirloom@gmail.com',
      password: 'Karthik@lushheirloom2025'
    })

    if (authError) {
      if (authError.message.includes('already been registered')) {
        console.log('✅ User already exists in auth system')
        
        // Try to sign in to get the user ID
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: 'lushheirloom@gmail.com',
          password: 'Karthik@lushheirloom2025'
        })

        if (signInError) {
          console.error('❌ Error signing in existing user:', signInError.message)
          return
        }

        console.log('✅ User signed in successfully, ID:', signInData.user.id)
        
        // Add to admin_users table
        await addToAdminTable(signInData.user.id, 'lushheirloom@gmail.com')
        return
      } else {
        console.error('❌ Auth error:', authError.message)
        return
      }
    }

    if (!authData.user) {
      console.error('❌ No user returned from auth signup')
      return
    }

    console.log('✅ Auth user created with ID:', authData.user.id)
    
    // Add to admin_users table
    await addToAdminTable(authData.user.id, 'lushheirloom@gmail.com')

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

async function addToAdminTable(userId, email) {
  try {
    // Add user to admin_users table
    const { error: insertError } = await supabase
      .from('admin_users')
      .insert([{
        id: userId,
        email: email,
        role: 'super_admin'
      }])

    if (insertError) {
      if (insertError.message.includes('already exists') || insertError.message.includes('duplicate')) {
        console.log('✅ User already exists in admin_users table')
      } else {
        console.error('❌ Error adding to admin_users table:', insertError.message)
        return
      }
    } else {
      console.log('✅ User added to admin_users table with super_admin role')
    }

    console.log('\n🎉 Admin user setup complete!')
    console.log('📧 Email: lushheirloom@gmail.com')
    console.log('🔑 Password: Karthik@lushheirloom2025')
    console.log('👑 Role: super_admin')
    console.log('🌐 Login at: http://localhost:8080/admin/login')
    
  } catch (error) {
    console.error('❌ Error in addToAdminTable:', error.message)
  }
}

createAdminUser()