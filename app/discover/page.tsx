'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Filter, Search, MessageCircle, Navigation, Gift } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

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
    name: string
  }
  condition: string
  isFree: boolean
  price: number
  createdAt: string
}

interface Location {
  lat: number
  lng: number
}

export default function Discover() {
  const router = useRouter()
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [userLocation, setUserLocation] = useState<Location | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [filters, setFilters] = useState({
    category: 'all',
    distance: 10,
    status: 'available',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [markers, setMarkers] = useState<any[]>([])
  const [hasInitialLoad, setHasInitialLoad] = useState(false)
  const [hasShownLocationToast, setHasShownLocationToast] = useState(false)

  useEffect(() => {
    loadGoogleMaps()
  }, [])

  useEffect(() => {
    if (map && userLocation && !hasInitialLoad) {
      fetchNearbyItems()
      setHasInitialLoad(true)
    }
  }, [map, userLocation, hasInitialLoad])

  // Separate useEffect for filter changes
  useEffect(() => {
    if (map && userLocation && hasInitialLoad) {
      fetchNearbyItems()
    }
  }, [filters])

  const loadGoogleMaps = () => {
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBHP7SxjK6Mcf1AaThEwLtLQ1PMs4NM2Hc&libraries=places`
    script.async = true
    script.defer = true
    script.onload = initializeMap
    document.head.appendChild(script)
  }

  const initializeMap = () => {
    if (mapRef.current && !map) {
      // Default to a neutral location (center of the world)
      const defaultCenter = { lat: 20, lng: 0 }
      
      const mapInstance = new (window as any).google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: 2,
        styles: [
          // Remove all POI markers except place names
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'poi.business',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'poi.medical',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'poi.school',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'poi.sports_complex',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'poi.park',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'transit',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'transit.station',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'transit.line',
            stylers: [{ visibility: 'off' }]
          },
          // Keep place names but remove other labels
          {
            featureType: 'administrative',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#444444' }]
          },
          {
            featureType: 'landscape',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#444444' }]
          },
          {
            featureType: 'road',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#444444' }]
          },
          // Simplify the map colors
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#a2daf2' }]
          },
          {
            featureType: 'landscape',
            elementType: 'geometry',
            stylers: [{ color: '#f5f5f2' }]
          },
          {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{ color: '#ffffff' }]
          },
          {
            featureType: 'road.highway',
            elementType: 'geometry',
            stylers: [{ color: '#ffffff' }]
          },
          {
            featureType: 'road.arterial',
            elementType: 'geometry',
            stylers: [{ color: '#ffffff' }]
          },
          {
            featureType: 'road.local',
            elementType: 'geometry',
            stylers: [{ color: '#ffffff' }]
          }
        ]
      })
      setMap(mapInstance)
      setIsLoading(false) // Set loading to false since we're not auto-fetching items
    }
  }

  const getCurrentLocation = () => {
    setIsGettingLocation(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setUserLocation(location)
          if (map) {
            map.setCenter(location)
            map.setZoom(14) // Closer zoom for better neighborhood view
          }
          setIsGettingLocation(false)
          if (!hasShownLocationToast) {
            toast.success('Found your location!')
            setHasShownLocationToast(true)
          }
          
          // Fetch items after getting location
          setTimeout(() => {
            fetchNearbyItems()
          }, 500)
        },
        (error) => {
          console.error('Error getting location:', error)
          if (error.code === 1) {
            toast.error('Location access denied. Please allow location access in your browser settings.')
          } else if (error.code === 2) {
            toast.error('Location unavailable. Please try again.')
          } else if (error.code === 3) {
            toast.error('Location request timed out. Please try again.')
          } else {
            toast.error('Unable to get your location. Please try the "My Location" button.')
          }
          setIsGettingLocation(false)
        },
        {
          enableHighAccuracy: true,
          timeout: 15000, // Increased timeout
          maximumAge: 60000 // 1 minute cache
        }
      )
    } else {
      toast.error('Geolocation is not supported by this browser')
      setIsGettingLocation(false)
    }
  }

  const fetchNearbyItems = async () => {
    if (!userLocation) {
      console.log('No user location available')
      return
    }

    setIsLoading(true) // Set loading to true when fetching items
    console.log('Fetching items for location:', userLocation)
    console.log('Filters:', filters)

    try {
      const params = new URLSearchParams({
        lat: userLocation.lat.toString(),
        lng: userLocation.lng.toString(),
        distance: filters.distance.toString(),
        category: filters.category,
        status: filters.status,
      })

      console.log('Fetching from:', `/api/items/nearby?${params}`)
      const response = await fetch(`/api/items/nearby?${params}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Received items:', data.items)
        setItems(data.items)
        addMarkersToMap(data.items)
      } else {
        console.error('Error response:', response.status, response.statusText)
        const errorData = await response.json()
        console.error('Error data:', errorData)
      }
    } catch (error) {
      console.error('Error fetching items:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addMarkersToMap = (items: Item[]) => {
    // Clear existing markers
    markers.forEach(marker => marker.setMap(null))
    const newMarkers: any[] = []

    console.log('Adding markers for items:', items.length)

    items.forEach((item) => {
      console.log('Adding marker for item:', item.title, 'at:', item.location.coordinates)
      
      const marker = new (window as any).google.maps.Marker({
        position: {
          lat: item.location.coordinates[1],
          lng: item.location.coordinates[0],
        },
        map: map,
        title: item.title,
        icon: {
          url: getMarkerIcon(item.category),
          scaledSize: new (window as any).google.maps.Size(40, 40),
          anchor: new (window as any).google.maps.Point(20, 40),
        },
        animation: (window as any).google.maps.Animation.DROP,
      })

      marker.addListener('click', () => {
        setSelectedItem(item)
      })

      newMarkers.push(marker)
    })

    setMarkers(newMarkers)
    
    // Show info about markers added
    if (items.length > 0) {
      toast.success(`Found ${items.length} items nearby!`)
    } else {
      toast('No items found in this area. Try increasing the distance or posting some items!')
    }
  }

  const getMarkerIcon = (category: string) => {
    const colors = {
      food: '#FF6B6B',
      equipment: '#4ECDC4',
      clothing: '#45B7D1',
      electronics: '#96CEB4',
      furniture: '#FFEAA7',
      books: '#DDA0DD',
      other: '#A8E6CF',
    }
    
    const color = colors[category as keyof typeof colors] || '#A8E6CF'
    
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="18" fill="${color}" stroke="white" stroke-width="2"/>
        <circle cx="20" cy="20" r="8" fill="white"/>
        <text x="20" y="24" font-family="Arial, sans-serif" font-size="12" fill="${color}" text-anchor="middle" font-weight="bold">
          ${category.charAt(0).toUpperCase()}
        </text>
      </svg>
    `)}`
  }

  const handleStartNavigation = (item: Item) => {
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

  const handleStartChat = (item: Item) => {
    router.push(`/chat/${item._id}`)
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
                href="/dashboard" 
                className="text-slate-600 hover:text-slate-900 transition-colors font-medium"
              >
                Dashboard
              </Link>
              <Link 
                href="/post-item" 
                className="bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors"
              >
                Post Item
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-64px)]">
        {/* Map */}
        <div className="flex-1 relative">
          <div ref={mapRef} className="w-full h-full" />
          
          {/* Modern Map Controls */}
          <div className="absolute top-4 left-4 z-10">
            <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-slate-900">Filters</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={fetchNearbyItems}
                    className="bg-slate-900 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
                  >
                    🔄 Refresh
                  </button>
                  <button
                    onClick={getCurrentLocation}
                    disabled={isGettingLocation}
                    className="bg-slate-900 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    {isGettingLocation ? '📍 Loading...' : '📍 My Location'}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category
                </label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                >
                  <option value="all">All Categories</option>
                  <option value="food">Food</option>
                  <option value="equipment">Equipment</option>
                  <option value="clothing">Clothing</option>
                  <option value="electronics">Electronics</option>
                  <option value="furniture">Furniture</option>
                  <option value="books">Books</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Distance (km)
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={filters.distance}
                  onChange={(e) => setFilters({ ...filters, distance: parseInt(e.target.value) })}
                  className="w-full"
                />
                <span className="text-xs text-slate-500">{filters.distance} km</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Status
                </label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="available">Available</option>
                  <option value="pending">Pending</option>
                  <option value="claimed">Claimed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
                <p className="mt-4 text-slate-600">Loading items...</p>
              </div>
            </div>
          )}

          {/* Initial State - No Location */}
          {!isLoading && !userLocation && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-20">
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MapPin className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Set Your Location</h3>
                <p className="text-slate-600 mb-6">Click "My Location" to find items near you</p>
                <button
                  onClick={getCurrentLocation}
                  className="bg-slate-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors"
                >
                  📍 My Location
                </button>
              </div>
            </div>
          )}

          {/* No Items Found */}
          {!isLoading && userLocation && items.length === 0 && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-20">
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Gift className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">No Items Found</h3>
                <p className="text-slate-600 mb-6">Try increasing the distance or posting some items!</p>
                <div className="flex space-x-3 justify-center">
                  <button
                    onClick={fetchNearbyItems}
                    className="bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors"
                  >
                    🔄 Refresh
                  </button>
                  <Link 
                    href="/post-item" 
                    className="bg-white text-slate-900 border border-slate-300 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                  >
                    ➕ Post Item
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Location Loading Indicator */}
          {isGettingLocation && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white bg-opacity-90 rounded-xl shadow-lg p-6 z-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto"></div>
                <p className="mt-2 text-sm text-slate-600">Getting your location...</p>
              </div>
            </div>
          )}
        </div>

        {/* Modern Item Details Panel */}
        {selectedItem && (
          <div className="w-96 bg-white border-l border-slate-200 shadow-lg overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold text-slate-900">{selectedItem.title}</h2>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  ✕
                </button>
              </div>

              {selectedItem.images && selectedItem.images.length > 0 && (
                <div className="mb-6">
                  <img
                    src={selectedItem.images[0]}
                    alt={selectedItem.title}
                    className="w-full h-48 object-cover rounded-xl"
                  />
                </div>
              )}

              <div className="space-y-6">
                <div className="bg-slate-50 p-4 rounded-xl">
                  <h3 className="font-bold text-slate-900 mb-3 text-lg">Description</h3>
                  <p className="text-slate-800 leading-relaxed text-base">{selectedItem.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Category</span>
                    <p className="text-lg font-bold text-slate-900 capitalize mt-1">{selectedItem.category}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Condition</span>
                    <p className="text-lg font-bold text-slate-900 capitalize mt-1">{selectedItem.condition}</p>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded-lg">
                    <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Price</span>
                    <p className="text-lg font-bold text-emerald-700 mt-1">
                      {selectedItem.isFree ? 'FREE' : `$${selectedItem.price}`}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Owner</span>
                    <p className="text-lg font-bold text-slate-900 mt-1">{selectedItem.owner.name}</p>
                  </div>
                </div>

                <div className="bg-amber-50 p-3 rounded-lg">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Location</span>
                  <p className="font-bold text-slate-900 flex items-start mt-1">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5 text-amber-600" />
                    <span className="text-sm leading-relaxed">{selectedItem.address}</span>
                  </p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => handleStartNavigation(selectedItem)}
                    className="flex-1 bg-slate-900 text-white px-4 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center justify-center"
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Get Directions
                  </button>
                  <button
                    onClick={() => handleStartChat(selectedItem)}
                    className="flex-1 bg-white text-slate-900 border border-slate-300 px-4 py-3 rounded-lg font-medium hover:bg-slate-50 transition-colors flex items-center justify-center"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 