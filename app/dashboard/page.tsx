'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, MapPin, Gift, LogOut, User, Settings } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import ItemModal from '@/components/ItemModal'

interface User {
  id: string
  name: string
  email: string
}

interface Item {
  _id: string
  title: string
  description: string
  category: string
  images: string[]
  status: string
  createdAt: string
  address: string
}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    checkAuth()
    fetchUserItems()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
      } else {
        router.push('/auth/signin')
      }
    } catch (error) {
      router.push('/auth/signin')
    }
  }

  const fetchUserItems = async () => {
    try {
      const response = await fetch('/api/items/my-items')
      if (response.ok) {
        const data = await response.json()
        // Sort items: available first, then pending, then claimed
        const sortedItems = data.items.sort((a: Item, b: Item) => {
          const statusOrder = { available: 1, pending: 2, claimed: 3 }
          const aOrder = statusOrder[a.status as keyof typeof statusOrder] || 4
          const bOrder = statusOrder[b.status as keyof typeof statusOrder] || 4
          return aOrder - bOrder
        })
        setItems(sortedItems)
      }
    } catch (error) {
      console.error('Error fetching items:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/')
    } catch (error) {
      toast.error('Error logging out')
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Item deleted successfully')
        fetchUserItems()
      } else {
        toast.error('Error deleting item')
      }
    } catch (error) {
      toast.error('Error deleting item')
    }
  }

  const handleItemClick = (item: Item) => {
    setSelectedItem(item)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedItem(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Modern Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <Gift className="h-5 w-5 text-white" />
              </div>
              <span className="ml-3 text-xl font-semibold text-slate-900">ShareHub</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link 
                href="/discover" 
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <MapPin className="h-4 w-4" />
                <span className="text-sm font-medium">Discover</span>
              </Link>
              <Link 
                href="/profile"
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center">
                  <User className="h-3 w-3" />
                </div>
                <span className="text-sm font-medium">{user?.name}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Modern Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Welcome back, {user?.name}
          </h1>
          <p className="text-slate-600 text-lg">
            Manage your shared items and discover new ones in your community.
          </p>
        </div>

        {/* Modern Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Link
            href="/post-item"
            className="group bg-white rounded-xl border border-slate-200 p-6 hover:border-slate-300 hover:shadow-lg transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center group-hover:bg-slate-800 transition-colors">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-slate-900 group-hover:text-slate-800 transition-colors">Post New Item</h3>
                <p className="text-slate-600 text-sm">Share something with your community</p>
              </div>
            </div>
          </Link>

          <Link
            href="/discover"
            className="group bg-white rounded-xl border border-slate-200 p-6 hover:border-slate-300 hover:shadow-lg transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center group-hover:bg-slate-800 transition-colors">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-slate-900 group-hover:text-slate-800 transition-colors">Discover Items</h3>
                <p className="text-slate-600 text-sm">Find items near you</p>
              </div>
            </div>
          </Link>

          <Link
            href="/profile"
            className="group bg-white rounded-xl border border-slate-200 p-6 hover:border-slate-300 hover:shadow-lg transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center group-hover:bg-slate-800 transition-colors">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-slate-900 group-hover:text-slate-800 transition-colors">Profile Settings</h3>
                <p className="text-slate-600 text-sm">Manage your account</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Modern My Items Section */}
        <div className="bg-white rounded-xl border border-slate-200 p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">My Shared Items</h2>
              <p className="text-slate-600 mt-1">Manage your community contributions</p>
            </div>
            <Link 
              href="/post-item" 
              className="bg-slate-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Post New Item
            </Link>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Gift className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                No items shared yet
              </h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                Start sharing items with your community to see them here.
              </p>
              <Link 
                href="/post-item" 
                className="bg-slate-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors inline-flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Post Your First Item
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <div 
                  key={item._id} 
                  className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 hover:shadow-lg transition-all duration-200 cursor-pointer"
                  onClick={() => handleItemClick(item)}
                >
                  <div className="aspect-w-16 aspect-h-9 bg-slate-100">
                    {item.images && item.images.length > 0 ? (
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          // Hide the image if it fails to load
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="w-full h-48 flex items-center justify-center bg-slate-100">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Gift className="h-6 w-6 text-slate-400" />
                          </div>
                          <p className="text-sm text-slate-500">No image</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-slate-900 truncate flex-1 mr-3">
                        {item.title}
                      </h3>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        item.status === 'available' ? 'bg-emerald-100 text-emerald-700' :
                        item.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm mb-3 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                    <div className="flex items-center text-slate-500 text-xs mb-4">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span className="truncate">{item.address}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteItem(item._id)
                        }}
                        className="text-slate-400 hover:text-red-600 text-sm font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Item Detail Modal */}
      <ItemModal 
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={closeModal}
        isOwner={true}
      />
    </div>
  )
} 