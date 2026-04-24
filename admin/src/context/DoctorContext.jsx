import { createContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const DoctorContext = createContext();

const DoctorContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [dToken, setDToken] = useState(localStorage.getItem("dToken") || "");
  const [appointments, setAppointments] = useState([]);

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
  const value = {
    dToken,
    setDToken,
    backendUrl,
    appointments,
    setAppointments,
    getAppointments,
  };

  return (
    <DoctorContext.Provider value={value}>
      {props.children}
    </DoctorContext.Provider>
  );
};

export default DoctorContextProvider;
