import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AdminContext = createContext();

const AdminContextProvider = ({ children }) => {
  const [aToken, setAToken] = useState(localStorage.getItem("atoken") || "");

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // ✅ Run interceptor only once
  useEffect(() => {
    const interceptor = axios.interceptors.request.use((config) => {
      const token = localStorage.getItem("atoken");

      console.log("INTERCEPTOR TOKEN:", token);

      if (token) {
        config.headers.atoken = token;
      }

      return config;
    });

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, []);

  return (
    <AdminContext.Provider value={{ aToken, setAToken, backendUrl }}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;
