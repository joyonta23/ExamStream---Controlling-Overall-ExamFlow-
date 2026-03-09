const mongoose = require("mongoose");
require("dotenv").config();

const resolveMongoUri = () => {
  if (process.env.MONGODB_URI) {
    return process.env.MONGODB_URI;
  }

  // Handle accidental whitespace in env key names (e.g. "MONGODB_URI ").
  const trimmedMatchKey = Object.keys(process.env).find(
    (key) => key.trim() === "MONGODB_URI" && process.env[key],
  );
  if (trimmedMatchKey) {
    return process.env[trimmedMatchKey];
  }

  return process.env.MONGO_URI || process.env.DATABASE_URL || "";
};

const connectDB = async () => {
  try {
    const mongoUri = resolveMongoUri();

    if (!mongoUri || typeof mongoUri !== "string") {
      throw new Error(
        "MongoDB URI is missing. Set MONGODB_URI in Render, click Save Changes, then redeploy.",
      );
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
