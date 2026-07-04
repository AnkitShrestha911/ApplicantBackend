const mongoose = require('mongoose');

const referrerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Referrer name is required'],
      trim: true,
      maxlength: [100, 'Referrer name cannot exceed 100 characters'],
    },
  },
  { timestamps: true }
);

referrerSchema.index({ user: 1, name: 1 }, { unique: true });

module.exports = mongoose.models.Referrer || mongoose.model('Referrer', referrerSchema);
