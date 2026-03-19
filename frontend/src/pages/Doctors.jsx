import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const Doctors = () => {
  const { speciality } = useParams();
  const navigate = useNavigate();

  const { doctors } = useContext(AppContext);
  const [filterDoc, setFilterDoc] = useState([]);

  useEffect(() => {
    if (!doctors) return;

    const filtered = speciality
      ? doctors.filter((doc) => doc.speciality === speciality)
      : doctors;

    setFilterDoc(filtered);
  }, [doctors, speciality]);

  const categories = [
    "General physician",
    "Gynecologist",
    "Dermatologist",
    "Pediatricians",
    "Neurologist",
    "Gastroenterologist",
  ];

  return (
    <div>
      <p className="text-gray-600">Browse through the doctors specialist.</p>

      <div className="flex flex-col sm:flex-row items-start gap-5 my-5">
        <div className="flex flex-col gap-4 text-sm text-gray-600">
          {categories.map((cat) => (
            <p
              key={cat}
              onClick={() => navigate(`/doctors/${cat}`)}
              className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border rounded cursor-pointer transition-all
                ${
                  speciality === cat
                    ? "bg-blue-100 border-blue-500 text-blue-700"
                    : "border-gray-300"
                }`}
            >
              {cat}
            </p>
          ))}
        </div>

        <div className="w-full">
          {!doctors ? (
            <p className="text-center mt-10">Loading...</p>
          ) : filterDoc.length === 0 ? (
            <p className="text-center mt-10">No doctors found</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6">
              {filterDoc.map((item) => (
                <div
                  key={item._id}
                  onClick={() => navigate(`/appointments/${item._id}`)}
                  className="border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:-translate-y-2 transition-transform duration-300"
                >
                  <img
                    className="bg-blue-50 w-full h-48 object-cover"
                    src={item.image}
                    alt={item.name}
                    onError={(e) => {
                      e.target.src = "/fallback.png";
                    }}
                  />

                  <div className="p-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          item.available !== false
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      ></span>

                      <p
                        className={
                          item.available !== false
                            ? "text-green-500"
                            : "text-red-500"
                        }
                      >
                        {item.available !== false
                          ? "Available"
                          : "Not Available"}
                      </p>
                    </div>

                    <p className="text-gray-900 text-lg font-medium">
                      {item.name}
                    </p>
                    <p className="text-gray-600 text-sm">{item.speciality}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Doctors;
