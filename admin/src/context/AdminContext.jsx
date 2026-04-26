import {
  createContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AdminContext = createContext();

const AdminContextProvider = ({ children }) => {
  const [aToken, setAToken] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true); // 🔥 important

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // ✅ Restore token on refresh
  useEffect(() => {
    const token = localStorage.getItem("atoken");
    if (token) {
      setAToken(token);
    }
    setLoading(false);
  }, []);

  // ✅ Sync token to localStorage
  useEffect(() => {
    if (aToken) {
      localStorage.setItem("atoken", aToken);
    }
  }, [aToken]);

  // ✅ Logout function (IMPORTANT)
  const logout = () => {
    localStorage.removeItem("atoken");
    setAToken("");
  };

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
      toast.error(error.response?.data?.message || error.message);
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
      toast.error(error.response?.data?.message || error.message);
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
        toast.error(error.response?.data?.message || error.message);
      }
    },
    [aToken, backendUrl, getAllAppointments, getDashData],
  );

  // ✅ Context value
  const value = useMemo(
    () => ({
      aToken,
      setAToken,
      logout, // 👈 added
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
