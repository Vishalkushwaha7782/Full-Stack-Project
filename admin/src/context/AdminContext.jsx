import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AdminContext = createContext();

const AdminContextProvider = ({ children }) => {
  const [aToken, setAToken] = useState(localStorage.getItem("atoken") || "");

  const [doctors, setDoctors] = useState([]);

  const [loading, setLoading] = useState(false);

  const [appointments, setAppointments] = useState([]);
  const [dashData, setDashData] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const getAllDoctors = async () => {
    try {
      if (!aToken) {
        toast.error("No token found");
        return;
      }

      console.log("TOKEN:", aToken);

      const { data } = await axios.post(
        backendUrl + "/api/admin/all-doctors",
        {},
        {
          headers: {
            Authorization: `Bearer ${aToken}`,
          },
        },
      );

      if (data.success) {
        setDoctors(data.doctors);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const changeAvailability = async (docId) => {
    if (!docId) {
      toast.error("Invalid doctor ID");
      return;
    }

    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/change-availability",
        { docId },
        {
          headers: {
            Authorization: `Bearer ${aToken}`, // adjust if backend expects different
          },
        },
      );

      if (data.success) {
        toast.success(data.message);
        await getAllDoctors();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const getAllAppointments = async () => {
    try {
      if (!aToken) {
        toast.error("Unauthorized access");
        return;
      }

      setLoading(true);

      const { data } = await axios.get(backendUrl + "/api/admin/appointments", {
        headers: { Authorization: `Bearer ${aToken}` },
      });

      if (data.success) {
        setAppointments(data.appointments || []);
        console.log(data.appointments);
      } else {
        toast.error(data.message || "Failed to fetch appointments");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setAToken(null);
        localStorage.removeItem("aToken");
        toast.error("Session expired. Please login again.");
      } else {
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Something went wrong",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/cancel-appointment",
        { appointmentId },
        { headers: { Authorization: `Bearer ${aToken}` } },
      );
      if (data.success) {
        toast.success(data.message);
        getAllAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getDashData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/admin/dashboard", {
        headers: { Authorization: `Bearer ${aToken}` },
      });

      if (data.success) {
        setDashData(data.dashData);
        console.log(data.dashData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <AdminContext.Provider
      value={{
        aToken,
        setAToken,
        backendUrl,
        doctors,
        getAllDoctors,
        changeAvailability,
        appointments,
        setAppointments,
        getAllAppointments,
        loading,
        cancelAppointment,
        dashData,
        getDashData,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;
