const express = require("express");

const {
  createDoctor,
  getDoctors,
  getDoctor,
  updateDoctor,
  deleteDoctor,
} = require("../controllers/doctor.controller");

const router = express.Router();

// get routers
router.get("/", getDoctors);
router.get("/:id", getDoctor);

// post router
router.post("/", createDoctor);

// update routers
router.put("/:id", updateDoctor);
router.patch("/:id", updateDoctor);

// delete router
router.delete("/:id", deleteDoctor);

module.exports = router;
