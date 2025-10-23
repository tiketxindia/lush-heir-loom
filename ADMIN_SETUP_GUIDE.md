# Admin User Setup Guide for LushHeirLoom

## 🎯 Quick Setup Steps

### Step 1: Setup Database Schema
1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project: `ezfbekvpmzykjniyyrof`
3. Navigate to **SQL Editor**
4. Copy and paste the content from `setup-database.sql` file
5. Click **Run** to create all tables

### Step 2: Create Admin User in Authentication
1. In Supabase dashboard, go to **Authentication** → **Users**
2. Click **"Add User"** button
3. Fill in the details:
   - **Email**: `lushheirloom@gmail.com`
   - **Password**: `Karthik@lushheirloom2025`
   - **✅ Check "Auto Confirm User"** (important!)
4. Click **"Create User"**
5. **Copy the User ID** (UUID) that appears in the users list

### Step 3: Add Admin Role to User
1. Go back to **SQL Editor**
2. Run this command (replace `USER_ID_HERE` with the UUID from step 2):

```sql
INSERT INTO admin_users (id, email, role) 
VALUES ('USER_ID_HERE', 'lushheirloom@gmail.com', 'super_admin');
```

**Alternative automatic method:**
```sql
INSERT INTO admin_users (id, email, role) 
SELECT id, email, 'super_admin' 
FROM auth.users 
WHERE email = 'lushheirloom@gmail.com';
```

### Step 4: Test Admin Login
1. Start your development server: `npm run dev`
2. Navigate to: `http://localhost:8080/admin/login`
3. Login with:
   - **Email**: `lushheirloom@gmail.com`
   - **Password**: `Karthik@lushheirloom2025`

## 🚀 Expected Result

After successful login, you should see:
- Admin dashboard with statistics
- Navigation sidebar with:
  - Dashboard
  - Menu Management
  - Products
  - Users
  - Analytics
  - Settings

## 🔧 Troubleshooting

### If login fails:
1. Check if user exists in **Authentication** → **Users**
2. Verify user is confirmed (not pending)
3. Check if record exists in `admin_users` table:
   ```sql
   SELECT * FROM admin_users WHERE email = 'lushheirloom@gmail.com';
   ```

### If admin panel shows "access denied":
1. Verify the user has `super_admin` role in `admin_users` table
2. Check RLS policies are correctly applied

## 📁 Files Created

- `setup-database.sql` - Complete database schema
- `create-admin-user.sql` - Admin user creation steps
- Admin panel files in `src/pages/admin/`
- Authentication context in `src/contexts/AuthContext.tsx`

## 🎉 Next Steps

Once logged in, you can:
1. Manage navigation menu items at `/admin/menu`
2. View dashboard statistics
3. Prepare for product management (coming soon)
4. Configure user roles and permissions

The admin panel is fully functional and ready to manage your LushHeirLoom website!