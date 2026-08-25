const mongoose = require("mongoose");

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.warn("MongoDB connection skipped: MONGODB_URI is not configured");
    return;
  }

  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI);

    console.log(
      `MongoDB connected: ${connection.connection.host}/${connection.connection.name}`,
    );
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    // process.exit(1);
  }
};

module.exports = connectDB;
