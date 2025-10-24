import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, Users, Package, Menu as MenuIcon } from 'lucide-react'

export const AdminDashboard = () => {
  const stats = [
    {
      name: 'Total Products',
      value: '24',
      icon: Package,
      change: '+2 from last month',
      changeType: 'positive'
    },
    {
      name: 'Menu Items',
      value: '6',
      icon: MenuIcon,
      change: 'No changes',
      changeType: 'neutral'
    },
    {
      name: 'Active Users',
      value: '1,234',
      icon: Users,
      change: '+12% from last month',
      changeType: 'positive'
    },
    {
      name: 'Monthly Revenue',
      value: '$45,231',
      icon: BarChart3,
      change: '+8% from last month',
      changeType: 'positive'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to the LushHeirLoom admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.name}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className={`text-xs ${
                stat.changeType === 'positive' 
                  ? 'text-green-600' 
                  : stat.changeType === 'negative' 
                  ? 'text-red-600' 
                  : 'text-gray-500'
              }`}>
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest customer orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Order #100{i}</p>
                    <p className="text-sm text-gray-600">Customer {i}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${(Math.random() * 1000).toFixed(2)}</p>
                    <p className="text-sm text-gray-600">2 hours ago</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <button className="w-full p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <p className="font-medium text-blue-900">Add New Product</p>
                <p className="text-sm text-blue-700">Create a new product listing</p>
              </button>
              <button className="w-full p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <p className="font-medium text-green-900">Manage Menu</p>
                <p className="text-sm text-green-700">Update navigation menu items</p>
              </button>
              <button className="w-full p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                <p className="font-medium text-purple-900">View Analytics</p>
                <p className="text-sm text-purple-700">Check performance metrics</p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}