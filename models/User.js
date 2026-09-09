import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    mailingName: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
      default: 'Andhra Pradesh',
    },
    country: {
      type: String,
      trim: true,
      default: 'India',
    },
    pincode: {
      type: String,
      trim: true,
      default: '',
    },
    telephone: {
      type: String,
      trim: true,
      default: '',
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    fax: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      default: '',
    },
    website: {
      type: String,
      trim: true,
      default: '',
    },
    gst: {
      type: String,
      required: true,
      trim: true,
    },
    IEC: {
      type: String,
      required: true,
      trim: true,
    },
    finYear: {
      type: String,
      default: '1-Apr-2026',
    },
    booksBegin: {
      type: String,
      default: '1-Apr-2026',
    },
    currency: {
      type: String,
      default: '₹',
    },
    formalName: {
      type: String,
      default: 'INR',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model('User', UserSchema);

