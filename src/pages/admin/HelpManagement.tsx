import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RealtimeStatusIndicator } from '@/components/RealtimeStatusIndicator'
import { useAdminCacheInvalidation } from '@/lib/adminCacheIntegration'
import { Plus, Edit, Trash2, HelpCircle, Eye, EyeOff, ExternalLink } from 'lucide-react'

interface HelpSettings {
  id: number;
  label: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface HelpItem {
  id: number;
  name: string;
  href: string;
  order_index: number;
  is_active: boolean;
  opens_in_new_tab: boolean;
  created_at: string;
  updated_at: string;
}

export const HelpManagement = () => {
  const [helpSettings, setHelpSettings] = useState<HelpSettings | null>(null)
  const [helpItems, setHelpItems] = useState<HelpItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<HelpItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  // Cache invalidation hooks
  const { invalidateHelpSettings, invalidateHelpItems, withCacheInvalidation, showSuccess } = useAdminCacheInvalidation();

  // Help settings form state
  const [helpLabel, setHelpLabel] = useState('Help')

  // Help item form state
  const [formData, setFormData] = useState({
    name: '',
    href: '',
    order_index: 1,
    is_active: true,
    opens_in_new_tab: false
  })

  useEffect(() => {
    fetchHelpData()
  }, [])

  const fetchHelpData = async () => {
    try {
      setLoading(true)
      
      // Fetch help settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('help_settings')
        .select('*')
        .limit(1)
        .single()

      if (settingsError && settingsError.code !== 'PGRST116') {
        console.error('Error fetching help settings:', settingsError)
      } else if (settingsData) {
        setHelpSettings(settingsData)
        setHelpLabel(settingsData.label)
      }

      // Fetch help items
      const { data: itemsData, error: itemsError } = await supabase
        .from('help_items')
        .select('*')
        .order('order_index')

      if (itemsError) {
        console.error('Error fetching help items:', itemsError)
      } else {
        setHelpItems(itemsData || [])
      }
    } catch (error: any) {
      setError('Failed to fetch help data: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveHelpSettings = async () => {
    try {
      setSaving(true)
      setError('')

      if (!helpLabel.trim()) {
        setError('Help label is required')
        return
      }

      await withCacheInvalidation(async () => {
        if (helpSettings) {
          // Update existing settings
          const { error } = await supabase
            .from('help_settings')
            .update({ label: helpLabel })
            .eq('id', helpSettings.id)

          if (error) throw error
        } else {
          // Create new settings
          const { error } = await supabase
            .from('help_settings')
            .insert({ label: helpLabel })

          if (error) throw error
        }
      }, 'help_settings', 'Help settings saved');

      setSuccess(showSuccess('Help settings saved'))
      await fetchHelpData()
    } catch (error: any) {
      setError('Failed to save help settings: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSubmitItem = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validate required fields
    if (!formData.name.trim()) {
      setError('Item name is required')
      return
    }

    if (!formData.href.trim()) {
      setError('Item link/URL is required')
      return
    }

    try {
      setSaving(true)

      const itemData = {
        name: formData.name,
        href: formData.href,
        order_index: formData.order_index,
        is_active: formData.is_active,
        opens_in_new_tab: formData.opens_in_new_tab
      }

      if (editingItem) {
        // Update existing item
        await withCacheInvalidation(async () => {
          const { error } = await supabase
            .from('help_items')
            .update(itemData)
            .eq('id', editingItem.id)

          if (error) throw error
        }, 'help_items', 'Help item updated');
        
        setSuccess(showSuccess('Help item updated'))
      } else {
        // Create new item
        await withCacheInvalidation(async () => {
          const { error } = await supabase
            .from('help_items')
            .insert(itemData)

          if (error) throw error
        }, 'help_items', 'Help item created');
        
        setSuccess(showSuccess('Help item created'))
      }

      // Refresh data and close dialog
      await fetchHelpData()
      resetForm()
      setIsDialogOpen(false)
      
    } catch (error: any) {
      setError('Failed to save help item: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteItem = async (item: HelpItem) => {
    if (!confirm('Are you sure you want to delete this help item?')) return

    try {
      await withCacheInvalidation(async () => {
        const { error } = await supabase
          .from('help_items')
          .delete()
          .eq('id', item.id)

        if (error) throw error
      }, 'help_items', 'Help item deleted');

      setSuccess(showSuccess('Help item deleted'))
      await fetchHelpData()
    } catch (error: any) {
      setError('Failed to delete help item: ' + error.message)
    }
  }

  const handleToggleItemActive = async (item: HelpItem) => {
    try {
      await withCacheInvalidation(async () => {
        const { error } = await supabase
          .from('help_items')
          .update({ is_active: !item.is_active })
          .eq('id', item.id)

        if (error) throw error
      }, 'help_items', `Help item ${!item.is_active ? 'activated' : 'deactivated'}`);
      
      await fetchHelpData()
      console.log('✅', showSuccess(`Help item ${!item.is_active ? 'activated' : 'deactivated'}`));
    } catch (error: any) {
      setError('Failed to update item status: ' + error.message)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      href: '',
      order_index: helpItems.length + 1,
      is_active: true,
      opens_in_new_tab: false
    })
    setEditingItem(null)
    setError('')
    setSuccess('')
  }

  const openEditDialog = (item: HelpItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      href: item.href,
      order_index: item.order_index,
      is_active: item.is_active,
      opens_in_new_tab: item.opens_in_new_tab
    })
    setIsDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <HelpCircle className="h-8 w-8 text-gray-400" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Help Management</h1>
            <p className="text-gray-600 mt-2">Manage help dropdown and support links</p>
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
          <HelpCircle className="h-8 w-8 text-gray-700" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Help Management</h1>
            <p className="text-gray-600 mt-2">Customize help button label and dropdown items</p>
          </div>
        </div>
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

      {/* Help Button Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Help Button Settings</CardTitle>
          <CardDescription>
            Customize the main help button label (e.g., "Help", "Support", "Customer Service")
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                value={helpLabel}
                onChange={(e) => setHelpLabel(e.target.value)}
                placeholder="Enter help button label"
                className="max-w-xs"
              />
            </div>
            <Button onClick={handleSaveHelpSettings} disabled={saving}>
              {saving ? 'Saving...' : 'Save Label'}
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Current label: <span className="font-medium">"{helpLabel}"</span>
          </p>
        </CardContent>
      </Card>

      {/* Help Items Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Help Dropdown Items</CardTitle>
            <CardDescription>
              Manage the items that appear in the help dropdown menu
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Help Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? 'Edit Help Item' : 'Add New Help Item'}
                </DialogTitle>
                <DialogDescription>
                  {editingItem 
                    ? 'Update the help item details below.' 
                    : 'Add a new item to the help dropdown menu.'
                  }
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmitItem} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Name *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Order Status, Contact Us"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link/URL *
                  </label>
                  <Input
                    value={formData.href}
                    onChange={(e) => setFormData({ ...formData, href: e.target.value })}
                    placeholder="e.g., /help/order-status, https://external-link.com"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order
                    </label>
                    <Input
                      type="number"
                      min={1}
                      value={formData.order_index}
                      onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                      />
                      <label className="text-sm font-medium text-gray-700">
                        Active
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={formData.opens_in_new_tab}
                        onCheckedChange={(checked) => setFormData({ ...formData, opens_in_new_tab: checked })}
                      />
                      <label className="text-sm font-medium text-gray-700">
                        Open in new tab
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : editingItem ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {helpItems.length === 0 ? (
            <div className="text-center py-8">
              <HelpCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No help items</h3>
              <p className="text-gray-600 mb-4">Get started by adding your first help item.</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Item
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {helpItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{item.name}</span>
                        {item.opens_in_new_tab && (
                          <ExternalLink className="h-3 w-3 text-gray-400" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {item.href}
                      </code>
                    </TableCell>
                    <TableCell>{item.order_index}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={item.is_active}
                          onCheckedChange={() => handleToggleItemActive(item)}
                        />
                        {item.is_active ? (
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
                          onClick={() => openEditDialog(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteItem(item)}
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
    </div>
  )
}