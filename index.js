const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Configs
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;

// Route + Db Paths
const connectDB = require("./src/config/db.js");
const protect = require("./src/middleware/auth.middleware.js");
const homeRoute = require("./src/routers/home.route.js");
const userRoute = require("./src/routers/user.route.js");
const doctorRoute = require("./src/routers/doctor.route.js");
const patientRoute = require("./src/routers/patient.route.js");

// Middlewares
app.use(
  cors({
    origin: ["http://localhost:3000", "https://doctorly-tracker.vercel.app"],
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// All Routers
app.use("/", homeRoute);
app.use("/api/users", protect, userRoute);
app.use("/api/doctors", protect, doctorRoute);
app.use("/api/patients", protect, patientRoute);

connectDB().catch((error) => {
  console.error("Database connection failed:", error);
});

// local development server
// const startServer = async () => {
//   try {
//     await connectDB();
//     app.listen(PORT, () => {
//       console.log(`Server running on port ${PORT}`);
//     });
//   } catch (error) {
//     console.error("Failed to start server:", error);
//     process.exit(1);
//   }
// };

// startServer();

module.exports = app;
