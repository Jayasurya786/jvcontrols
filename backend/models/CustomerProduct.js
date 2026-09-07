import mongoose from 'mongoose';

const ServiceScheduleItemSchema = new mongoose.Schema(
  {
    serviceNumber: {
      type: Number,
      required: true,
    },
    monthInterval: {
      type: Number,
      required: true, // 6, 12, 18, 24...
    },
    label: {
      type: String,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['DEFAULT', 'SERVICED'],
      default: 'DEFAULT',
    },
    servicedDate: {
      type: Date,
      default: null,
    },
    technician: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    emailNotifiedAt: {
      type: Date,
      default: null,
    },
    emailNotifiedCount: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

export function generateServiceSchedule(purchaseDate, warrantyYears) {
  const years = Number(warrantyYears) || 1;
  const count = Math.max(1, Math.round(years * 2)); // 2 periodic services per year (every 6 months)
  const schedule = [];
  const pDate = new Date(purchaseDate);

  for (let i = 1; i <= count; i++) {
    const dueDate = new Date(pDate);
    dueDate.setMonth(dueDate.getMonth() + i * 6);

    schedule.push({
      serviceNumber: i,
      monthInterval: i * 6,
      label: `Service #${i} (${i * 6}th Month Checkup)`,
      dueDate,
      status: 'DEFAULT',
      servicedDate: null,
      technician: '',
      notes: '',
      emailNotifiedAt: null,
      emailNotifiedCount: 0,
    });
  }
  return schedule;
}

const CustomerProductSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      index: true,
    },
    mobile: {
      type: String,
      required: [true, 'Customer mobile number is required'],
      trim: true,
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    address: {
      type: String,
      required: [true, 'Customer installation / site address is required'],
      trim: true,
    },
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      index: true,
    },
    category: {
      type: String,
      enum: [
        'Online UPS',
        'Inverter',
        'Tubular Battery',
        'SMF Battery',
        'Servo Stabilizer',
        'Solar System',
        'Other',
      ],
      default: 'Online UPS',
    },
    serialNumber: {
      type: String,
      required: [true, 'Product serial number is required'],
      trim: true,
      uppercase: true,
      unique: true,
      index: true,
    },
    purchaseDate: {
      type: Date,
      required: [true, 'Date of purchase / buying is required'],
      index: true,
    },
    warrantyYears: {
      type: Number,
      required: [true, 'Warranty period in years is required'],
      min: [1, 'Warranty must be at least 1 year'],
      default: 1,
    },
    warrantyExpiryDate: {
      type: Date,
      required: true,
      index: true,
    },
    serviceSchedule: {
      type: [ServiceScheduleItemSchema],
      default: [],
    },
    invoiceNumber: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['ACTIVE_WARRANTY', 'EXPIRED_WARRANTY', 'AMC_ACTIVE'],
      default: 'ACTIVE_WARRANTY',
      index: true,
    },
    warrantyEmailNotifiedAt: {
      type: Date,
      default: null,
    },
    warrantyEmailNotifiedCount: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: String,
      default: 'Admin',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook: auto-compute warrantyExpiryDate, status, and generate 6-month service schedule
CustomerProductSchema.pre('validate', function () {
  if (this.purchaseDate && this.warrantyYears) {
    const pDate = new Date(this.purchaseDate);
    const expDate = new Date(pDate);
    expDate.setFullYear(expDate.getFullYear() + Number(this.warrantyYears));
    this.warrantyExpiryDate = expDate;

    // Check if currently active or expired
    const now = new Date();
    if (this.status !== 'AMC_ACTIVE') {
      this.status = expDate >= now ? 'ACTIVE_WARRANTY' : 'EXPIRED_WARRANTY';
    }

    // Auto-generate 6-month service schedule if not provided
    if (!this.serviceSchedule || this.serviceSchedule.length === 0) {
      this.serviceSchedule = generateServiceSchedule(this.purchaseDate, this.warrantyYears);
    }
  }
});

export const CustomerProduct =
  mongoose.models.CustomerProduct || mongoose.model('CustomerProduct', CustomerProductSchema);
