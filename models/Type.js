const mongoose = require('mongoose');

const typeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Type name is required'],
      trim: true,
      maxlength: [100, 'Type name cannot exceed 100 characters'],
    },
  },
  { timestamps: true }
);

typeSchema.index({ user: 1, name: 1 }, { unique: true });

module.exports = mongoose.models.Type || mongoose.model('Type', typeSchema);
