const mongoose = require("mongoose");

const PHONE_REGEX = /^[+]?[\d\s()-]{7,20}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const doctorSchema = new mongoose.Schema(
  {
    _id: { type: String, optional: true },
    name: {
      type: String,
      required: [true, "Doctor name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    specialization: {
      type: String,
      required: [true, "Specialization is required"],
      trim: true,
      maxlength: 100,
      index: true, // frequently filtered on
    },
    hospital: {
      type: String,
      required: [true, "Hospital is required"],
      trim: true,
      maxlength: 150,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      validate: {
        validator: (v) => PHONE_REGEX.test(v),
        message: (props) => `${props.value} is not a valid phone number`,
      },
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      unique: true, // creates a unique index
      validate: {
        validator: (v) => EMAIL_REGEX.test(v),
        message: (props) => `${props.value} is not a valid email address`,
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, id: false },
    toObject: { virtuals: true, id: false },
  },
);

// --- Indexing strategy ---
doctorSchema.index({ name: "text", specialization: "text", hospital: "text" }); // search
doctorSchema.index({ createdAt: -1 }); // date-wise filter/sort
doctorSchema.index({ specialization: 1, createdAt: -1 }); // filter + sort combo

const Doctor = mongoose.models.Doctor || mongoose.model("Doctor", doctorSchema);

module.exports = Doctor;
