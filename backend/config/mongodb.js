import mongoose from "mongoose";

const connectDb = async () => {
  mongoose.connection.on("connected", () => console.log("DataBase Connected"));
  await mongoose.connect(`${process.env.MONGODB_URI}/prescripto`);
};

export default connectDb;
