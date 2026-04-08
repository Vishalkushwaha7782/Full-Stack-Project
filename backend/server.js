import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDb from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import adminRouter from "./routes/adminRoute.js";
import doctorRouter from "./routes/docterRoute.js";

// app config
const app = express();
const port = process.env.PORT || 4000;
connectDb();
connectCloudinary();

//  middlewares
app.use(express.json());
app.use(cors());

// api endpoints
app.use("/api/admin", adminRouter);

// add to connect backend with frontend
app.use("/api/doctor", doctorRouter);

app.get("/", (req, res) => {
  res.send("API WORKING ");
});

app.listen(port, () => console.log("Server Started", port));
