const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  displayName: {
    type: String,
    default: ''
  },
  password: {
    type: String,
    required: function() { return !this.googleId; } // Only required if not a Google user
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allows multiple documents to have a null value for this field
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
  
});

// Middleware to delete user's URLs when a user is deleted
userSchema.pre('remove', async function(next) {
  await this.model('Url').deleteMany({ owner: this._id });
  next();
});

userSchema.virtual('urls', {
  ref: 'Url',
  localField: '_id',
  foreignField: 'owner'
});

// Ensure virtuals are included when converting to JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });


module.exports = mongoose.model('User', userSchema);
