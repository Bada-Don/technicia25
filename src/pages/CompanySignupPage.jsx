import React from 'react';
import Header from '../components/Header';
import CompanySignupFormSection from '../components/company/CompanySignupFormSection';
const CompanySignupPage = () => {
  return (
    <div className='-scroll-m-10'>
      <Header />
      <CompanySignupFormSection />
    </div >
  );
};

export default CompanySignupPage;