const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: function () {
        return this.isVerified;
      },
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      default: null,
    },

    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    userType: {
      type: String,
      required: true,
      enum: ['customer', 'pharmacist', 'admin'],
      default: 'customer',
    },

    pharmacyName: {
      type: String,
      required: function () {
        return this.userType === 'pharmacist' && this.isVerified;
      },
    },

    address: {
      type: String,
      default: "",
      required: true
    },


    activatedAt: {
      type: Date,
      default: null
    },

    pincode: {
      type: String,
      required: true
    },

    licenseNumber: {
      type: String,
      default: ""
    },

    // Add these fields to your existing userSchema
    isAvailable: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },

    otp: String,
    otpExpires: Date,

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  if (this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
