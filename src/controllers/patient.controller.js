const Patient = require("../models/patient.model");
const Doctor = require("../models/doctor.model");

const createPatient = async (req, res) => {
  try {
    const { name, age, gender, condition, phone, email, doctor } = req.body;

    // Doctor _id is a String, so don't convert it to ObjectId
    const doctorExists = await Doctor.findById(doctor);

    if (!doctorExists) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Create patient
    const patient = await Patient.create({
      name,
      age,
      gender,
      condition,
      phone,
      email,
      doctor: doctorExists._id,
    });

    // Add patient to doctor's patient list
    doctorExists.patients.push(patient._id);

    await doctorExists.save();

    return res.status(201).json({
      success: true,
      data: patient,
    });
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all patients (search, filter, date-range, pagination)
// @route   GET /patients?search=&condition=&doctor=&startDate=&endDate=&page=&limit=
const getPatients = async (req, res) => {
  try {
    const {
      search,
      condition,
      doctor,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    // Search
    if (search) {
      const regex = new RegExp(search, "i");

      filter.$or = [{ name: regex }, { condition: regex }];
    }

    // Condition filter
    if (condition) {
      filter.condition = condition;
    }

    // Doctor filter
    if (doctor) {
      filter.doctor = doctor;
    }

    // Date filter
    if (startDate || endDate) {
      filter.createdAt = {};

      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        filter.createdAt.$lte = end;
      }
    }

    // Pagination
    const pageNum = Math.max(parseInt(page, 10), 1);

    const limitNum = Math.max(parseInt(limit, 10), 1);

    const skip = (pageNum - 1) * limitNum;

    // Fetch patients + total count
    const [patients, total] = await Promise.all([
      Patient.find(filter).sort("-createdAt").skip(skip).limit(limitNum),

      Patient.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: patients,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single patient
// @route   GET /patients/:id
const getPatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).populate(
      "doctor",
      "name specialization hospital",
    );

    if (!patient) {
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });
    }

    res.status(200).json({ success: true, data: patient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a patient
// @route   PUT/PATCH /patients/:id
const updatePatient = async (req, res) => {
  try {
    const id = req.params.id;
    const patient = await Patient.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate("doctor", "name specialization hospital");

    if (!patient) {
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });
    }

    res.status(200).json({ success: true, data: patient });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete a patient
// @route   DELETE /patients/:id
const deletePatient = async (req, res) => {
  const id = req.params.id;
  console.log(id, "patient id to delete");
  // try {
  //   const patient = await Patient.findByIdAndDelete(id);

  //   if (!patient) {
  //     return res
  //       .status(404)
  //       .json({ success: false, message: "Patient not found" });
  //   }

  //   res.status(200).json({ success: true, message: "Patient deleted" });
  // } catch (error) {
  //   res.status(500).json({ success: false, message: error.message });
  // }
};

module.exports = {
  createPatient,
  getPatients,
  getPatient,
  updatePatient,
  deletePatient,
};
