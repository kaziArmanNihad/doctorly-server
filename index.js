const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv") ;

// Configs
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;

// Route Paths
const connectDB = require("./src/config/db.js");
const homeRoute = require("./src/routers/homeRoute.js");

// Middlewares
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));


// All Routers
app.use("/", homeRoute);



// Start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();