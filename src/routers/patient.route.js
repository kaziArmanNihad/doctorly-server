const express = require("express");

const {
  createPatient,
  getPatients,
  getPatient,
  updatePatient,
  deletePatient,
} = require("../controllers/patient.controller");

const router = express.Router();

// get routers
router.get("/", getPatients);
router.get("/:id", getPatient);

// post router
router.post("/", createPatient);

// update routers
router.put("/:id", updatePatient);
router.patch("/:id", updatePatient);

// delete router
router.delete("/:id", deletePatient);

module.exports = router;
