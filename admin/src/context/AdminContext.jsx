import { createContext, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AdminContext = createContext();

const AdminContextProvider = ({ children }) => {
  const [aToken, setAToken] = useState(localStorage.getItem("atoken") || "");
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // ✅ Get Dashboard Data
  const getDashData = useCallback(async () => {
    if (!aToken) return;

    try {
      const { data } = await axios.get(backendUrl + "/api/admin/dashboard", {
        headers: { Authorization: `Bearer ${aToken}` },
      });

      if (data.success) {
        setDashData(data.dashData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }, [aToken, backendUrl]);

  // ✅ Get All Appointments
  const getAllAppointments = useCallback(async () => {
    if (!aToken) return;

    try {
      setLoading(true);

      const { data } = await axios.get(backendUrl + "/api/admin/appointments", {
        headers: { Authorization: `Bearer ${aToken}` },
      });

      if (data.success) {
        setAppointments(data.appointments || []);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [aToken, backendUrl]);

  // ✅ Cancel Appointment
  const cancelAppointment = useCallback(
    async (appointmentId) => {
      if (!aToken) return;

      try {
        const { data } = await axios.post(
          backendUrl + "/api/admin/cancel-appointment",
          { appointmentId },
          {
            headers: { Authorization: `Bearer ${aToken}` },
          },
        );

        if (data.success) {
          toast.success(data.message);
          getAllAppointments();
          getDashData();
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error(error.message);
      }
    },
    [aToken, backendUrl, getAllAppointments, getDashData],
  );

  // ✅ STABLE CONTEXT VALUE
  const value = useMemo(
    () => ({
      aToken,
      setAToken,
      backendUrl,
      doctors,
      appointments,
      dashData,
      loading,
      getDashData,
      getAllAppointments,
      cancelAppointment,
    }),
    [
      aToken,
      backendUrl,
      doctors,
      appointments,
      dashData,
      loading,
      getDashData,
      getAllAppointments,
      cancelAppointment,
    ],
  );

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
};

export default AdminContextProvider;
