const Patient = require("../models/patient.model");
const Doctor = require("../models/doctor.model");

const createPatient = async (req, res) => {
  try {
    const { name, age, gender, condition, phone, email, doctor } = req.body;

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

//  using bulk insertMany to create multiple patients at once
const extractId = (value) => {
  if (!value) return value;
  if (typeof value === "string") return value;
  if (typeof value === "object" && value.$oid) return value.$oid;
  if (typeof value.toString === "function") return value.toString();
  return value;
};
const createPatientsBulk = async (req, res) => {
  try {
    const rawPatients = Array.isArray(req.body) ? req.body : req.body?.patients;

    if (!Array.isArray(rawPatients) || rawPatients.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body must be a non-empty array of patients",
      });
    }

    // Normalize each patient, unwrapping $oid on the doctor field
    const patients = rawPatients.map((p) => ({
      name: p.name,
      age: p.age,
      gender: p.gender,
      condition: p.condition,
      phone: p.phone,
      email: p.email,
      doctor: extractId(p.doctor),
    }));

    // Catch any doctor value that still isn't a valid 24-char ObjectId string
    const invalid = patients.filter(
      (p) =>
        typeof p.doctor !== "string" || !/^[0-9a-fA-F]{24}$/.test(p.doctor),
    );
    if (invalid.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid doctor id on ${invalid.length} patient(s): ${invalid
          .map((p) => p.name)
          .join(", ")}`,
      });
    }

    // 1. Validate all referenced doctors exist, in one query
    const doctorIds = [...new Set(patients.map((p) => p.doctor))];
    const doctors = await Doctor.find({ _id: { $in: doctorIds } });

    const foundIds = new Set(doctors.map((d) => d._id.toString()));
    const missingIds = doctorIds.filter((id) => !foundIds.has(id));

    if (missingIds.length > 0) {
      return res.status(404).json({
        success: false,
        message: `Doctor(s) not found: ${missingIds.join(", ")}`,
      });
    }

    // 2. Create all patients in one insert
    const createdPatients = await Patient.insertMany(patients, {
      ordered: false,
    });

    // 3. Group new patient ids by doctor, then bulk update each doctor once
    const patientsByDoctor = {};
    createdPatients.forEach((p) => {
      const docId = p.doctor.toString();
      if (!patientsByDoctor[docId]) patientsByDoctor[docId] = [];
      patientsByDoctor[docId].push(p._id);
    });

    const bulkOps = Object.entries(patientsByDoctor).map(
      ([docId, patientIds]) => ({
        updateOne: {
          filter: { _id: docId },
          update: { $push: { patients: { $each: patientIds } } },
        },
      }),
    );

    if (bulkOps.length > 0) {
      await Doctor.bulkWrite(bulkOps);
    }

    return res.status(201).json({
      success: true,
      count: createdPatients.length,
      data: createdPatients,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

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

const deletePatient = async (req, res) => {
  const id = req.params.id;
  try {
    // deleting patient from doctor.patients array
    const patientToDelete = await Patient.findById(id);

    if (!patientToDelete) {
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });
    }

    const doctorId = patientToDelete.doctor;

    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    doctor.patients.pull(patientToDelete._id);
    await doctor.save();

    // deleting patient from Patient collection
    const patient = await Patient.findByIdAndDelete(id);

    if (!patient) {
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });
    }

    res.status(200).json({ success: true, message: "Patient deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createPatient,
  createPatientsBulk,
  getPatients,
  getPatient,
  updatePatient,
  deletePatient,
};
