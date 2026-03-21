import React from "react";
import { assets } from "../assets/assets";

const About = () => {
  return (
    <div>
      <div className="text-center text-2xl pt-10 text-gray-500">
        <p>
          ABOUT <span className="text-gray-700 font-medium">US</span>
        </p>
      </div>

      <div className="my-10 flex flex-col md:flex-row gap-12">
        <img
          className="w-full md:max-w-[360px]"
          src={assets.about_image}
          alt=""
        />
        <div className="flex flex-col justify-center gap-6 md:w-2/4 text-sm text-gray-600">
          <p>
            Welcome To Prescripto, Your Trusted Partner In Managing Your
            Healthcare Needs Convenentl And Efficiently. At Prescripto, We
            Understand The Challenges Individuals Face When it Comes To
            Scheduling Doctor Appointments And Managing Their Health Records.
          </p>
          <p>
            Prescripto is Commited To Excellence In Healthcare Tecnology. We
            Continuously Strive To Enhance Our Platform,Integrating The Latest
            Advancements To Improve User Experience And Deliver Superior
            Service. Whether You're Booking Your First Appointment Or Managing
            Ongoing Care.Prescripto is Here To Support You Every Step Of The
            Way.
          </p>
          <b className="text-gray-800">Our Vision</b>
          <p>
            Our Vision At Prescripto is To Create A Seamiess healthCare
            Experience For Every User. We Aim To Bridge the Gap Between Patients
            And healthCare Providers, Making it Easier For You To Access The
            Care You Need, When You Need It.
          </p>
        </div>
      </div>

      <div className="text-xl my-4">
        <p>
          WHY <span className="text-gray-700 font-semibold">CHOOSE US</span>
        </p>
      </div>
      <div className="flex flex-col md:flex-row mb-20">
        <div className="border border-gray-300 px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-sm text-gray-600 hover:bg-[#5f6FFF] hover:text-white transition-colors duration-300 cursor-pointer">
          <b>Efficiency:</b>
          <p>
            Streamlined Appointment Scheduling That Fits Into Your Busy
            Lifestyle.
          </p>
        </div>
        <div className="border border-gray-300 px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-sm text-gray-600 hover:bg-[#5f6FFF] hover:text-white transition-colors duration-300 cursor-pointer">
          <b>Convenience:</b>
          <p>
            Access To A Network Of Trusted Healthcare Professionals In Your
            Area.
          </p>
        </div>
        <div className="border border-gray-300 px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-sm text-gray-600 hover:bg-[#5f6FFF] hover:text-white transition-colors duration-300 cursor-pointer">
          <b>Personalization:</b>
          <p>
            Tailored Recommendations And Reminders To Help You Stay On Top Of
            Your Health.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
