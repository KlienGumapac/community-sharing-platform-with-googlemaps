'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User, Settings, MapPin, Gift, LogOut, Edit, Save, X, Camera, Shield, Bell, Globe } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface UserProfile {
  _id: string
  name: string
  email: string
  address?: string
  location?: {
    coordinates: [number, number]
  }
  rating?: number
  itemsShared?: number
  itemsReceived?: number
  createdAt: string
}

export default function Profile() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    address: ''
  })

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setEditForm({
          name: data.user.name || '',
          email: data.user.email || '',
          address: data.user.address || ''
        })
      } else {
        router.push('/auth/signin')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      router.push('/auth/signin')
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

  const handleSaveProfile = async () => {
    try {
      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUser(updatedUser.user)
        setIsEditing(false)
        toast.success('Profile updated successfully!')
      } else {
        toast.error('Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Error updating profile')
    }
  }

  const handleCancelEdit = () => {
    setEditForm({
      name: user?.name || '',
      email: user?.email || '',
      address: user?.address || ''
    })
    setIsEditing(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading profile...</p>
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
              <Link href="/dashboard" className="text-slate-600 hover:text-slate-900 mr-4 transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <span className="ml-3 text-xl font-semibold text-slate-900">Profile</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center">
                <User className="h-10 w-10 text-white" />
              </div>
              <div className="ml-6">
                <h1 className="text-3xl font-bold text-slate-900">{user?.name}</h1>
                <p className="text-slate-600">{user?.email}</p>
                <p className="text-sm text-slate-500">
                  Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center"
            >
              {isEditing ? <X className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-slate-900">{user?.itemsShared || 0}</div>
              <div className="text-sm text-slate-600">Items Shared</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-slate-900">{user?.itemsReceived || 0}</div>
              <div className="text-sm text-slate-600">Items Received</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-slate-900">{user?.rating ? `${user.rating}/5` : 'N/A'}</div>
              <div className="text-sm text-slate-600">Rating</div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-xl border border-slate-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Profile Information</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              ) : (
                <div className="px-4 py-3 bg-slate-50 rounded-lg text-slate-900">
                  {user?.name || 'Not provided'}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              {isEditing ? (
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              ) : (
                <div className="px-4 py-3 bg-slate-50 rounded-lg text-slate-900">
                  {user?.email}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Address
              </label>
              {isEditing ? (
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  placeholder="Enter your address"
                />
              ) : (
                <div className="px-4 py-3 bg-slate-50 rounded-lg text-slate-900 flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-slate-500" />
                  {user?.address || 'No address provided'}
                </div>
              )}
            </div>

            {isEditing && (
              <div className="flex space-x-4 pt-4">
                <button
                  onClick={handleSaveProfile}
                  className="bg-slate-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="bg-white text-slate-900 border border-slate-300 px-6 py-3 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Settings Section */}
        <div className="bg-white rounded-xl border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Settings</h2>
          
          <div className="space-y-4">
            <Link
              href="/dashboard"
              className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center">
                <Gift className="h-5 w-5 text-slate-600 mr-3" />
                <span className="font-medium text-slate-900">My Shared Items</span>
              </div>
              <span className="text-slate-400">→</span>
            </Link>

            <Link
              href="/discover"
              className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center">
                <Globe className="h-5 w-5 text-slate-600 mr-3" />
                <span className="font-medium text-slate-900">Discover Items</span>
              </div>
              <span className="text-slate-400">→</span>
            </Link>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center">
                <Bell className="h-5 w-5 text-slate-600 mr-3" />
                <span className="font-medium text-slate-900">Notifications</span>
              </div>
              <span className="text-slate-400">Coming Soon</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-slate-600 mr-3" />
                <span className="font-medium text-slate-900">Privacy Settings</span>
              </div>
              <span className="text-slate-400">Coming Soon</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 