-- LushHeirLoom Admin User Creation Script
-- Run this in your Supabase SQL Editor after creating the user in Auth

-- Step 1: First, create the admin user in Supabase Auth Dashboard
-- Go to Authentication > Users > Add User
-- Email: lushheirloom@gmail.com  
-- Password: Karthik@lushheirloom2025
-- Make sure to check "Auto Confirm User"

-- Step 2: After creating the auth user, run this SQL to add admin role
-- Replace 'AUTH_USER_ID_HERE' with the actual UUID from the created user

-- Check if admin_users table exists, if not create it
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_users
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

-- Step 3: Insert the admin user record
-- IMPORTANT: Replace 'AUTH_USER_ID_HERE' with the actual UUID from step 1
-- You can find the UUID in Authentication > Users after creating the user

-- INSERT INTO admin_users (id, email, role) 
-- VALUES ('AUTH_USER_ID_HERE', 'lushheirloom@gmail.com', 'super_admin');

-- Alternative: If you know the email and want to find the user automatically
-- Run this query to see the user ID first:
SELECT id, email FROM auth.users WHERE email = 'lushheirloom@gmail.com';

-- Then use that ID in this insert:
-- INSERT INTO admin_users (id, email, role) 
-- SELECT id, email, 'super_admin' 
-- FROM auth.users 
-- WHERE email = 'lushheirloom@gmail.com';