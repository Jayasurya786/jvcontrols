import mongoose from 'mongoose';

const InquirySchema = new mongoose.Schema(
  {
    inquiryId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
      index: true,
    },
    telephone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    serviceType: {
      type: String,
      default: 'General Inquiry',
      trim: true,
    },
    product: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    loadData: {
      type: {
        watts: Number,
        va: Number,
        ah: Number,
        hours: Number,
      },
      default: null,
    },
    location: {
      type: String,
      default: 'Chennai',
      trim: true,
    },
    comments: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
      default: 'NEW',
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Inquiry = mongoose.model('Inquiry', InquirySchema);

