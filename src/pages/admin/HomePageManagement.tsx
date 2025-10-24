import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RealtimeStatusIndicator } from '@/components/RealtimeStatusIndicator'
import { useAdminCacheInvalidation } from '@/lib/adminCacheIntegration'
import { Plus, Edit, Trash2, Upload, Image as ImageIcon, Eye, EyeOff, Info } from 'lucide-react'

interface ProductDisplaySection {
  id: number;
  section_title: string;
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

interface ProductDisplayItem {
  id: number;
  section_id: number;
  title: string;
  image_url: string;
  image_path: string;
  button_text: string;
  button_link: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const HomePageManagement = () => {
  const [sections, setSections] = useState<ProductDisplaySection[]>([])
  const [items, setItems] = useState<ProductDisplayItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingSection, setEditingSection] = useState<ProductDisplaySection | null>(null)
  const [editingItem, setEditingItem] = useState<ProductDisplayItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [uploading, setUploading] = useState(false)
  const [selectedSection, setSelectedSection] = useState<number | null>(null)

  // Cache invalidation hook
  const { withCacheInvalidation, showSuccess } = useAdminCacheInvalidation();

  // Section form state
  const [sectionFormData, setSectionFormData] = useState({
    section_title: 'Our Products',
    is_active: true,
    order_index: 1
  })

  // Item form state
  const [itemFormData, setItemFormData] = useState({
    title: '',
    button_text: 'Shop',
    button_link: '/shop',
    order_index: 1,
    is_active: true
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')

  useEffect(() => {
    fetchSections()
    fetchItems()
    // Test storage access on component mount
    testStorageAccess()
  }, [])

  const fetchSections = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('product_display_sections')
        .select('*')
        .order('order_index')

      if (error) throw error
      setSections(data || [])
    } catch (error: any) {
      setError('Failed to fetch sections: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('product_display_items')
        .select('*')
        .order('section_id, order_index')

      if (error) throw error
      setItems(data || [])
    } catch (error: any) {
      setError('Failed to fetch items: ' + error.message)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, WebP supported)')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    // Check image dimensions for optimal display
    const img = new Image()
    const url = URL.createObjectURL(file)
    
    img.onload = () => {
      const aspectRatio = img.width / img.height
      const idealAspectRatio = 4 / 3 // 1.333...
      
      // Show warning if aspect ratio is significantly different from 4:3
      if (Math.abs(aspectRatio - idealAspectRatio) > 0.2) {
        setError(`Image aspect ratio is ${aspectRatio.toFixed(2)}:1. For best results, use 4:3 aspect ratio (800×600px recommended)`)
        // Still allow the upload, just show warning
      } else {
        setError('') // Clear any previous errors
      }
      
      // If image is very small, show a warning
      if (img.width < 400 || img.height < 300) {
        setError(`Image is ${img.width}×${img.height}px. For better quality, use at least 800×600px`)
      }
      
      URL.revokeObjectURL(url) // Clean up
    }
    
    img.onerror = () => {
      setError('Invalid image file')
      URL.revokeObjectURL(url)
    }
    
    img.src = url

    setSelectedFile(file)
    setPreviewUrl(url)
  }

  const uploadImageToSupabase = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `product-display/${fileName}`

    try {
      // Uploading image to Supabase storage

      // Ensure user is authenticated before upload
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('No active session. Please login again.')
      }

      // Try to upload directly to the images bucket
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false // Don't overwrite existing files
        })

      if (uploadError) {
        // Storage upload error
        
        // Provide specific error messages for common issues
        if (uploadError.message.includes('not found') || uploadError.message.includes('bucket')) {
          throw new Error('Storage bucket not accessible. Please ensure you are logged in as an admin.')
        } else if (uploadError.message.includes('policy')) {
          throw new Error('Permission denied. Please check your admin privileges.')
        } else if (uploadError.message.includes('duplicate') || uploadError.message.includes('already exists')) {
          // Try with a different filename if duplicate
          const retryFileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`
          const retryPath = `product-display/${retryFileName}`
          
          // File exists, retrying with new name
          const { error: retryError } = await supabase.storage
            .from('images')
            .upload(retryPath, file, { cacheControl: '3600', upsert: false })
            
          if (retryError) {
            throw new Error(`Upload failed after retry: ${retryError.message}`)
          }
          
          // Update filePath for the retry
          const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(retryPath)
            
          // Image uploaded successfully after retry
          return publicUrl
        } else {
          throw new Error(`Upload failed: ${uploadError.message}`)
        }
      }

      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath)

      // Image uploaded successfully
      
      return publicUrl
    } catch (error: any) {
      // Error uploading to Supabase storage
      throw new Error(`Failed to upload image: ${error.message}`)
    }
  }

  // Helper function to extract file path from Supabase URL
  const extractFilePathFromUrl = (url: string): string | null => {
    if (!url) return null
    
    try {
      // Supabase storage URLs typically follow this pattern:
      // https://[project-id].supabase.co/storage/v1/object/public/[bucket]/[path]
      const urlParts = url.split('/storage/v1/object/public/images/')
      if (urlParts.length === 2) {
        return urlParts[1] // Return the file path after the bucket name
      }
      
      // Alternative pattern for different URL formats
      const altPattern = url.match(/\/images\/(.+)$/)
      if (altPattern) {
        return altPattern[1]
      }
      
      return null
    } catch (error) {
      // Error extracting file path from URL
      return null
    }
  }

  // Comprehensive storage and auth diagnostic
  const testStorageAccess = async () => {
    try {
      // === COMPREHENSIVE STORAGE DIAGNOSTIC ===
      
      // Test 1: Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      // Auth status check
      
      if (authError) {
        // Auth error
        setError(`Auth error: ${authError.message}`)
        return false
      }

      if (!user) {
        // No user found
        setError('No user authenticated')
        return false
      }

      // Test 2: Check admin status
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', user.id)
        .single()

      // Admin status check
      
      if (adminError || !adminUser) {
        // Admin check failed
        setError('Admin privileges not found')
        return false
      }

      // Test 3: Try to list buckets
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
            // Buckets access check completed
      // Available buckets check

      if (bucketsError) {
        // Buckets error
      }

      // Test 4: Try to list files in images bucket
      const { data: files, error: listError } = await supabase.storage
        .from('images')
        .list('', { limit: 5 })
      
      // Images bucket access check
      
      if (listError) {
        // Images bucket error
        setError(`Storage error: ${listError.message}`)
        return false
      }

      // All storage tests passed
      setSuccess('Storage access test passed successfully!')
      return true
    } catch (error: any) {
      // Diagnostic test failed
      setError(`Diagnostic failed: ${error.message}`)
      return false
    }
  }

  // Helper function to get storage statistics
  const getStorageStats = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('images')
        .list('product-display', {
          limit: 1000,
          sortBy: { column: 'created_at', order: 'desc' }
        })

      if (error) {
        // Error fetching storage stats
        return { fileCount: 0, totalSize: 0 }
      }

      const fileCount = data?.length || 0
      const totalSize = data?.reduce((sum, file) => sum + (file.metadata?.size || 0), 0) || 0
      
      // Storage stats calculated
      return { fileCount, totalSize }
    } catch (error) {
      // Error calculating storage stats
      return { fileCount: 0, totalSize: 0 }
    }
  }

  // Helper function to delete image from Supabase storage
  const deleteImageFromStorage = async (imageUrl: string, imagePath?: string): Promise<boolean> => {
    try {
      // Skip deletion for external URLs (not hosted in our storage)
      if (!imageUrl.includes(window.location.hostname) && !imageUrl.includes('supabase.co')) {
        // Skipping deletion of external image URL
        return true
      }

      let pathToDelete = imagePath || extractFilePathFromUrl(imageUrl)
      
      if (!pathToDelete) {
        // Could not determine file path for deletion
        return false
      }

      // Deleting image from storage

      const { error: deleteError } = await supabase.storage
        .from('images')
        .remove([pathToDelete])

      if (deleteError) {
        // Error deleting image from storage
        // Check if error is because file doesn't exist - that's OK
        if (deleteError.message?.includes('not found') || deleteError.message?.includes('does not exist')) {
          // Image already removed from storage
          return true
        }
        return false
      } else {
        // Image deleted from storage successfully
        return true
      }
    } catch (error) {
      // Unexpected error deleting image
      return false
    }
  }

  const handleSectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      await withCacheInvalidation(async () => {
        if (editingSection) {
          // Update existing section
          const { error } = await supabase
            .from('product_display_sections')
            .update({
              section_title: sectionFormData.section_title,
              is_active: sectionFormData.is_active,
              order_index: sectionFormData.order_index,
              updated_at: new Date().toISOString()
            })
            .eq('id', editingSection.id)

          if (error) throw error
        } else {
          // Create new section
          const { error } = await supabase
            .from('product_display_sections')
            .insert([{
              section_title: sectionFormData.section_title,
              is_active: sectionFormData.is_active,
              order_index: sectionFormData.order_index
            }])

          if (error) throw error
        }
      }, 'product_display_sections', `Product display section ${editingSection ? 'updated' : 'created'}`);

      await fetchSections()
      resetSectionForm()
      setIsDialogOpen(false)
      setSuccess(showSuccess(`Product display section ${editingSection ? 'updated' : 'created'}`))
    } catch (error: any) {
      setError('Failed to save section: ' + error.message)
    }
  }

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!selectedSection) {
      setError('Please select a section first')
      return
    }

    // Debug: Check authentication status
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      // Current user check
      
      if (authError || !user) {
        setError('Authentication error. Please refresh and login again.')
        return
      }

      // Check if user exists in admin_users table
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('id, email, role')
        .eq('id', user.id)
        .single()

      if (adminError || !adminUser) {
        // Admin user not found
        setError('Admin access required. User not found in admin database.')
        return
      }

      // Admin user confirmed
    } catch (authErr) {
      // Auth check failed
      setError('Authentication check failed. Please refresh and try again.')
      return
    }

    try {
      setUploading(true)
      let imageUrl = editingItem?.image_url || ''
      let imagePath = editingItem?.image_path || ''
      let oldImageUrl = editingItem?.image_url
      let oldImagePath = editingItem?.image_path

      // Upload new image if file is selected
      if (selectedFile) {
        // Uploading new image to Supabase storage
        try {
          // Upload new image first
          imageUrl = await uploadImageToSupabase(selectedFile)
          imagePath = `product-display/${selectedFile.name}`
          // New image uploaded successfully

          // If this is an update operation and we had an old image, delete it
          if (editingItem && oldImageUrl && oldImageUrl !== imageUrl) {
            // Deleting old image from storage
            await deleteImageFromStorage(oldImageUrl, oldImagePath)
          }
        } catch (uploadError: any) {
          // Image upload failed
          setError(`Image upload failed: ${uploadError.message}`)
          return
        }
      }

      const itemData = {
        section_id: selectedSection,
        title: itemFormData.title,
        image_url: imageUrl,
        image_path: imagePath,
        button_text: itemFormData.button_text,
        button_link: itemFormData.button_link,
        order_index: itemFormData.order_index,
        is_active: itemFormData.is_active
      }

      await withCacheInvalidation(async () => {
        if (editingItem) {
          // Update existing item
          const { error } = await supabase
            .from('product_display_items')
            .update({
              ...itemData,
              updated_at: new Date().toISOString()
            })
            .eq('id', editingItem.id)

          if (error) throw error
        } else {
          // Create new item
          const { error } = await supabase
            .from('product_display_items')
            .insert([itemData])

          if (error) throw error
        }
      }, 'product_display_items', `Product display item ${editingItem ? 'updated' : 'created'}`);

      await fetchItems()
      resetItemForm()
      setIsItemDialogOpen(false)
      setSuccess(showSuccess(`Product display item ${editingItem ? 'updated' : 'created'}`))
    } catch (error: any) {
      setError('Failed to save item: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const resetSectionForm = () => {
    setSectionFormData({
      section_title: 'Our Products',
      is_active: true,
      order_index: sections.length + 1
    })
    setEditingSection(null)
  }

  const resetItemForm = () => {
    setItemFormData({
      title: '',
      button_text: 'Shop',
      button_link: '/shop',
      order_index: 1,
      is_active: true
    })
    setSelectedFile(null)
    setPreviewUrl('')
    setEditingItem(null)
  }

  const handleEditSection = (section: ProductDisplaySection) => {
    setEditingSection(section)
    setSectionFormData({
      section_title: section.section_title,
      is_active: section.is_active,
      order_index: section.order_index
    })
    setIsDialogOpen(true)
  }

  const handleEditItem = (item: ProductDisplayItem) => {
    setEditingItem(item)
    setItemFormData({
      title: item.title,
      button_text: item.button_text,
      button_link: item.button_link,
      order_index: item.order_index,
      is_active: item.is_active
    })
    setSelectedSection(item.section_id)
    setIsItemDialogOpen(true)
  }

  const handleDeleteSection = async (id: number) => {
    const sectionToDelete = sections.find(section => section.id === id)
    const itemsToDelete = items.filter(item => item.section_id === id)
    const imagesCount = itemsToDelete.filter(item => item.image_url).length
    
    const message = `Are you sure you want to delete "${sectionToDelete?.section_title}"?\n\n⚠️ This will permanently remove:\n• The section from your homepage\n• ${itemsToDelete.length} item(s) within this section\n• ${imagesCount} associated image(s) from storage\n\nThis action cannot be undone.`
    
    if (!confirm(message)) return

    try {
      // First, get all items in this section to clean up their images
      const itemsToDelete = items.filter(item => item.section_id === id)
      
      await withCacheInvalidation(async () => {
        // Delete all associated images from storage first
        if (itemsToDelete.length > 0) {
          // Deleting associated images from storage
          
          // Delete images in parallel for better performance
          const imageDeletePromises = itemsToDelete
            .filter(item => item.image_url) // Only process items with images
            .map(item => deleteImageFromStorage(item.image_url, item.image_path))
          
          await Promise.allSettled(imageDeletePromises) // Use allSettled to continue even if some deletions fail
        }

        // Then delete all items in this section
        await supabase
          .from('product_display_items')
          .delete()
          .eq('section_id', id)

        // Finally delete the section
        const { error } = await supabase
          .from('product_display_sections')
          .delete()
          .eq('id', id)

        if (error) throw error
      }, 'product_display_sections', 'Product display section deleted');

      await Promise.all([fetchSections(), fetchItems()])
      setSuccess(showSuccess('Product display section and all associated images deleted'))
    } catch (error: any) {
      setError('Failed to delete section: ' + error.message)
    }
  }

  const handleDeleteItem = async (id: number) => {
    const itemToDelete = items.find(item => item.id === id)
    const hasImage = itemToDelete?.image_url
    
    const message = hasImage 
      ? `Are you sure you want to delete "${itemToDelete?.title}"?\n\n⚠️ This will permanently remove:\n• The item from your homepage\n• The associated image from storage\n\nThis action cannot be undone.`
      : `Are you sure you want to delete "${itemToDelete?.title}"?`
    
    if (!confirm(message)) return

    try {
      // First, get the item details to retrieve image information
      const itemToDelete = items.find(item => item.id === id)
      
      await withCacheInvalidation(async () => {
        // Delete associated image from storage first
        if (itemToDelete?.image_url) {
          // Deleting associated image from storage before removing item
          await deleteImageFromStorage(itemToDelete.image_url, itemToDelete.image_path)
        }

        // Then delete the database record
        const { error } = await supabase
          .from('product_display_items')
          .delete()
          .eq('id', id)

        if (error) throw error
      }, 'product_display_items', 'Product display item deleted');

      await fetchItems()
      setSuccess(showSuccess('Product display item and associated image deleted'))
    } catch (error: any) {
      setError('Failed to delete item: ' + error.message)
    }
  }

  const getItemsForSection = (sectionId: number) => {
    return items.filter(item => item.section_id === sectionId)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">HomePage Management</h1>
          <p className="text-muted-foreground">Manage product display sections on the homepage</p>
        </div>
        <RealtimeStatusIndicator />
      </div>

      {/* Image Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-blue-800">Image Guidelines & Storage Management</h3>
            <ul className="text-sm text-blue-700 mt-1 space-y-1">
              <li>• <strong>Recommended size:</strong> 800×600 pixels (4:3 aspect ratio)</li>
              <li>• <strong>Maximum file size:</strong> 10MB per image</li>
              <li>• <strong>Supported formats:</strong> JPG, PNG, WebP</li>
              <li>• <strong>Display:</strong> Images will be displayed in a 4:3 aspect ratio on the homepage</li>
              <li>• <strong>Storage optimization:</strong> Old images are automatically deleted when updated or removed</li>
            </ul>
            <div className="mt-3 pt-3 border-t border-blue-200">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => testStorageAccess()}
                className="text-blue-700 border-blue-300 hover:bg-blue-100"
              >
                Test Storage Access
              </Button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription className="text-green-600">{success}</AlertDescription>
        </Alert>
      )}

      {/* Sections Management */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Product Display Sections</CardTitle>
              <CardDescription>Manage homepage product display sections</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetSectionForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Section
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingSection ? 'Edit Section' : 'Add New Section'}
                  </DialogTitle>
                  <DialogDescription>
                    Configure the product display section settings
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSectionSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Section Title</label>
                    <Input
                      value={sectionFormData.section_title}
                      onChange={(e) => setSectionFormData({ ...sectionFormData, section_title: e.target.value })}
                      placeholder="e.g., Our Products"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Order Index</label>
                    <Input
                      type="number"
                      value={sectionFormData.order_index}
                      onChange={(e) => setSectionFormData({ ...sectionFormData, order_index: parseInt(e.target.value) })}
                      min="1"
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={sectionFormData.is_active}
                      onCheckedChange={(checked) => setSectionFormData({ ...sectionFormData, is_active: checked })}
                    />
                    <label className="text-sm font-medium">Active</label>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingSection ? 'Update' : 'Create'} Section
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {sections.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No sections found. Create your first section!</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sections.map((section) => (
                  <TableRow key={section.id}>
                    <TableCell className="font-medium">{section.section_title}</TableCell>
                    <TableCell>{getItemsForSection(section.id).length} items</TableCell>
                    <TableCell>{section.order_index}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {section.is_active ? (
                          <>
                            <Eye className="h-4 w-4 text-green-500" />
                            <span className="text-green-500">Active</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-400">Inactive</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditSection(section)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSection(section.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Items Management */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Product Display Items</CardTitle>
              <CardDescription>Manage individual items within sections</CardDescription>
            </div>
            <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetItemForm} disabled={sections.length === 0}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingItem ? 'Edit Item' : 'Add New Item'}
                  </DialogTitle>
                  <DialogDescription>
                    Configure the product display item
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleItemSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Section</label>
                      <select
                        className="w-full p-2 border rounded-md"
                        value={selectedSection || ''}
                        onChange={(e) => setSelectedSection(parseInt(e.target.value))}
                        required
                      >
                        <option value="">Select Section</option>
                        {sections.filter(s => s.is_active).map((section) => (
                          <option key={section.id} value={section.id}>
                            {section.section_title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Title</label>
                      <Input
                        value={itemFormData.title}
                        onChange={(e) => setItemFormData({ ...itemFormData, title: e.target.value })}
                        placeholder="e.g., Family Memory Albums"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Image</label>
                    <p className="text-xs text-gray-500 mb-2">
                      Recommended size: 800×600px (4:3 aspect ratio) | Max file size: 10MB | Formats: JPG, PNG, WebP
                    </p>
                    <div className="mt-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="item-image-upload"
                      />
                      <label
                        htmlFor="item-image-upload"
                        className="cursor-pointer flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400"
                      >
                        {previewUrl || editingItem?.image_url ? (
                          <img
                            src={previewUrl || editingItem?.image_url}
                            alt="Preview"
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <div className="text-center">
                            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-500">Click to upload image</p>
                            <p className="mt-1 text-xs text-gray-400">800×600px recommended</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Button Text</label>
                      <Input
                        value={itemFormData.button_text}
                        onChange={(e) => setItemFormData({ ...itemFormData, button_text: e.target.value })}
                        placeholder="Shop"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Button Link</label>
                      <Input
                        value={itemFormData.button_link}
                        onChange={(e) => setItemFormData({ ...itemFormData, button_link: e.target.value })}
                        placeholder="/shop"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Order Index</label>
                      <Input
                        type="number"
                        value={itemFormData.order_index}
                        onChange={(e) => setItemFormData({ ...itemFormData, order_index: parseInt(e.target.value) })}
                        min="1"
                        required
                      />
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                      <Switch
                        checked={itemFormData.is_active}
                        onCheckedChange={(checked) => setItemFormData({ ...itemFormData, is_active: checked })}
                      />
                      <label className="text-sm font-medium">Active</label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsItemDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={uploading}>
                      {uploading ? 'Uploading...' : editingItem ? 'Update' : 'Create'} Item
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {sections.length === 0 ? (
            <div className="text-center py-8">
              <Info className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-muted-foreground">Create a section first to add items</p>
            </div>
          ) : items.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No items found. Create your first item!</p>
          ) : (
            <div className="space-y-6">
              {sections.filter(s => s.is_active).map((section) => {
                const sectionItems = getItemsForSection(section.id)
                return (
                  <div key={section.id}>
                    <h3 className="font-semibold mb-3">{section.section_title}</h3>
                    {sectionItems.length === 0 ? (
                      <p className="text-sm text-muted-foreground mb-4">No items in this section</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Image</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Button</TableHead>
                            <TableHead>Order</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sectionItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                {item.image_url && (
                                  <img
                                    src={item.image_url}
                                    alt={item.title}
                                    className="w-16 h-12 object-cover rounded"
                                  />
                                )}
                              </TableCell>
                              <TableCell className="font-medium">{item.title}</TableCell>
                              <TableCell>
                                <span className="text-sm">{item.button_text}</span>
                                <br />
                                <span className="text-xs text-muted-foreground">{item.button_link}</span>
                              </TableCell>
                              <TableCell>{item.order_index}</TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  {item.is_active ? (
                                    <>
                                      <Eye className="h-4 w-4 text-green-500" />
                                      <span className="text-green-500">Active</span>
                                    </>
                                  ) : (
                                    <>
                                      <EyeOff className="h-4 w-4 text-gray-400" />
                                      <span className="text-gray-400">Inactive</span>
                                    </>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditItem(item)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteItem(item.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default HomePageManagement