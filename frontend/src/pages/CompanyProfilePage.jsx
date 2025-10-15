import Header from "../components/Header.jsx";
import SecondaryNavBar from "../components/profile page/secNavBar.jsx"; // Keeping NavBar for consistency, can remove if not needed

function CompanyProfilePage() {
  return (
    <>
      <Header />
      <SecondaryNavBar activeTab="profile" setActiveTab={() => {}} />{" "}
      {/*  Keeping NavBar, adjust activeTab prop as needed */}
      <section className="flex flex-col w-full min-h-screen -my-24 text-white p-10">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Company Profile Dashboard</h2>

          <div className="bg-[#1a1a24] p-6 rounded-lg shadow-lg border border-gray-700">
            <h3 className="text-2xl font-semibold mb-4">
              Welcome, [Your Company Name]!
            </h3>{" "}
            {/* Replace with dynamic company name later */}
            <p className="text-gray-400 mb-6">
              This is your company profile dashboard. You can manage your
              company information, job postings, and more from here.
            </p>
            <div className="mb-4">
              <h4 className="text-lg font-semibold mb-2">
                Company Information
              </h4>
              <p className="text-gray-300">
                **Name:** [Company Name Placeholder]
                <br />
                **Email:** [Company Email Placeholder]
                <br />
                **Location:** [Company Location Placeholder]
                <br />
                {/* Add more company info placeholders as needed */}
              </p>
            </div>
            <div className="mb-4">
              <h4 className="text-lg font-semibold mb-2">Job Postings</h4>
              <p className="text-gray-300">
                [Placeholder for Job Postings List or Summary. You can add job
                posting components here later]
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-2">Account Settings</h4>
              <p className="text-gray-300">
                [Placeholder for Account Settings Links or Options. You can add
                links to edit profile, change password, etc. here later]
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default CompanyProfilePage;
