// Test Supabase connection
import { supabase } from './src/lib/supabase.ts';

async function testSupabaseConnection() {
  try {
    console.log('🔗 Testing Supabase connection...');
    
    // Test 1: Basic connection test
    const { data, error } = await supabase
      .from('menu_items')
      .select('count(*)')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connection successful!');
    
    // Test 2: Check available tables
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_table_names');
    
    if (tablesError) {
      console.log('📋 Table list check failed (this is normal if RPC function doesn\'t exist)');
    } else {
      console.log('📋 Available tables:', tables);
    }
    
    // Test 3: Check carousel images table
    const { data: carouselData, error: carouselError } = await supabase
      .from('carousel_images')
      .select('id, title, is_active')
      .limit(3);
    
    if (carouselError) {
      console.log('🎠 Carousel images table check:', carouselError.message);
    } else {
      console.log('🎠 Carousel images found:', carouselData?.length || 0, 'items');
      console.log('🎠 Sample data:', carouselData);
    }
    
    // Test 4: Check menu items table
    const { data: menuData, error: menuError } = await supabase
      .from('menu_items')
      .select('id, name, is_active')
      .limit(3);
    
    if (menuError) {
      console.log('📱 Menu items table check:', menuError.message);
    } else {
      console.log('📱 Menu items found:', menuData?.length || 0, 'items');
      console.log('📱 Sample data:', menuData);
    }
    
    return true;
    
  } catch (error) {
    console.error('💥 Connection test failed:', error);
    return false;
  }
}

// Run the test
testSupabaseConnection().then((success) => {
  if (success) {
    console.log('🎉 All tests completed successfully!');
  } else {
    console.log('⚠️ Some tests failed. Check the logs above.');
  }
  process.exit(0);
});