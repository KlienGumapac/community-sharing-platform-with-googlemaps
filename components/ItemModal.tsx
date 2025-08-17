'use client'

import { useState } from 'react'
import { X, MapPin, User, Calendar, MessageCircle, Navigation } from 'lucide-react'
import toast from 'react-hot-toast'

interface Item {
  _id: string
  title: string
  description: string
  category: string
  images: string[]
  status: string
  address: string
  location: {
    coordinates: [number, number]
  }
  owner: {
    _id: string
    name: string
  }
  condition: string
  isFree: boolean
  price: number
  createdAt: string
  tags: string[]
  expiresAt?: string
}

interface ItemModalProps {
  item: Item | null
  isOpen: boolean
  onClose: () => void
  isOwner?: boolean
}

export default function ItemModal({ item, isOpen, onClose, isOwner = false }: ItemModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  if (!isOpen || !item) return null

  const handleStartNavigation = () => {
    try {
      console.log('Starting navigation to:', item.title)
      console.log('Coordinates:', item.location.coordinates)
      
      const lat = item.location.coordinates[1]
      const lng = item.location.coordinates[0]
      
      // Validate coordinates
      if (typeof lat !== 'number' || typeof lng !== 'number') {
        toast.error('Invalid location coordinates')
        return
      }
      
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
      console.log('Navigation URL:', url)
      
      // Try to open in new tab
      const newWindow = window.open(url, '_blank')
      
      if (newWindow) {
        toast.success('Opening Google Maps...')
      } else {
        // Fallback: copy URL to clipboard
        navigator.clipboard.writeText(url).then(() => {
          toast.success('Navigation URL copied to clipboard!')
        }).catch(() => {
          toast.error('Please allow popups or copy this URL: ' + url)
        })
      }
    } catch (error) {
      console.error('Navigation error:', error)
      toast.error('Error opening navigation')
    }
  }

  const handleStartChat = () => {
    // TODO: Implement chat functionality
    toast.success('Chat feature coming soon!')
  }

  const handleMarkAsClaimed = async () => {
    try {
      const response = await fetch(`/api/items/${item._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'claimed' }),
      })

      if (response.ok) {
        toast.success('Item marked as claimed!')
        onClose()
        // Refresh the page to update the list
        window.location.reload()
      } else {
        toast.error('Failed to update item status')
      }
    } catch (error) {
      console.error('Error updating item:', error)
      toast.error('Error updating item status')
    }
  }

  const handleMarkAsAvailable = async () => {
    try {
      const response = await fetch(`/api/items/${item._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'available' }),
      })

      if (response.ok) {
        toast.success('Item marked as available!')
        onClose()
        // Refresh the page to update the list
        window.location.reload()
      } else {
        toast.error('Failed to update item status')
      }
    } catch (error) {
      console.error('Error updating item:', error)
      toast.error('Error updating item status')
    }
  }

  const handleDeleteItem = async () => {
    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/items/${item._id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Item deleted successfully!')
        onClose()
        // Refresh the page to update the list
        window.location.reload()
      } else {
        toast.error('Failed to delete item')
      }
    } catch (error) {
      console.error('Error deleting item:', error)
      toast.error('Error deleting item')
    }
  }

  const nextImage = () => {
    if (item.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % item.images.length)
    }
  }

  const prevImage = () => {
    if (item.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + item.images.length) % item.images.length)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">{item.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Image Gallery */}
          {item.images && item.images.length > 0 && (
            <div className="relative bg-gray-200 rounded-lg mb-6">
              <img
                src={item.images[currentImageIndex]}
                alt={item.title}
                className="w-full h-64 md:h-80 object-cover rounded-lg"
              />
              
              {/* Image Navigation */}
              {item.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                  >
                    ‹
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                  >
                    ›
                  </button>
                  
                  {/* Image Indicators */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {item.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-3 h-3 rounded-full ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Item Info */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    item.status === 'available' ? 'bg-green-100 text-green-800' :
                    item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary-600">
                    {item.isFree ? 'Free' : `$${item.price}`}
                  </div>
                  <div className="text-sm text-gray-500 capitalize">{item.condition}</div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <User className="h-4 w-4 mr-2" />
                  <span>{item.owner.name}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Posted {new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-start text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 mt-0.5" />
                  <span>{item.address}</span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 text-sm leading-relaxed">{item.description}</p>
              </div>
            </div>

            {/* Right Column */}
            <div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Item Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium capitalize">{item.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Condition:</span>
                      <span className="font-medium capitalize">{item.condition}</span>
                    </div>
                    {item.expiresAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Expires:</span>
                        <span className="font-medium">{new Date(item.expiresAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {item.tags && item.tags.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-6 border-t mt-6">
            {isOwner ? (
              // Owner Actions
              <>
                {item.status === 'available' ? (
                  <button
                    onClick={handleMarkAsClaimed}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
                  >
                    ✅ Mark as Claimed
                  </button>
                ) : (
                  <button
                    onClick={handleMarkAsAvailable}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
                  >
                    🔄 Mark as Available
                  </button>
                )}
                <button
                  onClick={handleDeleteItem}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  🗑️ Delete Item
                </button>
              </>
            ) : (
              // Non-owner Actions
              <>
                <button
                  onClick={handleStartNavigation}
                  className="flex-1 btn-primary flex items-center justify-center"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Get Directions
                </button>
                <button
                  onClick={handleStartChat}
                  className="flex-1 btn-secondary flex items-center justify-center"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message Owner
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 