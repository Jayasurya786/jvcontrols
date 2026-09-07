import mongoose from 'mongoose';

const ServiceTicketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    priority: {
      type: String,
      enum: ['emergency', 'routine'],
      default: 'emergency',
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required for dispatch'],
      trim: true,
      index: true,
    },
    equipmentType: {
      type: String,
      default: 'Online UPS',
      trim: true,
    },
    brandCapacity: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      default: 'Chennai',
      trim: true,
    },
    issueDescription: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['DISPATCH_PENDING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
      default: 'DISPATCH_PENDING',
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

export const ServiceTicket = mongoose.model('ServiceTicket', ServiceTicketSchema);

