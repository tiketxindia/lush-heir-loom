import { createClient } from '@supabase/supabase-js'

// Using MCP configuration from .vscode/mcp.json
const supabaseUrl = 'https://ezfbekvpmzykjniyyrof.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6ZmJla3ZwbXp5a2puaXl5cm9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMDEzODUsImV4cCI6MjA3Njc3NzM4NX0.gmwiEYru9N-GFH0VC7eAJZIiHaMW3Z_8DivQVWyptY4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database table types
export interface MenuItem {
  id: number
  name: string
  href: string
  order_index: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: number
  name: string
  category: string
  price: number
  image: string
  tag?: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AdminUser {
  id: string
  email: string
  role: 'admin' | 'super_admin'
  created_at: string
}