import React from 'react';

const CompanyLeftSection = () => {
  return (
    <div className="flex-1 p-5 flex flex-col justify-center bg-transparent space-y-8 md:space-y-10">
      {/* Adjust the heading size based on screen size */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-snug md:leading-relaxed text-center md:text-left">
        Find the <span className="text-purple-500">best engineering minds</span>
        <br />
        to bring your product vision to life.
      </h1>

      {/* Container for the features (Company focused features) */}
      <div className="space-y-6 sm:space-y-8">
        {/* Feature 1 */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <span className="text-2xl sm:text-3xl"></span> {/* Chart icon */}
          <span className="text-lg sm:text-xl md:text-2xl font-light">Access to Vetted Talent</span>
        </div>

        {/* Feature 2 */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <span className="text-2xl sm:text-3xl">⏰</span> {/* Timer icon */}
          <span className="text-lg sm:text-xl md:text-2xl font-light">Efficient Hiring Process</span>
        </div>

        {/* Feature 3 */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <span className="text-2xl sm:text-3xl"></span> {/* Flexed biceps icon */}
          <span className="text-lg sm:text-xl md:text-2xl font-light">Build High-Performing Teams</span>
        </div>
      </div>
    </div>
  );
};

export default CompanyLeftSection;