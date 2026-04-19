import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const MyAppointments = () => {
  const { backendUrl, token } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);

  const navigate = useNavigate();

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

  const cancelAppointment = async (appointmentId) => {
    try {
      if (!window.confirm("Are you sure you want to cancel?")) return;

      const { data } = await axios.post(
        backendUrl + "/api/user/cancel-appointment",
        { appointmentId },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (data.success) {
        toast.success(data.message);

        // instant UI update
        setAppointments((prev) =>
          prev.map((item) =>
            item._id === appointmentId ? { ...item, cancelled: true } : item,
          ),
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const initPay = (order) => {
    console.log("KEY:", import.meta.env.VITE_RAZORPAY_KEY_ID);

    if (!order || !order.id) {
      toast.error("Invalid order data");
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "Appointment Payment",
      description: "Appointment Payment",
      order_id: order.id,

      handler: async (response) => {
        try {
          const { data } = await axios.post(
            backendUrl + "/api/user/verifyRazorpay",
            response,
            { headers: { Authorization: `Bearer ${token}` } },
          );

          if (data.success) {
            toast.success("Payment successful");
            getUserAppointments();
            navigate("/my-appointments");
          } else {
            toast.error(data.message || "Verification failed");
          }
        } catch (error) {
          console.error(error);
          toast.error("Something went wrong");
        }
      },

      prefill: {
        name: "User",
        email: "user@email.com",
      },

      theme: {
        color: "#3399cc",
      },
    };

    const rzp = new window.Razorpay(options);

    rzp.on("payment.failed", function (response) {
      console.log("FULL RESPONSE:", response);

      console.log("CODE:", response.error.code);
      console.log("DESCRIPTION:", response.error.description);
      console.log("REASON:", response.error.reason);
      console.log("STEP:", response.error.step);
      console.log("SOURCE:", response.error.source);

      toast.error(response.error.description || "Payment failed");
    });

    rzp.open();
  };

  const appointmentRazorpay = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/payment-razorpay",
        { appointmentId },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (data.success) {
        initPay(data.order);
      }
    } catch (error) {}
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
                  {item.cancelled === false && item.payment === true && (
                    <button className="sm:min-w-48 py-2 border rounded text-stone-500 bg-indigo-50">
                      Paid
                    </button>
                  )}
                  {!item.cancelled && !item.payment && (
                    <button
                      onClick={() => appointmentRazorpay(item._id)}
                      className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-[#5f6FFF] hover:text-white transition-all duration-300 cursor-pointer"
                    >
                      Pay Online
                    </button>
                  )}

                  {!item.cancelled && (
                    <button
                      onClick={() => cancelAppointment(item._id)}
                      className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300 cursor-pointer"
                    >
                      Cancel appointment
                    </button>
                  )}
                  {item.cancelled && (
                    <button className="sm:min-w-48 py-2 border border-red-500 rounded text-red-500">
                      Appointment Cancelled
                    </button>
                  )}
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
