import { createContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const DoctorContext = createContext();

const DoctorContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [dToken, setDToken] = useState(localStorage.getItem("dToken") || "");
  const [appointments, setAppointments] = useState([]);
  const [dashData, setDashData] = useState(false);

  const getAppointments = async () => {
    console.log("API called");
    try {
      if (!dToken) {
        console.log("No token, request blocked");
        return;
      }

      const { data } = await axios.get(
        backendUrl + "/api/doctor/appointments",

        {
          headers: { Authorization: `Bearer ${dToken}` },
        },
      );
      console.log("API response:", data);

      if (data.success && data.appointments) {
        const reversed = [...data.appointments].reverse();
        setAppointments(reversed);
        console.log(reversed);
      } else {
        toast.error(data.message || "Failed to fetch appointments");
      }
    } catch (error) {
      console.log("API ERROR:", error);
      toast.error(error.message);
    }
  };

  const completeAppointment = async (appointmentId) => {
    try {
      if (!dToken) {
        toast.error("Unauthorized");
        return;
      }

      const { data } = await axios.post(
        backendUrl + "/api/doctor/complete-appointment",
        { appointmentId },
        {
          headers: {
            Authorization: `Bearer ${dToken}`,
          },
        },
      );

      if (data.success) {
        toast.success(data.message);
        getAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      if (!dToken) {
        toast.error("Unauthorized");
        return;
      }

      const { data } = await axios.post(
        backendUrl + "/api/doctor/cancel-appointment",
        { appointmentId },
        {
          headers: {
            Authorization: `Bearer ${dToken}`,
          },
        },
      );

      if (data.success) {
        toast.success(data.message);
        getAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const getDashData = async () => {
    try {
      if (!dToken) {
        toast.error("Unauthorized");
        return;
      }

      const { data } = await axios.get(backendUrl + "/api/doctor/dashboard", {
        headers: { Authorization: `Bearer ${dToken}` },
      });

      console.log("Dashboard API:", data);

      if (data.success) {
        setDashData(data.dashData);
        console.log(data.dashData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const value = {
    dToken,
    setDToken,
    backendUrl,
    appointments,
    setAppointments,
    getAppointments,
    completeAppointment,
    cancelAppointment,
    dashData,
    setDashData,
    getDashData,
  };

  return (
    <DoctorContext.Provider value={value}>
      {props.children}
    </DoctorContext.Provider>
  );
};

export default DoctorContextProvider;
