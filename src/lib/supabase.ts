import { createClient } from '@supabase/supabase-js'

// Get Supabase configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.'
  )
}

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

export interface CarouselImage {
  id: number;
  title?: string; // Optional - for image-only slides
  subtitle?: string; // Optional - for image-only slides
  button_text?: string; // Optional - for image-only slides
  button_link?: string; // Optional - for image-only slides
  image_url: string;
  image_path: string;
  mobile_image_url: string;
  mobile_image_path: string;
  order_index: number;
  is_active: boolean;
  // Overlay configuration
  overlay_enabled?: boolean;
  overlay_type?: 'none' | 'solid' | 'gradient-lr' | 'gradient-tb' | 'gradient-radial';
  overlay_color?: string;
  overlay_opacity?: number;
  overlay_gradient_start?: string;
  overlay_gradient_end?: string;
  created_at: string;
  updated_at: string;
}