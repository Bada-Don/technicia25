import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const ProfileCompletion = ({ extractedData, missingFields }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    date_of_birth: '',
    gender: '',
    bio: '',
    current_education_level: '',
    career_goals: '',
    linkedin_profile: '',
    github_profile: '',
    portfolio_url: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      zipcode: ''
    },
    preferred_industries: []
  });
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (extractedData && extractedData.personal_info) {
      const personalInfo = extractedData.personal_info;
      setFormData(prev => ({
        ...prev,
        first_name: personalInfo.first_name || '',
        last_name: personalInfo.last_name || '',
        phone_number: personalInfo.phone_number || '',
        date_of_birth: personalInfo.date_of_birth || '',
        gender: personalInfo.gender || '',
        bio: extractedData.bio || '',
        current_education_level: extractedData.current_education_level || '',
        career_goals: extractedData.career_goals || '',
        linkedin_profile: personalInfo.linkedin_profile || '',
        github_profile: personalInfo.github_profile || '',
        portfolio_url: personalInfo.portfolio_url || '',
        address: personalInfo.address || prev.address,
        preferred_industries: extractedData.preferred_industries || []
      }));
    }
  }, [extractedData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleIndustryChange = (e) => {
    const value = e.target.value;
    const industries = value.split(',').map(i => i.trim()).filter(i => i);
    setFormData(prev => ({
      ...prev,
      preferred_industries: industries
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Update basic profile
      await api.put('/student/profile', formData);

      // Add education history if extracted
      if (extractedData && extractedData.education_history && extractedData.education_history.length > 0) {
        try {
          await api.post('/student/profile/education', extractedData.education_history);
        } catch (eduError) {
          console.error('Education history error:', eduError);
          // Don't fail the entire submission, just log the error
          setError('Profile saved, but there was an issue with education history. You can update it later from your profile.');
        }
      }

      // Add work experience if extracted
      if (extractedData && extractedData.work_experience && extractedData.work_experience.length > 0) {
        try {
          await api.post('/student/profile/experience', extractedData.work_experience);
        } catch (expError) {
          console.error('Work experience error:', expError);
          // Don't fail the entire submission, just log the error
          setError(prevError => prevError || 'Profile saved, but there was an issue with work experience. You can update it later from your profile.');
        }
      }

      // Show success message
      setSuccess(true);
      
      // Navigate to profile page after a short delay
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (err) {
      console.error('Save error:', err);
      setError(err.response?.data?.detail || 'Failed to save profile. Please try again.');
      setSaving(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-white mb-4">Personal Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            First Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleInputChange}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Last Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleInputChange}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleInputChange}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Date of Birth
          </label>
          <input
            type="date"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handleInputChange}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Gender
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Bio / Professional Summary
        </label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleInputChange}
          rows={4}
          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
          placeholder="Tell us about yourself..."
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-white mb-4">Education & Career</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Current Education Level
        </label>
        <select
          name="current_education_level"
          value={formData.current_education_level}
          onChange={handleInputChange}
          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
        >
          <option value="">Select education level</option>
          <option value="High_School">High School</option>
          <option value="Undergraduate">Undergraduate</option>
          <option value="Graduate">Graduate</option>
          <option value="PhD">PhD</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Career Goals
        </label>
        <textarea
          name="career_goals"
          value={formData.career_goals}
          onChange={handleInputChange}
          rows={4}
          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
          placeholder="What are your career aspirations?"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Preferred Industries (comma-separated)
        </label>
        <input
          type="text"
          value={formData.preferred_industries.join(', ')}
          onChange={handleIndustryChange}
          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
          placeholder="e.g., Technology, Finance, Healthcare"
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-white mb-4">Links & Contact</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            LinkedIn Profile
          </label>
          <input
            type="url"
            name="linkedin_profile"
            value={formData.linkedin_profile}
            onChange={handleInputChange}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
            placeholder="https://linkedin.com/in/yourprofile"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            GitHub Profile
          </label>
          <input
            type="url"
            name="github_profile"
            value={formData.github_profile}
            onChange={handleInputChange}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
            placeholder="https://github.com/yourusername"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Portfolio URL
          </label>
          <input
            type="url"
            name="portfolio_url"
            value={formData.portfolio_url}
            onChange={handleInputChange}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
            placeholder="https://yourportfolio.com"
          />
        </div>
      </div>

      <div className="border-t border-gray-700 pt-6">
        <h3 className="text-lg font-medium text-white mb-4">Address (Optional)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-1">Street</label>
            <input
              type="text"
              name="address.street"
              value={formData.address.street}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">City</label>
            <input
              type="text"
              name="address.city"
              value={formData.address.city}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">State</label>
            <input
              type="text"
              name="address.state"
              value={formData.address.state}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Country</label>
            <input
              type="text"
              name="address.country"
              value={formData.address.country}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Zipcode</label>
            <input
              type="text"
              name="address.zipcode"
              value={formData.address.zipcode}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-[#1a1a1a] rounded-2xl shadow-xl p-8 border border-gray-800">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      currentStep >= step
                        ? 'bg-[#833fd4] text-white'
                        : 'bg-gray-800 text-gray-500'
                    }`}
                  >
                    {step}
                  </div>
                  {step < 3 && (
                    <div
                      className={`w-24 h-1 mx-2 ${
                        currentStep > step ? 'bg-[#833fd4]' : 'bg-gray-800'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm text-gray-400">
              <span>Personal Info</span>
              <span>Education & Career</span>
              <span>Links & Contact</span>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}

            {error && (
              <div className="mt-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {success && (
              <div className="mt-6 p-4 bg-green-900/20 border border-green-500/50 rounded-lg">
                <p className="text-sm text-green-400">✓ Profile saved successfully! Redirecting to your profile...</p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-6 py-3 border-2 border-gray-700 text-gray-300 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  Previous
                </button>
              ) : (
                <div />
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="px-6 py-3 bg-[#833fd4] text-white rounded-lg font-medium hover:bg-[#632aa0] transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={saving}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    saving
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {saving ? 'Saving...' : 'Complete Profile'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletion;
