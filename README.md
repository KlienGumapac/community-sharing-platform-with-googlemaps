# ShareHub - Community Sharing Platform

A modern web application that enables community members to share and discover items like food, equipment, and other belongings. Built with Next.js, TypeScript, MongoDB, and Google Maps API.

## Features

### 🎯 Core Functionality

- **User Authentication** - Secure signup/signin with JWT tokens
- **Item Posting** - Share food, equipment, clothing, electronics, and more
- **Location-Based Discovery** - Interactive Google Maps with nearby item search
- **Real-time Chat** - Direct messaging between users
- **Navigation Integration** - Get directions to pickup locations
- **Image Upload** - Support for multiple item photos

### 🗺️ Map Features

- Interactive Google Maps interface
- Location-based item filtering
- Distance-based search (1-50km radius)
- Category and status filters
- Click markers to view item details
- Direct navigation to pickup locations

### 👥 User Experience

- Modern, responsive UI with Tailwind CSS
- Real-time notifications with toast messages
- User profiles with sharing history
- Item status tracking (available, pending, claimed)
- Mobile-friendly design

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with bcrypt
- **Maps**: Google Maps JavaScript API
- **Real-time**: Socket.io (for chat functionality)
- **Image Storage**: Cloudinary (configurable)
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB database
- Google Maps API key

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd food-sharing-platform
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:

   ```env
   MONGODB_URI=
   GOOGLE_MAPS_API_KEY=
   NEXTAUTH_SECRET=your-secret-key-here
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── items/         # Item management endpoints
│   │   └── upload/        # File upload endpoint
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   ├── discover/          # Map discovery page
│   ├── post-item/         # Item posting form
│   └── globals.css        # Global styles
├── components/            # Reusable components
├── lib/                   # Utility functions
│   ├── mongodb.ts         # Database connection
│   └── auth.ts            # Authentication helpers
├── models/                # MongoDB schemas
│   ├── User.ts           # User model
│   ├── Item.ts           # Item model
│   └── Message.ts        # Message model
└── types/                 # TypeScript type definitions
```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Items

- `GET /api/items` - Get all items with filters
- `POST /api/items` - Create new item
- `GET /api/items/nearby` - Get items by location
- `GET /api/items/my-items` - Get user's items

### File Upload

- `POST /api/upload` - Upload images

## Database Schema

### User Model

```typescript
{
  name: string,
  email: string,
  password: string,
  avatar: string,
  location: {
    type: 'Point',
    coordinates: [number, number]
  },
  address: string,
  rating: number,
  itemsShared: number,
  itemsReceived: number
}
```

### Item Model

```typescript
{
  title: string,
  description: string,
  category: string,
  images: string[],
  location: {
    type: 'Point',
    coordinates: [number, number]
  },
  address: string,
  owner: ObjectId,
  status: string,
  condition: string,
  expiresAt: Date,
  tags: string[],
  isFree: boolean,
  price: number
}
```

## Features in Detail

### Location-Based Search

The app uses MongoDB's geospatial queries to find items within a specified radius of the user's location. This enables efficient discovery of nearby items.

### Real-time Updates

Socket.io integration allows for real-time chat functionality and live updates when items are posted or claimed.

### Security

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS protection

### Performance

- MongoDB indexing for geospatial queries
- Image optimization
- Lazy loading for better UX
- Responsive design for all devices

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email kliengumapac5.com or create an issue in the repository.

**Built with ❤️ for community sharing**
