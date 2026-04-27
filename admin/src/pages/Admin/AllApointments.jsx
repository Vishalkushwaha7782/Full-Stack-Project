import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";

const AllApointments = () => {
  const { aToken, appointments, getAllAppointments, cancelAppointment } =
    useContext(AdminContext);
  const { calculateAge, currency } = useContext(AppContext);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (aToken) {
        setLoading(true);
        try {
          await getAllAppointments();
        } catch (error) {
          console.error("Error fetching appointments:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [aToken, getAllAppointments]);

  // 🔹 Loading state
  if (loading) {
    return <p className="m-5 text-gray-500">Loading appointments...</p>;
  }

  return (
    <div className="w-full max-w-6xl m-5">
      <p className="mb-3 text-lg font-medium">All Appointments</p>

      <div className="bg-white border rounded text-sm min-h-[60vh] max-h-[80vh] overflow-y-scroll">
        {/* Header */}
        <div className="hidden sm:grid grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] py-3 px-6 border-b">
          <p>#</p>
          <p>Patient</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Doctor</p>
          <p>Fees</p>
          <p>Actions</p>
        </div>

        {/* Empty state */}
        {appointments?.length === 0 && (
          <p className="text-center py-6 text-gray-400">
            No appointments found
          </p>
        )}

        {/* Data */}
        {appointments?.map((item, index) => (
          <div
            key={item._id}
            className="flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50"
          >
            {/* Index */}
            <p className="max-sm:hidden">{index + 1}</p>

            {/* Patient */}
            <div className="flex items-center gap-2">
              <img
                className="w-8 rounded-full"
                src={item.userId?.image || "/default.png"}
                alt="user"
              />
              <p>{item.userId?.name || "Unknown User"}</p>
            </div>

            {/* Age */}
            <p className="max-sm:hidden">
              {item.userId?.dob ? calculateAge(item.userId.dob) : "-"}
            </p>

            {/* Date */}
            <p>{item.slotDateTime || "-"}</p>

            {/* Doctor */}
            <div className="flex items-center gap-2">
              <img
                className="w-8 rounded-full bg-gray-200"
                src={item.doctorId?.image || "/default.png"}
                alt="doctor"
              />
              <p>{item.doctorId?.name || "Unknown Doctor"}</p>
            </div>

            {/* Fees */}
            <p>
              {currency}
              {item.amount ?? 0}
            </p>

            {/* Action */}
            {item.cancelled ? (
              <p className="text-red-400 text-xs font-medium">Cancelled</p>
            ) : item.isCompleted ? (
              <p className="text-green-500 text-xs font-medium">Completed</p>
            ) : (
              <img
                onClick={() => cancelAppointment(item._id)}
                className="w-10 cursor-pointer"
                src={assets.cancel_icon}
                alt="cancel"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllApointments;
