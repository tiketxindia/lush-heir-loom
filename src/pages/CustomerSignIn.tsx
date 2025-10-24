import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Link, Navigate } from 'react-router-dom'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const CustomerSignIn = () => {
  const { user, signInWithGoogle } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/" replace />
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')

    try {
      await signInWithGoogle()
    } catch (error: any) {
      setError(error.message || 'An error occurred during sign in')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <img 
              src="/Lush.png" 
              alt="Lush Heir Loom" 
              className="h-12 w-auto object-contain mx-auto mb-4"
            />
            <h2 className="text-3xl font-bold text-gray-900">
              Welcome to LushHeirLoom
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in with your Google account to continue shopping and preserve your memories
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Customer Sign In</CardTitle>
              <CardDescription>
                Use your Google account to access our platform securely
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <Button 
                onClick={handleGoogleSignIn}
                className="w-full bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {loading ? 'Signing in...' : 'Continue with Google'}
              </Button>

              <div className="text-center text-sm text-gray-600">
                <p>
                  By signing in, you agree to our{' '}
                  <Link to="/terms" className="text-blue-600 hover:text-blue-500">
                    Terms of Service
                  </Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="text-blue-600 hover:text-blue-500">
                    Privacy Policy
                  </Link>
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  Staff members should use the{' '}
                  <Link to="/admin/login" className="text-blue-600 hover:text-blue-500">
                    admin login
                  </Link>
                  {' '}instead.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Why Google Sign-In?</h3>
              <ul className="text-xs text-blue-700 space-y-1 text-left">
                <li>• Secure authentication without additional passwords</li>
                <li>• Quick and easy access to your account</li>
                <li>• Your Google account keeps your data safe</li>
                <li>• No need to remember another password</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}