import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import razorpay from "razorpay";

// API to register user
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Missing details" });
    }

    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Enter a valid email" });
    }

    if (!validator.isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be strong",
      });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await userModel.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// API for user login

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get user profile data
const getProfile = async (req, res) => {
  try {
    const userId = req.userId;

    // check if userId exists
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No userId found",
      });
    }

    const userData = await userModel.findById(userId).select("-password");

    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      userData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// API to update user profile

const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, phone, address, dob, gender } = req.body;
    const imageFile = req.file;

    if (!name || !phone || !dob || !gender) {
      return res.status(400).json({
        success: false,
        message: "Data missing",
      });
    }

    let parsedAddress;

    try {
      parsedAddress = address ? JSON.parse(address) : {};
    } catch {
      parsedAddress = address || {};
    }

    // ensure default structure
    parsedAddress = {
      line1: parsedAddress?.line1 || "",
      line2: parsedAddress?.line2 || "",
    };

    let updateData = {
      name,
      phone,
      address: parsedAddress,
      dob,
      gender,
    };

    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });

      updateData.image = imageUpload.secure_url;
    }

    await userModel.findByIdAndUpdate(userId, updateData);

    res.status(200).json({
      success: true,
      message: "Profile updated",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// API to book appointment

const bookAppointment = async (req, res) => {
  try {
    const { docId, slotDate, slotTime } = req.body;
    const userId = req.userId;

    // 1. Validate input
    if (!docId || !slotDate || !slotTime) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // 2. Find doctor
    const docData = await doctorModel.findById(docId);

    if (!docData) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    if (!docData.available) {
      return res.json({
        success: false,
        message: "Doctor not available",
      });
    }

    // 3. Check slot availability
    let slots_booked = { ...(docData.slots_booked || {}) };

    if (slots_booked[slotDate]?.includes(slotTime)) {
      return res.json({
        success: false,
        message: "Slot not available",
      });
    }

    // 4. Convert time to 24-hour format
    const convertTo24Hour = (time) => {
      let [hourMin, modifier] = time.split(" ");
      let [hours, minutes] = hourMin.split(":");

      if (modifier.toLowerCase() === "pm" && hours !== "12") {
        hours = parseInt(hours, 10) + 12;
      }
      if (modifier.toLowerCase() === "am" && hours === "12") {
        hours = "00";
      }

      return `${hours}:${minutes}`;
    };

    const slotDateTime = new Date(`${slotDate}T${convertTo24Hour(slotTime)}`);

    // 5. Final safety check (very important)
    if (isNaN(slotDateTime)) {
      return res.status(400).json({
        success: false,
        message: "Invalid date/time format",
      });
    }

    // 6. Save slot in doctor's booked slots
    if (!slots_booked[slotDate]) {
      slots_booked[slotDate] = [];
    }

    slots_booked[slotDate].push(slotTime);

    // 7. Create appointment (MATCHING SCHEMA)
    const appointmentData = {
      userId,
      doctorId: docId,
      slotDateTime,
      amount: docData.fees,
    };

    await appointmentModel.create(appointmentData);

    // 8. Update doctor
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    // 9. Response
    res.json({
      success: true,
      message: "Appointment Booked",
    });
  } catch (error) {
    // for debugging

    // console.log("FULL ERROR:", error);
    // console.log("BODY:", req.body);
    // console.log("USER:", req.userId);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Api to get user appointments for frontend my-appointments page

const listAppointment = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const appointments = await appointmentModel
      .find({ userId })
      .populate("doctorId", "name image speciality address")
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// API to cancel appointment

const cancelAppointment = async (req, res) => {
  try {
    const userId = req.userId;
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID",
      });
    }

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (appointmentData.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized Action",
      });
    }

    if (appointmentData.cancelled) {
      return res.status(400).json({
        success: false,
        message: "Appointment already cancelled",
      });
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
    });

    const doctorId = appointmentData.doctorId;
    const slotDateTime = appointmentData.slotDateTime;

    const doctorData = await doctorModel.findById(doctorId);

    if (doctorData) {
      let slots_booked = { ...doctorData.slots_booked };

      const date = new Date(slotDateTime);
      const slotDate = date.toISOString().split("T")[0];
      const slotTime = date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      if (slots_booked[slotDate]) {
        slots_booked[slotDate] = slots_booked[slotDate].filter(
          (e) => e !== slotTime,
        );
      }

      await doctorModel.findByIdAndUpdate(doctorId, { slots_booked });
    }

    res.json({
      success: true,
      message: "Appointment Cancelled",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// API to make payment of appointment using razorpay

const paymentRazorpay = async (req, res) => {
  try {
    const userId = req.userId;
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID",
      });
    }

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (appointmentData.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (appointmentData.cancelled) {
      return res.status(400).json({
        success: false,
        message: "Appointment is cancelled",
      });
    }

    if (appointmentData.payment) {
      return res.status(400).json({
        success: false,
        message: "Already paid",
      });
    }

    const options = {
      amount: appointmentData.amount * 100,
      currency: process.env.CURRENCY,
      receipt: appointmentId,
      notes: {
        appointmentId,
        userId,
      },
    };

    const order = await razorpayInstance.orders.create(options);

    // store order id
    appointmentData.paymentOrderId = order.id;
    await appointmentData.save();

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
  paymentRazorpay,
};
