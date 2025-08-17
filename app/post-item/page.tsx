'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, MapPin, Gift, Navigation } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Location {
  lat: number
  lng: number
  address: string
}

export default function PostItem() {
  const router = useRouter()
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [marker, setMarker] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isMapLoading, setIsMapLoading] = useState(true)
  const [location, setLocation] = useState<Location | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'food',
    condition: 'good',
    isFree: true,
    price: 0,
    expiresAt: '',
    tags: '',
  })
  const [images, setImages] = useState<File[]>([])

  useEffect(() => {
    initializeMap()
  }, [])

  const initializeMap = () => {
    if (mapRef.current && !map) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBHP7SxjK6Mcf1AaThEwLtLQ1PMs4NM2Hc&libraries=places`
      script.async = true
      script.defer = true
      script.onload = () => {
        const defaultCenter = { lat: 20, lng: 0 }
        const mapInstance = new (window as any).google.maps.Map(mapRef.current, {
          center: defaultCenter,
          zoom: 2,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            },
            {
              featureType: 'transit',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        })
        setMap(mapInstance)
        setIsMapLoading(false)
        
        // Add click listener to map
        mapInstance.addListener('click', handleMapClick)
        
        // Get current location after map loads
        setTimeout(() => {
          getCurrentLocation()
        }, 1000)
      }
      document.head.appendChild(script)
    }
  }

  const handleMapClick = async (event: any) => {
    const lat = event.latLng.lat()
    const lng = event.latLng.lng()
    
    try {
      // Get address from coordinates
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyBHP7SxjK6Mcf1AaThEwLtLQ1PMs4NM2Hc`
      )
      const data = await response.json()
      
      const address = data.results && data.results[0] 
        ? data.results[0].formatted_address 
        : `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      
      const newLocation = { lat, lng, address }
      setLocation(newLocation)
      
      // Update marker
      if (marker) {
        marker.setMap(null)
      }
      
      const newMarker = new (window as any).google.maps.Marker({
        position: { lat, lng },
        map: map,
        title: 'Pickup Location',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="8" fill="#FF6B6B" stroke="#FFFFFF" stroke-width="3"/>
              <circle cx="20" cy="20" r="3" fill="#FFFFFF"/>
            </svg>
          `),
          scaledSize: new (window as any).google.maps.Size(40, 40),
          anchor: new (window as any).google.maps.Point(20, 20),
        },
        animation: (window as any).google.maps.Animation.DROP,
      })
      
      setMarker(newMarker)
      toast.success('Location updated! Click anywhere on the map to change it.')
      
    } catch (error) {
      console.error('Error getting address:', error)
      toast.error('Error getting address for selected location')
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          try {
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyBHP7SxjK6Mcf1AaThEwLtLQ1PMs4NM2Hc`
            )
            const data = await response.json()
            if (data.results && data.results[0]) {
              const newLocation = {
                lat: latitude,
                lng: longitude,
                address: data.results[0].formatted_address,
              }
              setLocation(newLocation)
              
              // Center map on current location
              if (map) {
                map.setCenter({ lat: latitude, lng: longitude })
                map.setZoom(15)
                
                // Add marker for current location
                if (marker) {
                  marker.setMap(null)
                }
                
                const newMarker = new (window as any).google.maps.Marker({
                  position: { lat: latitude, lng: longitude },
                  map: map,
                  title: 'Pickup Location',
                  icon: {
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                      <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="20" cy="20" r="8" fill="#FF6B6B" stroke="#FFFFFF" stroke-width="3"/>
                        <circle cx="20" cy="20" r="3" fill="#FFFFFF"/>
                      </svg>
                    `),
                    scaledSize: new (window as any).google.maps.Size(40, 40),
                    anchor: new (window as any).google.maps.Point(20, 20),
                  },
                  animation: (window as any).google.maps.Animation.DROP,
                })
                
                setMarker(newMarker)
                toast.success('Location set to your current position! Click anywhere on the map to change it.')
              }
            }
          } catch (error) {
            console.error('Error getting address:', error)
            const newLocation = {
              lat: latitude,
              lng: longitude,
              address: `${latitude}, ${longitude}`,
            }
            setLocation(newLocation)
            
            if (map) {
              map.setCenter({ lat: latitude, lng: longitude })
              map.setZoom(15)
            }
          }
        },
        (error) => {
          console.error('Error getting location:', error)
          toast.error('Unable to get your location. You can still click on the map to set a location.')
        }
      )
    }
  }

  const handleGetCurrentLocation = () => {
    getCurrentLocation()
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || [])
    const totalImages = images.length + newFiles.length
    
    if (totalImages > 5) {
      toast.error(`Maximum 5 images allowed. You already have ${images.length} images selected.`)
      return
    }
    
    setImages([...images, ...newFiles])
    
    // Reset the input value so the same file can be selected again
    e.target.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!location) {
      toast.error('Please allow location access')
      return
    }

    setIsLoading(true)

    try {
      // Upload images first
      const imageUrls: string[] = []
      for (const image of images) {
        const formData = new FormData()
        formData.append('file', image)
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
        
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          imageUrls.push(uploadData.url)
        }
      }

      // Create item
      const itemData = {
        ...formData,
        images: imageUrls,
        location: {
          type: 'Point',
          coordinates: [location.lng, location.lat],
        },
        address: location.address,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      }

      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      })

      if (response.ok) {
        toast.success('Item posted successfully!')
        router.push('/dashboard')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error posting item')
      }
    } catch (error) {
      toast.error('Error posting item')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Modern Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/dashboard" className="text-slate-600 hover:text-slate-900 mr-4 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <Gift className="h-5 w-5 text-white" />
              </div>
              <span className="ml-3 text-xl font-semibold text-slate-900">ShareHub</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl border border-slate-200 p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-8">Post New Item</h1>

          <form onSubmit={handleSubmit} className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Item Information */}
            <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Item Title *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  placeholder="e.g., Fresh vegetables, Old laptop, etc."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category *
                </label>
                <select
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="food">Food</option>
                  <option value="equipment">Equipment</option>
                  <option value="clothing">Clothing</option>
                  <option value="electronics">Electronics</option>
                  <option value="furniture">Furniture</option>
                  <option value="books">Books</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description *
              </label>
              <textarea
                required
                rows={4}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none"
                placeholder="Describe your item in detail..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Condition and Pricing */}
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Condition *
                </label>
                <select
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                >
                  <option value="new">New</option>
                  <option value="like-new">Like New</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Is it free?
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center text-slate-700">
                    <input
                      type="radio"
                      checked={formData.isFree}
                      onChange={() => setFormData({ ...formData, isFree: true })}
                      className="mr-2 text-slate-600 focus:ring-slate-500"
                    />
                    Yes
                  </label>
                  <label className="flex items-center text-slate-700">
                    <input
                      type="radio"
                      checked={!formData.isFree}
                      onChange={() => setFormData({ ...formData, isFree: false })}
                      className="mr-2 text-slate-600 focus:ring-slate-500"
                    />
                    No
                  </label>
                </div>
              </div>

              {!formData.isFree && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Price
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              )}
            </div>

            {/* Expiration Date for Food */}
            {formData.category === 'food' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Expiration Date
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                />
              </div>
            )}

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                placeholder="e.g., organic, gluten-free, vintage, etc."
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              />
            </div>
            </div>

            {/* Right Column - Images and Location */}
            <div className="space-y-6">
            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images (up to 5)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <span className="text-primary-600 hover:text-primary-500 font-medium">
                    Click to upload images
                  </span>
                  <span className="text-gray-500"> or drag and drop</span>
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  PNG, JPG, GIF up to 10MB each
                </p>
              </div>
              {images.length > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-gray-600">
                      Selected images: {images.length}/5
                    </p>
                    <button
                      type="button"
                      onClick={() => setImages([])}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                        <div className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs cursor-pointer hover:bg-red-600"
                             onClick={() => {
                               const newImages = images.filter((_, i) => i !== index)
                               setImages(newImages)
                             }}>
                          ×
                        </div>
                        <p className="text-xs text-gray-500 mt-1 truncate">{image.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Map for Location Selection */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Pickup Location
                </label>
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  className="flex items-center text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  <Navigation className="h-4 w-4 mr-1" />
                  Use My Location
                </button>
              </div>
              
              {/* Map Container */}
              <div className="relative">
                <div 
                  ref={mapRef} 
                  className="w-full h-64 rounded-lg border-2 border-gray-300 overflow-hidden"
                />
                
                {/* Map Loading Overlay */}
                {isMapLoading && (
                  <div className="absolute inset-0 bg-gray-100 flex items-center justify-center rounded-lg">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">Loading map...</p>
                    </div>
                  </div>
                )}
                
                {/* Map Instructions */}
                <div className="absolute top-2 left-2 bg-white bg-opacity-90 px-3 py-2 rounded-lg shadow-sm">
                  <p className="text-xs text-gray-700 font-medium">
                    💡 Click anywhere on the map to set pickup location
                  </p>
                </div>
              </div>
              
              {/* Location Display */}
              {location && (
                <div className="mt-3 flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                  <MapPin className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-green-800 font-medium">{location.address}</p>
                    <p className="text-xs text-green-600">
                      Coordinates: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                    </p>
                  </div>
                </div>
              )}
              
              {!location && !isMapLoading && (
                <div className="mt-3 flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <MapPin className="h-5 w-5 text-yellow-600 mr-2" />
                  <span className="text-yellow-800">
                    Click on the map above to set your pickup location
                  </span>
                </div>
              )}
            </div>
            </div>

            {/* Submit Buttons - Full Width */}
            <div className="lg:col-span-2 flex justify-end space-x-4 pt-8 border-t border-slate-200">
              <Link 
                href="/dashboard" 
                className="bg-white text-slate-900 border border-slate-300 px-6 py-3 rounded-lg font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isLoading || !location}
                className="bg-slate-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Posting...' : 'Post Item'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 