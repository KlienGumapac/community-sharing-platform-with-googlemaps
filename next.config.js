/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['res.cloudinary.com', 'maps.googleapis.com'],
  },
  env: {
    MONGODB_URI: 'mongodb+srv://kliengumapac5:Confirmpass123@food.wqlo4sj.mongodb.net/',
    NEXTAUTH_SECRET: 'your-secret-key-here',
    CLOUDINARY_CLOUD_NAME: 'your-cloudinary-cloud-name',
    CLOUDINARY_API_KEY: 'your-cloudinary-api-key',
    CLOUDINARY_API_SECRET: 'your-cloudinary-api-secret',
  },
  publicRuntimeConfig: {
    GOOGLE_MAPS_API_KEY: 'AIzaSyBHP7SxjK6Mcf1AaThEwLtLQ1PMs4NM2Hc',
  },
}

module.exports = nextConfig 