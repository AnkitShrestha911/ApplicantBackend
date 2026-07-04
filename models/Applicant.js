const mongoose = require('mongoose');

const applicantSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    applicantName: {
      type: String,
      required: [true, 'Applicant name is required'],
      trim: true,
      maxlength: [150, 'Applicant name cannot exceed 150 characters'],
    },
    applicantId: {
      type: String,
      required: [true, 'Applicant ID is required'],
      trim: true,
      maxlength: [50, 'Applicant ID cannot exceed 50 characters'],
    },
    referrer: {
      type: String,
      trim: true,
      maxlength: [100, 'Referrer value is too long'],
      default: null,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    type: {
      type: String,
      enum: ['New', 'Add'],
      required: [true, 'Type is required'],
    },
    phoneNumber: {
      type: String,
      trim: true,
      maxlength: [20, 'Phone number cannot exceed 20 characters'],
      default: null,
    },
  },
  { timestamps: true }
);


applicantSchema.index({ user: 1, category: 1, applicantId: 1 }, { unique: true });

module.exports = mongoose.models.Applicant || mongoose.model('Applicant', applicantSchema);
