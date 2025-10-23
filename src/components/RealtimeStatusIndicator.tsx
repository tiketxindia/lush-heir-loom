import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, Wifi, WifiOff } from 'lucide-react'

export const RealtimeStatusIndicator = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  useEffect(() => {
    // Set up real-time connection status monitoring
    const channel = supabase
      .channel('connection_status')
      .on('presence', { event: 'sync' }, () => {
        setIsConnected(true)
      })
      .on('presence', { event: 'join' }, () => {
        setIsConnected(true)
      })
      .on('presence', { event: 'leave' }, () => {
        setIsConnected(false)
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
        } else if (status === 'CLOSED') {
          setIsConnected(false)
        }
      })

    // Monitor menu changes
    const menuChannel = supabase
      .channel('menu_realtime_status')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'menu_items'
        },
        () => {
          setLastUpdate(new Date())
        }
      )
      .subscribe()

    // Cleanup
    return () => {
      supabase.removeChannel(channel)
      supabase.removeChannel(menuChannel)
    }
  }, [])

  return (
    <div className="mb-4">
      <Alert variant={isConnected ? "default" : "destructive"}>
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <Wifi className="h-4 w-4 text-green-600" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription>
            <span className="font-medium">
              Real-time sync: {isConnected ? 'Connected' : 'Disconnected'}
            </span>
            {lastUpdate && (
              <span className="ml-2 text-sm text-gray-500">
                Last update: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
            <div className="mt-1 text-xs text-gray-600">
              Changes made here will instantly reflect on the website navigation
            </div>
          </AlertDescription>
        </div>
      </Alert>
    </div>
  )
}