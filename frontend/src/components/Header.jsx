import React from "react";
import { assets } from "../assets/assets";

const Header = () => {
  return (
    <div className="flex flex-col md:flex-row flex-wrap bg-[#5f6FFF] rounded-lg px-6 md:px-10 lg:px-20">
      {/* -------left side-------- */}
      <div className="md:w-1/2 flex flex-col items-start justify-center gap-4 py-10 m-auto md:py-[10vw] md:mb[-30px]">
        <p>
          Book Appointment <br /> With Trusted Doctors
        </p>
        <div>
          <img src={assets.group_profiles} alt=""></img>
          <p>
            Simply browse through our extensive list of trusted doctors,
            <br />
            schedule your appointment hassle-free
          </p>
        </div>
        <a href="">
          Book appiontment <img src={assets.arrow_icon} />
        </a>
      </div>
      {/* -------Right Side------ */}
      <div>
        <img src={assets.header_img}></img>
      </div>
    </div>
  );
};

export default Header;
