const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true, // Allows null/missing emails if phone is primary
    },
    password: {
      type: String,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true, // Allows null/missing phones if email is primary
    },
    userType: {
      type: String,
      required: true,
      enum: ['customer', 'pharmacist'],
      default: 'customer',
    },
    pharmacyName: {
      type: String,
      required: function() { return this.userType === 'pharmacist'; }
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    otp: String,
    otpExpires: Date,
  },
  {
    timestamps: true,
  }
);

// Hash password before saving (only if email/password auth is used)
userSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;