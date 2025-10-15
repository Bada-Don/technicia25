import Header from "../../components/Header";
import CompanySignupFormSection from "../../components/company/CompanySignupFormSection";
const CompanySignupPage = () => {
  return (
    <div className="-scroll-m-10 w-screen absolute  overflow-x-hidden h-screen bg-[radial-gradient(circle_at_bottom_right,_#000000_0%,_rgba(74,26,125,0.6)_30%,_#000000_70%)]">
      <Header />
      <CompanySignupFormSection />
    </div>
  );
};

export default CompanySignupPage;
