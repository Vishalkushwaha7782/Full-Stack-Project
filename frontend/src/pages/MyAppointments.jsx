import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const MyAppointments = () => {
  const { backendUrl, token } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);

  const getUserAppointments = async () => {
    try {
      if (!token) return;

      const { data } = await axios.get(backendUrl + "/api/user/appointments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.success) {
        setAppointments(data.appointments);
      }
    } catch (error) {
      console.log(error);

      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        return;
      }

      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    if (token) {
      getUserAppointments();
    }
  }, [token]);

  return (
    <div>
      <p className="pb-3 mt-12 font-medium text-zinc-700 border-b">
        My Appointments
      </p>

      <div>
        {appointments.length === 0 ? (
          <p className="mt-4 text-gray-500">No appointments found</p>
        ) : (
          appointments.map((item) => {
            console.log(item);
            console.log(item.doctorId);
            const date = new Date(item.slotDateTime);
            const formattedDate = date.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            });

            const formattedTime = date.toLocaleTimeString("en-IN", {
              hour: "numeric",
              minute: "2-digit",
            });

            return (
              <div
                key={item._id}
                className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b"
              >
                {/* Doctor Image */}
                <div>
                  <img
                    className="w-32 bg-indigo-50"
                    src={item.doctorId?.image}
                    alt="doctor"
                  />
                </div>

                {/* Doctor Info */}
                <div className="flex-1 text-sm text-zinc-600">
                  <p className="text-neutral-800 font-semibold">
                    {item.doctorId?.name}
                  </p>

                  <p>{item.doctorId?.speciality}</p>

                  {item.doctorId?.address && (
                    <>
                      <p className="text-zinc-700 font-medium mt-1">Address:</p>
                      <p className="text-xs">{item.doctorId.address.line1}</p>
                      <p className="text-xs">{item.doctorId.address.line2}</p>
                    </>
                  )}

                  <p className="text-xs mt-1">
                    <span className="text-sm text-neutral-700 font-medium">
                      Date & Time:
                    </span>{" "}
                    {formattedDate} | {formattedTime}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 justify-end">
                  <button className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-[#5f6FFF] hover:text-white transition-all duration-300 cursor-pointer">
                    Pay Online
                  </button>

                  <button className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300 cursor-pointer">
                    Cancel appointment
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MyAppointments;
