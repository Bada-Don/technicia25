import React from 'react';
import Header from '../components/Header';
import ResumeScorer from '../components/resume-scorer/ResumeScorer';

const ResumeScorerTestPage = () => { 
  return (
    <>
      <Header />
      <div className="container mx-auto mt-10">
        <ResumeScorer /> 
      </div>
    </>
  );
};

export default ResumeScorerTestPage; // Renamed export