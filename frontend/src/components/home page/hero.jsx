// import purpleCircle from "/PurpleCircle.svg";
import { LayoutTextFlip } from "./LayoutText";
import video from "/video.mp4";
import { Link } from "react-router-dom";
function Hero() {
  return (
    <div className="mx-50px overflow-x-hidden flex flex-col items-center gap-10 pt-20">
      <div className="w-screen absolute -z-10 top-0 overflow-hidden h-screen bg-[radial-gradient(circle_at_top,_#000000_0%,_rgba(74,26,125,0.6)_30%,_#000000_70%)]">
        {/* <img className='max-sm:scale-[5]' src={purpleCircle} alt="" /> */}
      </div>
      <LayoutTextFlip />
      <p className="max-xl:w-[90%] max-sm:text-left text-[1.25rem]">
        Nayi Disha is your 1-stop solution to hire dream developers for
        full-time or contract roles
      </p>
      <div className="flex justify-center items-center gap-10">
        <Link to="/signup">
          <button className="max-xl:hidden w-fit px-[1.5rem] py-[.2rem] rounded-xl bg-[#7c35c7] hover:bg-[#4d217b] text-white hover:text-[#3f3f46] text-xl shadow-md">
            <p className="text-lg drop-shadow-md">Hire</p>
          </button>
        </Link>
        <Link to="/jobs">
          <button className=" max-xl:block px-[1.5rem] py-[.25rem] rounded-xl border-[1px] border-slate-500 hover:bg-[#29282a] hover:border-white">
            Find Jobs
          </button>
        </Link>
      </div>
      <div className="mx-auto max-w-4xl pt-5 md:pt-15">
        <video
          muted
          loop
          playsInline
          autoPlay
          src={video}
          className="w-full rounded-[10px]"
        ></video>
      </div>
      <ul className="flex justify-center w-full flex-row max-sm:flex-col max-sm:items-start max-sm:p-10">
        <li>
          <div className="flex flex-col">
            <h2 className="max-sm:text-[1.5rem]">$6 Million</h2>
            <p className="max-sm:text-[.9rem]">Talent Payments</p>
          </div>
        </li>
        <div className="my-5 h-[1px] w-full bg-white opacity-20 md:mx-8 md:h-10 md:w-[1px] lg:mx-10"></div>
        <li>
          <div className="flex flex-col">
            <h2 className="max-sm:text-[1.5rem]">100,000+</h2>
            <p className="max-sm:text-[.9rem]">Engineers Vetted</p>
          </div>
        </li>
        <div className="my-5 h-[1px] w-full bg-white opacity-20 md:mx-8 md:h-10 md:w-[1px] lg:mx-10"></div>
        <li>
          <div className="flex flex-col">
            <h2 className="max-sm:text-[1.5rem]">72 Hrs</h2>
            <p className="max-sm:text-[.9rem]">Average time to hire</p>
          </div>
        </li>
      </ul>
    </div>
  );
}

export default Hero;
