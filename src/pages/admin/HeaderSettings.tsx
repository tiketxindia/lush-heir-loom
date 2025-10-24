import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RealtimeStatusIndicator } from '@/components/RealtimeStatusIndicator'
import { useAdminCacheInvalidation } from '@/lib/adminCacheIntegration'
import { Save, Settings } from 'lucide-react'

interface HeaderSettings {
  id: number;
  is_sticky: boolean;
}

export const HeaderSettings = () => {
  const [settings, setSettings] = useState<HeaderSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Cache invalidation hook
  const { invalidateHeaderSettings, withCacheInvalidation, showSuccess } = useAdminCacheInvalidation();

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('header_settings')
        .select('*')
        .limit(1)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No settings found, create default
          await createDefaultSettings()
        } else {
          throw error
        }
      } else {
        setSettings(data)
      }
    } catch (error: any) {
      setError('Failed to fetch header settings: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const createDefaultSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('header_settings')
        .insert({ is_sticky: true })
        .select()
        .single()

      if (error) throw error
      setSettings(data)
    } catch (error: any) {
      setError('Failed to create default settings: ' + error.message)
    }
  }

  const handleStickyToggle = (checked: boolean) => {
    if (settings) {
      setSettings({ ...settings, is_sticky: checked })
    }
  }

  const handleSave = async () => {
    if (!settings) return

    try {
      setSaving(true)
      setError('')
      setSuccess('')

      await withCacheInvalidation(async () => {
        const { error } = await supabase
          .from('header_settings')
          .update({ is_sticky: settings.is_sticky })
          .eq('id', settings.id)

        if (error) throw error
      }, 'header_settings', 'Header settings saved');

      setSuccess(showSuccess('Header settings saved'))
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)
    } catch (error: any) {
      setError('Failed to save settings: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Settings className="h-8 w-8 text-gray-400" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Header Settings</h1>
            <p className="text-gray-600 mt-2">Configure header appearance and behavior</p>
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
      <div className="flex items-center space-x-2">
        <Settings className="h-8 w-8 text-gray-700" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Header Settings</h1>
          <p className="text-gray-600 mt-2">Configure header appearance and behavior</p>
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

      <Card>
        <CardHeader>
          <CardTitle>Header Behavior</CardTitle>
          <CardDescription>
            Control how the website header behaves when users scroll
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Sticky Header</h4>
              <p className="text-sm text-gray-600">
                When enabled, the header will remain visible at the top of the page when scrolling
              </p>
            </div>
            <Switch
              checked={settings?.is_sticky ?? true}
              onCheckedChange={handleStickyToggle}
              disabled={saving}
            />
          </div>

          <div className="pt-4 border-t">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Preview</h4>
              <div className="text-sm text-blue-700">
                {settings?.is_sticky ? (
                  <>
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Header will stick to the top when scrolling</span>
                    </div>
                    <div className="text-xs text-blue-600">
                      Users can always access navigation and search
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                      <span>Header will scroll away normally</span>
                    </div>
                    <div className="text-xs text-blue-600">
                      More screen space for content when scrolling
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleSave} 
              disabled={saving || !settings}
              className="flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage Guidelines</CardTitle>
          <CardDescription>
            When to use sticky vs non-sticky headers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-green-700">✅ Use Sticky Header When:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Users need constant access to navigation</li>
                <li>• Shopping cart access is important</li>
                <li>• Search functionality is frequently used</li>
                <li>• Long content pages with multiple sections</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-orange-700">⚠️ Consider Non-Sticky When:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Content viewing experience is priority</li>
                <li>• Mobile users need maximum screen space</li>
                <li>• Minimalist design is preferred</li>
                <li>• Content is primarily visual (galleries)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}