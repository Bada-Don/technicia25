import React from 'react';
import Select from 'react-select';

const SkillSelector = ({ onChange }) => { // 1. Accept onChange prop
  const skillsOptions = [
    { value: "NodeJS", label: "NodeJS" },
    { value: "ReactJS", label: "ReactJS" },
    { value: "Angular", label: "Angular" },
    { value: "MongoDB", label: "MongoDB" },
    { value: "MySQL", label: "MySQL" },
    { value: "Python", label: "Python" },
    { value: "Java", label: "Java" },
    { value: "C++", label: "C++" },
    { value: "Ruby", label: "Ruby" },
    { value: "AWS", label: "AWS" },
  ];

  const handleSelectChange = (selectedOptions) => { // 2. Handler for react-select onChange
    console.log("SkillSelector - Selected Options:", selectedOptions); // Log selected options in SkillSelector
    if (onChange) {
      onChange(selectedOptions); // 3. Call onChange prop, passing selected options
    }
  };

  return (
    <div>
      <label className="block text-gray-400 font-light">My Technical Skills*</label>
      <Select
        isMulti
        options={skillsOptions}
        className="basic-multi-select"
        classNamePrefix="select"
        onChange={handleSelectChange} // Attach the handler to react-select's onChange
        styles={{
            control: (base) => ({
              ...base,
              backgroundColor: '#1a1a24',
              borderColor: '#4a5568',
            }),
            menu: (base) => ({
              ...base,
              backgroundColor: '#1a1a24',
            }),
            option: (base, state) => ({
              ...base,
              backgroundColor: state.isFocused ? '#2d3748' : '#1a1a24',
              color: 'white',
              ':active': {
                backgroundColor: '#4a5568',
              },
            }),
            multiValue: (base) => ({
              ...base,
              backgroundColor: '#2d3748',
              borderRadius: '20px',
              color: 'white',
            }),
            multiValueLabel: (base) => ({
              ...base,
              color: 'white',
            }),
            multiValueRemove: (base) => ({
              ...base,
              color: 'white',
              ':hover': {
                backgroundColor: '#4a5568',
                color: 'white',
              },
            }),
          }}
      />
    </div>
  );
};

export default SkillSelector;