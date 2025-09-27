import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${process.env.DB_NAME}`
    );
    console.log(
      `\n[DB-CONNECTION] [db.js] MONGODB DATABASE CONNECTION SUCCESSFULL :: DB_HOST -> ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error(
      `\n[DB-CONNECTION] [db.js] MONGODB DATABASE CONNECTION FAILED ${error.message}`
    );
    process.exit(1);
  }
};

export { connectDB };
