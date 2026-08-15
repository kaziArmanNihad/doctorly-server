const Doctor = require("../models/doctor.model");
const Patient = require("../models/patient.model");
const mongoose = require("mongoose");

// @desc    Create a doctor
// @route   POST /doctors
const createDoctor = async (req, res) => {
  try {
    const { name, specialization, hospital, phone, email } = req.body;

    const doctor = await Doctor.create({
      name,
      specialization,
      hospital,
      phone,
      email,
    });

    res.status(201).json({ success: true, data: doctor });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all doctors (search, filter, date-range, pagination)
// @route   GET /doctors?search=&specialization=&startDate=&endDate=&page=&limit=
const getDoctors = async (req, res) => {
  try {
    const {
      search,
      specialization,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [
        { name: regex },
        { specialization: regex },
        { hospital: regex },
      ];
    }

    if (specialization) {
      filter.specialization = specialization;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const pageNum = Math.max(parseInt(page), 1);
    const limitNum = Math.max(parseInt(limit), 1);
    const skip = (pageNum - 1) * limitNum;

    // Instead of populate("patients") — which reads a stale/never-updated
    // array field on Doctor — aggregate the real Patient collection so
    // patientCount always reflects reality.
    const [doctors, total] = await Promise.all([
      Doctor.aggregate([
        { $match: filter },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limitNum },
        {
          $lookup: {
            from: "patients", // must match the actual MongoDB collection name for Patient
            localField: "_id",
            foreignField: "doctor",
            as: "patients",
          },
        },
        {
          $addFields: {
            patientCount: { $size: "$patients" },
          },
        },
      ]),
      Doctor.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: doctors,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single doctor with their patients
// @route   GET /doctors/:id
const getDoctor = async (req, res) => {
  try {
    const { _id } = req.params;
    const doctor = await Doctor.findById(_id);

    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    const patients = await Patient.find({ doctor: doctor._id }).sort(
      "-createdAt",
    );

    res.status(200).json({
      success: true,
      data: { doctor, patients, patientCount: patients.length },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a doctor
// @route   PUT/PATCH /doctors/:id
const updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete a doctor (and their patients)
// @route   DELETE /doctors/:id
const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    await Patient.deleteMany({ doctor: doctor._id });
    await doctor.deleteOne();

    res
      .status(200)
      .json({ success: true, message: "Doctor and their patients deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createDoctor,
  getDoctors,
  getDoctor,
  updateDoctor,
  deleteDoctor,
};
