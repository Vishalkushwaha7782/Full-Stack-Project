import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext";
import { assets } from "../../assets/assets";

const Dashboard = () => {
  const { aToken, getDashData, cancelAppointment, dashData } =
    useContext(AdminContext);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!aToken) return;

      setLoading(true);
      try {
        await getDashData();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [aToken]);

  // 🔹 Loading state
  if (loading) {
    return <p className="m-5 text-gray-500">Loading dashboard...</p>;
  }

  // 🔹 No data state
  if (!dashData) {
    return <p className="m-5 text-gray-500">No dashboard data available</p>;
  }

  return (
    <div className="m-5">
      {/* Top Cards */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 hover:scale-105 transition-all">
          <img className="w-14" src={assets.doctor_icon} alt="doctors" />
          <div>
            <p className="text-xl font-semibold text-gray-600">
              {dashData?.doctors ?? 0}
            </p>
            <p className="text-gray-400">Doctors</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 hover:scale-105 transition-all">
          <img
            className="w-14"
            src={assets.appointments_icon}
            alt="appointments"
          />
          <div>
            <p className="text-xl font-semibold text-gray-600">
              {dashData?.appointments ?? 0}
            </p>
            <p className="text-gray-400">Appointments</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 hover:scale-105 transition-all">
          <img className="w-14" src={assets.patients_icon} alt="patients" />
          <div>
            <p className="text-xl font-semibold text-gray-600">
              {dashData?.patients ?? 0}
            </p>
            <p className="text-gray-400">Patients</p>
          </div>
        </div>
      </div>

      {/* Latest Bookings */}
      <div className="bg-white">
        <div className="flex items-center gap-2.5 px-4 py-4 mt-10 rounded-t border">
          <img src={assets.list_icon} alt="list" />
          <p className="font-semibold">Latest Bookings</p>
        </div>

        <div className="pt-4 border border-t-0">
          {dashData?.latestAppointments?.length === 0 && (
            <p className="text-center py-4 text-gray-400">
              No appointments found
            </p>
          )}

          {dashData?.latestAppointments?.map((item) => (
            <div
              className="flex items-center px-6 py-3 gap-3 hover:bg-gray-100"
              key={item._id}
            >
              {/* Doctor Image */}
              <img
                className="rounded-full w-10"
                src={item.doctorId?.image || "/default.png"}
                alt="doctor"
              />

              {/* Info */}
              <div className="flex-1 text-sm">
                <p className="text-gray-800 font-medium">
                  {item.doctorId?.name || "Unknown Doctor"}
                </p>
                <p className="text-gray-600">{item.slotDateTime || "-"}</p>
              </div>

              {/* Action */}
              {item.cancelled ? (
                <p className="text-red-400 text-xs font-medium">Cancelled</p>
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
    </div>
  );
};

export default Dashboard;
