import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Item from '@/models/Item'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const lat = parseFloat(searchParams.get('lat') || '0')
    const lng = parseFloat(searchParams.get('lng') || '0')
    const distance = parseFloat(searchParams.get('distance') || '10')
    const category = searchParams.get('category')
    const status = searchParams.get('status')

    if (!lat || !lng) {
      return NextResponse.json(
        { message: 'Latitude and longitude are required' },
        { status: 400 }
      )
    }

    const query: any = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
          $maxDistance: distance * 1000, // Convert km to meters
        },
      },
    }

    if (category && category !== 'all') {
      query.category = category
    }

    if (status) {
      query.status = status
    }

    const items = await Item.find(query)
      .populate('owner', 'name')
      .sort({ createdAt: -1 })
      .limit(50)

    return NextResponse.json({ items })
  } catch (error) {
    console.error('Error fetching nearby items:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 