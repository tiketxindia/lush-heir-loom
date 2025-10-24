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
import { Plus, Edit, Trash2, Upload, Image as ImageIcon, Eye, EyeOff, Monitor, Smartphone, Info } from 'lucide-react'

interface CarouselImage {
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

export const CarouselManagement = () => {
  const [carouselImages, setCarouselImages] = useState<CarouselImage[]>([])
  const [loading, setLoading] = useState(true)
  const [editingImage, setEditingImage] = useState<CarouselImage | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [uploading, setUploading] = useState(false)

  // Cache invalidation hook
  const { invalidateCarouselImages, withCacheInvalidation, showSuccess } = useAdminCacheInvalidation();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    button_text: '',
    button_link: '',
    order_index: 1,
    is_active: true,
    // Overlay configuration
    overlay_enabled: false,
    overlay_type: 'gradient-lr' as 'none' | 'solid' | 'gradient-lr' | 'gradient-tb' | 'gradient-radial',
    overlay_color: '#000000',
    overlay_opacity: 50,
    overlay_gradient_start: '#000000',
    overlay_gradient_end: '#000000'
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedMobileFile, setSelectedMobileFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [mobilePreviewUrl, setMobilePreviewUrl] = useState<string>('')

  useEffect(() => {
    fetchCarouselImages()
  }, [])

  const fetchCarouselImages = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('carousel_images')
        .select('*')
        .order('order_index')

      if (error) throw error
      setCarouselImages(data || [])
    } catch (error: any) {
      setError('Failed to fetch carousel images: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, isMobile: boolean = false) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    if (isMobile) {
      setSelectedMobileFile(file)
      // Create mobile preview URL
      const url = URL.createObjectURL(file)
      setMobilePreviewUrl(url)
    } else {
      setSelectedFile(file)
      // Create desktop preview URL
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
    
    setError('')
  }

  const uploadImageToSupabase = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `carousel/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('carousel-images')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('carousel-images')
      .getPublicUrl(filePath)

    return publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Check if we have 5 or more images (limit to 5)
    if (!editingImage && carouselImages.length >= 5) {
      setError('Maximum 5 carousel images allowed')
      return
    }

    // Validate required fields - only image is required now
    // Title and button are optional for image-only slides

    if (!editingImage && !selectedFile) {
      setError('Please select a desktop image')
      return
    }

    if (!editingImage && !selectedMobileFile) {
      setError('Please select a mobile image')
      return
    }

    // If button text is provided, button link should also be provided
    if (formData.button_text.trim() && !formData.button_link.trim()) {
      setError('Button link is required when button text is provided')
      return
    }

    // If button link is provided, button text should also be provided
    if (formData.button_link.trim() && !formData.button_text.trim()) {
      setError('Button text is required when button link is provided')
      return
    }

    try {
      setUploading(true)
      
      let imageUrl = editingImage?.image_url || ''
      let imagePath = editingImage?.image_path || ''
      let mobileImageUrl = editingImage?.mobile_image_url || ''
      let mobileImagePath = editingImage?.mobile_image_path || ''

      // Upload new desktop image if file is selected
      if (selectedFile) {
        imageUrl = await uploadImageToSupabase(selectedFile)
        imagePath = `carousel/${selectedFile.name}`
      }

      // Upload new mobile image if file is selected
      if (selectedMobileFile) {
        mobileImageUrl = await uploadImageToSupabase(selectedMobileFile)
        mobileImagePath = `carousel/mobile-${selectedMobileFile.name}`
      }

      const imageData = {
        title: formData.title.trim() || null, // Store empty title as null
        subtitle: formData.subtitle.trim() || null, // Store empty subtitle as null
        button_text: formData.button_text.trim() || null, // Store empty button text as null
        button_link: formData.button_link.trim() || null, // Store empty button link as null
        image_url: imageUrl,
        image_path: imagePath,
        mobile_image_url: mobileImageUrl,
        mobile_image_path: mobileImagePath,
        order_index: formData.order_index,
        is_active: formData.is_active,
        // Overlay configuration
        overlay_enabled: formData.overlay_enabled,
        overlay_type: formData.overlay_type,
        overlay_color: formData.overlay_color,
        overlay_opacity: formData.overlay_opacity,
        overlay_gradient_start: formData.overlay_gradient_start,
        overlay_gradient_end: formData.overlay_gradient_end
      }

      if (editingImage) {
        // Update existing image
        await withCacheInvalidation(async () => {
          const { error } = await supabase
            .from('carousel_images')
            .update(imageData)
            .eq('id', editingImage.id)

          if (error) throw error
        }, 'carousel_images', 'Carousel image updated');
        
        setSuccess(showSuccess('Carousel image updated'))
      } else {
        // Create new image
        await withCacheInvalidation(async () => {
          const { error } = await supabase
            .from('carousel_images')
            .insert(imageData)

          if (error) throw error
        }, 'carousel_images', 'Carousel image created');
        
        setSuccess(showSuccess('Carousel image created'))
      }

      // Refresh data and close dialog
      await fetchCarouselImages()
      resetForm()
      setIsDialogOpen(false)
      
    } catch (error: any) {
      setError('Failed to save carousel image: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (image: CarouselImage) => {
    if (!confirm('Are you sure you want to delete this carousel image?')) return

    try {
      await withCacheInvalidation(async () => {
        // Delete from database
        const { error } = await supabase
          .from('carousel_images')
          .delete()
          .eq('id', image.id)

        if (error) throw error

        // Delete from storage (if it's a custom uploaded image)
        if (image.image_path.startsWith('carousel/')) {
          await supabase.storage
            .from('carousel-images')
            .remove([image.image_path])
        }

        // Delete mobile image from storage if exists
        if (image.mobile_image_path?.startsWith('carousel/')) {
          await supabase.storage
            .from('carousel-images')
            .remove([image.mobile_image_path])
        }
      }, 'carousel_images', 'Carousel image deleted');

      setSuccess(showSuccess('Carousel image deleted'))
      await fetchCarouselImages()
    } catch (error: any) {
      setError('Failed to delete carousel image: ' + error.message)
    }
  }

  const handleToggleActive = async (image: CarouselImage) => {
    try {
      await withCacheInvalidation(async () => {
        const { error } = await supabase
          .from('carousel_images')
          .update({ is_active: !image.is_active })
          .eq('id', image.id)

        if (error) throw error
      }, 'carousel_images', `Carousel image ${!image.is_active ? 'activated' : 'deactivated'}`);
      
      await fetchCarouselImages()
      console.log('✅', showSuccess(`Carousel image ${!image.is_active ? 'activated' : 'deactivated'}`));
    } catch (error: any) {
      setError('Failed to update image status: ' + error.message)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      button_text: '', // No default value for optional field
      button_link: '', // No default value for optional field
      order_index: carouselImages.length + 1,
      is_active: true,
      // Overlay configuration
      overlay_enabled: false,
      overlay_type: 'gradient-lr' as 'none' | 'solid' | 'gradient-lr' | 'gradient-tb' | 'gradient-radial',
      overlay_color: '#000000',
      overlay_opacity: 50,
      overlay_gradient_start: '#000000',
      overlay_gradient_end: '#000000'
    })
    setSelectedFile(null)
    setSelectedMobileFile(null)
    setPreviewUrl('')
    setMobilePreviewUrl('')
    setEditingImage(null)
    setError('')
    setSuccess('')
  }

  const openEditDialog = (image: CarouselImage) => {
    setEditingImage(image)
    setFormData({
      title: image.title || '', // Handle null values from database
      subtitle: image.subtitle || '', // Handle null values from database
      button_text: image.button_text || '', // Handle null values from database
      button_link: image.button_link || '', // Handle null values from database
      order_index: image.order_index,
      is_active: image.is_active,
      // Overlay configuration with fallbacks
      overlay_enabled: image.overlay_enabled || false,
      overlay_type: image.overlay_type || 'gradient-lr',
      overlay_color: image.overlay_color || '#000000',
      overlay_opacity: image.overlay_opacity || 50,
      overlay_gradient_start: image.overlay_gradient_start || '#000000',
      overlay_gradient_end: image.overlay_gradient_end || '#000000'
    })
    setPreviewUrl(image.image_url)
    setMobilePreviewUrl(image.mobile_image_url || image.image_url) // Fallback to desktop if mobile not set
    setIsDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <ImageIcon className="h-8 w-8 text-gray-400" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Carousel Management</h1>
            <p className="text-gray-600 mt-2">Manage hero carousel images and content</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <ImageIcon className="h-8 w-8 text-gray-700" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Carousel Management</h1>
            <p className="text-gray-600 mt-2">
              Manage hero carousel images and content (Max 5 images) • 
              Desktop: 1920×600px • Mobile: 800×600px
            </p>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={resetForm}
              disabled={carouselImages.length >= 5}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Carousel Image
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingImage ? 'Edit Carousel Image' : 'Add New Carousel Image'}
              </DialogTitle>
              <DialogDescription>
                {editingImage 
                  ? 'Update the carousel image details below.' 
                  : 'Upload a new hero image and configure its content.'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Desktop Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <Monitor className="h-4 w-4 text-blue-600" />
                    <span>Desktop Image *</span>
                    <span className="text-blue-600 font-mono text-xs">(1920×600px recommended)</span>
                  </div>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {previewUrl ? (
                    <div className="space-y-4">
                      <img 
                        src={previewUrl} 
                        alt="Desktop Preview" 
                        className="max-h-48 mx-auto rounded-lg object-cover border"
                        style={{ aspectRatio: '16/5' }}
                      />
                      <div className="text-xs text-gray-500 mb-2">
                        Preview: Desktop view (16:5 aspect ratio)
                      </div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => document.getElementById('desktop-image-upload')?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Change Desktop Image
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Monitor className="h-12 w-12 mx-auto text-blue-400" />
                      <div>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => document.getElementById('desktop-image-upload')?.click()}
                        >
                          Upload Desktop Image
                        </Button>
                        <div className="text-xs text-gray-500 mt-2 space-y-1">
                          <div><strong>Optimal:</strong> 1920×600px (16:5 ratio)</div>
                          <div><strong>Minimum:</strong> 1440×450px</div>
                          <div>JPG/PNG • Max 10MB • Landscape orientation</div>
                        </div>
                      </div>
                    </div>
                  )}
                  <input
                    id="desktop-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, false)}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Mobile Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="h-4 w-4 text-green-600" />
                    <span>Mobile Image *</span>
                    <span className="text-green-600 font-mono text-xs">(800×600px recommended)</span>
                  </div>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {mobilePreviewUrl ? (
                    <div className="space-y-4">
                      <img 
                        src={mobilePreviewUrl} 
                        alt="Mobile Preview" 
                        className="max-h-48 mx-auto rounded-lg object-cover border"
                        style={{ aspectRatio: '4/3' }}
                      />
                      <div className="text-xs text-gray-500 mb-2">
                        Preview: Mobile view (4:3 aspect ratio)
                      </div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => document.getElementById('mobile-image-upload')?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Change Mobile Image
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Smartphone className="h-12 w-12 mx-auto text-green-400" />
                      <div>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => document.getElementById('mobile-image-upload')?.click()}
                        >
                          Upload Mobile Image
                        </Button>
                        <div className="text-xs text-gray-500 mt-2 space-y-1">
                          <div><strong>Optimal:</strong> 800×600px (4:3 ratio)</div>
                          <div><strong>Minimum:</strong> 600×450px</div>
                          <div>JPG/PNG • Max 10MB • Square/portrait friendly</div>
                        </div>
                      </div>
                    </div>
                  )}
                  <input
                    id="mobile-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, true)}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Content Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title <span className="text-gray-500 text-xs">(optional - for image-only slides, leave empty)</span>
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., CRAFTED WITH LOVE"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subtitle <span className="text-gray-500 text-xs">(optional)</span>
                  </label>
                  <Textarea
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="Describe your products or brand message..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Button Text <span className="text-gray-500 text-xs">(optional)</span>
                  </label>
                  <Input
                    value={formData.button_text}
                    onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                    placeholder="e.g., Shop Now"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Button Link <span className="text-gray-500 text-xs">(optional)</span>
                  </label>
                  <Input
                    value={formData.button_link}
                    onChange={(e) => setFormData({ ...formData, button_link: e.target.value })}
                    placeholder="e.g., /shop"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={formData.order_index}
                    onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Active
                  </label>
                </div>
              </div>

              {/* Overlay Configuration Section */}
              <div className="md:col-span-2 border-t pt-4 mt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Overlay Configuration
                </h3>
                
                <div className="space-y-4">
                  {/* Enable Overlay */}
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.overlay_enabled}
                      onCheckedChange={(checked) => setFormData({ ...formData, overlay_enabled: checked })}
                    />
                    <label className="text-sm font-medium text-gray-700">
                      Enable Image Overlay
                    </label>
                  </div>

                  {formData.overlay_enabled && (
                    <div className="space-y-4 ml-6 border-l-2 border-blue-100 pl-4">
                      {/* Overlay Type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Overlay Type
                        </label>
                        <select
                          value={formData.overlay_type}
                          onChange={(e) => setFormData({ ...formData, overlay_type: e.target.value as typeof formData.overlay_type })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="none">None</option>
                          <option value="solid">Solid Color</option>
                          <option value="gradient-lr">Gradient (Left to Right)</option>
                          <option value="gradient-tb">Gradient (Top to Bottom)</option>
                          <option value="gradient-radial">Radial Gradient</option>
                        </select>
                      </div>

                      {formData.overlay_type === 'solid' && (
                        <>
                          {/* Solid Color */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Overlay Color
                            </label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="color"
                                value={formData.overlay_color}
                                onChange={(e) => setFormData({ ...formData, overlay_color: e.target.value })}
                                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                              />
                              <Input
                                value={formData.overlay_color}
                                onChange={(e) => setFormData({ ...formData, overlay_color: e.target.value })}
                                placeholder="#000000"
                                className="flex-1"
                              />
                            </div>
                          </div>

                          {/* Opacity */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Opacity ({formData.overlay_opacity}%)
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={formData.overlay_opacity}
                              onChange={(e) => setFormData({ ...formData, overlay_opacity: parseInt(e.target.value) })}
                              className="w-full"
                            />
                          </div>
                        </>
                      )}

                      {(formData.overlay_type?.includes('gradient')) && (
                        <>
                          {/* Gradient Start Color */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Gradient Start Color
                            </label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="color"
                                value={formData.overlay_gradient_start}
                                onChange={(e) => setFormData({ ...formData, overlay_gradient_start: e.target.value })}
                                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                              />
                              <Input
                                value={formData.overlay_gradient_start}
                                onChange={(e) => setFormData({ ...formData, overlay_gradient_start: e.target.value })}
                                placeholder="#000000"
                                className="flex-1"
                              />
                            </div>
                          </div>

                          {/* Gradient End Color */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Gradient End Color
                            </label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="color"
                                value={formData.overlay_gradient_end}
                                onChange={(e) => setFormData({ ...formData, overlay_gradient_end: e.target.value })}
                                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                              />
                              <Input
                                value={formData.overlay_gradient_end}
                                onChange={(e) => setFormData({ ...formData, overlay_gradient_end: e.target.value })}
                                placeholder="#000000"
                                className="flex-1"
                              />
                            </div>
                          </div>
                        </>
                      )}

                      {/* Preview */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Overlay Preview
                        </label>
                        <div className="relative w-full h-20 bg-gray-200 rounded border overflow-hidden">
                          <div 
                            className="absolute inset-0"
                            style={{
                              background: formData.overlay_type === 'solid' 
                                ? `${formData.overlay_color}${Math.round(formData.overlay_opacity * 2.55).toString(16).padStart(2, '0')}`
                                : formData.overlay_type === 'gradient-lr'
                                ? `linear-gradient(to right, ${formData.overlay_gradient_start}, ${formData.overlay_gradient_end})`
                                : formData.overlay_type === 'gradient-tb'
                                ? `linear-gradient(to bottom, ${formData.overlay_gradient_start}, ${formData.overlay_gradient_end})`
                                : formData.overlay_type === 'gradient-radial'
                                ? `radial-gradient(circle, ${formData.overlay_gradient_start}, ${formData.overlay_gradient_end})`
                                : 'transparent'
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-white font-medium text-sm mix-blend-difference">
                              Sample Text
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading}>
                  {uploading ? 'Saving...' : editingImage ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Real-time Status Indicator */}
      <RealtimeStatusIndicator />

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert variant="default" className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Carousel Images ({carouselImages.length}/5)</CardTitle>
          <CardDescription>
            Manage your hero carousel images. Images will be displayed in order on your homepage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {carouselImages.length === 0 ? (
            <div className="text-center py-8">
              <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No carousel images</h3>
              <p className="text-gray-600 mb-4">Get started by adding your first hero image.</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Image
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <div className="flex items-center space-x-1">
                      <Monitor className="h-4 w-4 text-blue-600" />
                      <span>Desktop</span>
                      <span className="text-xs text-gray-500">(16:5)</span>
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center space-x-1">
                      <Smartphone className="h-4 w-4 text-green-600" />
                      <span>Mobile</span>
                      <span className="text-xs text-gray-500">(4:3)</span>
                    </div>
                  </TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {carouselImages.map((image) => (
                  <TableRow key={image.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <img
                          src={image.image_url}
                          alt={`${image.title || 'Carousel Image'} (Desktop)`}
                          className="w-24 h-8 object-cover rounded border"
                          style={{ aspectRatio: '16/5' }}
                        />
                        <div className="text-xs text-gray-500">1920×600</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <img
                          src={image.mobile_image_url || image.image_url}
                          alt={`${image.title || 'Carousel Image'} (Mobile)`}
                          className="w-16 h-12 object-cover rounded border"
                          style={{ aspectRatio: '4/3' }}
                        />
                        <div className="text-xs text-gray-500">800×600</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {image.title || <span className="text-gray-400 italic">Image-only slide</span>}
                        </div>
                        <div className="text-sm text-gray-600 truncate max-w-xs">
                          {image.subtitle || <span className="text-gray-400 text-xs">No subtitle</span>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{image.order_index}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={image.is_active}
                          onCheckedChange={() => handleToggleActive(image)}
                        />
                        {image.is_active ? (
                          <Eye className="h-4 w-4 text-green-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(image)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(image)}
                          className="text-red-600 hover:text-red-700"
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

      {carouselImages.length >= 5 && (
        <Alert>
          <AlertDescription>
            You've reached the maximum limit of 5 carousel images. Delete an existing image to add a new one.
          </AlertDescription>
        </Alert>
      )}

      {/* Image Sizing Guidelines */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="h-5 w-5" />
            <span>Image Sizing Guidelines</span>
          </CardTitle>
          <CardDescription>
            Optimal image dimensions for the best visual experience across all devices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Desktop Guidelines */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Monitor className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-lg">Desktop Images</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Recommended Size:</span>
                  <span className="text-blue-600 font-mono">1920 × 600px</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Minimum Size:</span>
                  <span className="text-orange-600 font-mono">1440 × 450px</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Aspect Ratio:</span>
                  <span className="font-mono">16:5 (3.2:1)</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Display Heights:</span>
                  <span className="font-mono">600px (md) • 700px (lg+)</span>
                </div>
                <div className="mt-3 p-2 bg-blue-50 rounded text-xs">
                  <strong>Design Tips:</strong> Place key content on the left side. Ensure text readability with appropriate contrast.
                </div>
              </div>
            </div>

            {/* Mobile Guidelines */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Smartphone className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-lg">Mobile Images</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Recommended Size:</span>
                  <span className="text-green-600 font-mono">800 × 600px</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Minimum Size:</span>
                  <span className="text-orange-600 font-mono">600 × 450px</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Aspect Ratio:</span>
                  <span className="font-mono">4:3 (1.33:1)</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Display Height:</span>
                  <span className="font-mono">400px</span>
                </div>
                <div className="mt-3 p-2 bg-green-50 rounded text-xs">
                  <strong>Design Tips:</strong> Center important content. Use larger fonts. Consider vertical composition.
                </div>
              </div>
            </div>
          </div>

          {/* Additional Guidelines */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">General Guidelines:</h4>
            <ul className="text-sm space-y-1 text-gray-700">
              <li>• <strong>File Format:</strong> JPEG (.jpg) recommended for photos, PNG (.png) for graphics with transparency</li>
              <li>• <strong>File Size:</strong> Maximum 10MB per image. Aim for 500KB-2MB for optimal loading speed</li>
              <li>• <strong>Quality:</strong> Use 85-95% JPEG quality for best balance of file size and visual quality</li>
              <li>• <strong>Color Space:</strong> sRGB color profile recommended for web display</li>
              <li>• <strong>Text Overlay:</strong> Ensure sufficient contrast between text and background imagery</li>
              <li>• <strong>Safe Zones:</strong> Keep important content away from edges to avoid cropping on different screen sizes</li>
            </ul>
          </div>

          {/* Responsive Breakpoints */}
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-semibold mb-2">Responsive Breakpoints:</h4>
            <div className="text-sm space-y-1">
              <div><strong>Mobile:</strong> 0px - 767px (shows mobile image at 400px height)</div>
              <div><strong>Tablet/Desktop:</strong> 768px - 1023px (shows desktop image at 600px height)</div>
              <div><strong>Large Desktop:</strong> 1024px+ (shows desktop image at 700px height)</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}