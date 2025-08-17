import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['food', 'equipment', 'clothing', 'electronics', 'furniture', 'books', 'other'],
  },
  images: [{
    type: String,
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  address: {
    type: String,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['available', 'pending', 'claimed'],
    default: 'available',
  },
  condition: {
    type: String,
    enum: ['new', 'like-new', 'good', 'fair', 'poor'],
    required: true,
  },
  expiresAt: {
    type: Date,
  },
  tags: [{
    type: String,
  }],
  isFree: {
    type: Boolean,
    default: true,
  },
  price: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

itemSchema.index({ location: '2dsphere' });
itemSchema.index({ category: 1 });
itemSchema.index({ status: 1 });
itemSchema.index({ createdAt: -1 });

export default mongoose.models.Item || mongoose.model('Item', itemSchema); 