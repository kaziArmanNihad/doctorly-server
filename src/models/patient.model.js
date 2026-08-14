const mongoose = require("mongoose");

const PHONE_REGEX = /^[+]?[\d\s()-]{7,20}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Patient name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    age: {
      type: Number,
      min: [0, "Age cannot be negative"],
      max: [150, "Age is out of range"],
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    condition: {
      type: String,
      trim: true,
      maxlength: 150,
      index: true, // patient-condition filter
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: (v) => !v || PHONE_REGEX.test(v),
        message: (props) => `${props.value} is not a valid phone number`,
      },
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: (v) => !v || EMAIL_REGEX.test(v),
        message: (props) => `${props.value} is not a valid email address`,
      },
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "A patient must belong to a doctor"],
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

// --- Indexing strategy ---
patientSchema.index({ name: "text", condition: "text" }); // search
patientSchema.index({ createdAt: -1 }); // date-wise filter/sort
patientSchema.index({ doctor: 1, createdAt: -1 }); // "patients for doctor X, newest first"
patientSchema.index({ condition: 1, createdAt: -1 }); // condition filter + recency sort

const Patient =
  mongoose.models.Patient || mongoose.model("Patient", patientSchema);

module.exports = Patient;
