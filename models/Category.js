const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: [100, 'Category name cannot exceed 100 characters'],
    },
  },
  { timestamps: true }
);

categorySchema.index({ user: 1, name: 1 }, { unique: true });

module.exports = mongoose.models.Category || mongoose.model('Category', categorySchema);
