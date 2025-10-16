import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const ExperienceForm = ({ onSave, initialData = null, onCancel, saving }) => {
  const [experience, setExperience] = useState(
    initialData || {
      company_name: '',
      job_title: '',
      employment_type: 'Full_Time',
      start_date: '',
      end_date: '',
      currently_working: false,
      location: '',
      description: '',
      key_achievements: '',
    }
  );

  const [errors, setErrors] = useState({});
  const [formCollapsed, setFormCollapsed] = useState(true);

  useEffect(() => {
    if (initialData) {
      setEducation(initialData);
      setFormCollapsed(false);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setExperience({
      ...experience,
      [name]: type === 'checkbox' ? checked : value,
    });

    if (errors[name]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: false }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!experience.company_name) newErrors.company_name = true;
    if (!experience.job_title) newErrors.job_title = true;
    if (!experience.start_date) newErrors.start_date = true;
    if (!experience.description || experience.description.length < 100) {
      newErrors.description = true;
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length === 0) {
      // Clean up the data before sending
      const cleanedExperience = {
        ...experience,
        end_date: experience.end_date || null,  // Convert empty string to null
        location: experience.location || null,
        key_achievements: experience.key_achievements || null,
      };
      
      onSave(cleanedExperience);
      if (!initialData) {
        setExperience({
          company_name: '',
          job_title: '',
          employment_type: 'Full_Time',
          start_date: '',
          end_date: '',
          currently_working: false,
          location: '',
          description: '',
          key_achievements: '',
        });
        setFormCollapsed(true);
      }
    } else {
      setErrors(newErrors);
    }
  };

  const getInputBorderClass = (fieldName) => {
    return errors[fieldName] ? 'border-red-500' : 'border-gray-500';
  };

  return (
    <div className="experience-section">
      <button
        onClick={() => setFormCollapsed(!formCollapsed)}
        type="button"
        className="mb-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
      >
        {formCollapsed ? 'Add New Experience' : 'Cancel'}
      </button>

      {!formCollapsed && (
        <form onSubmit={handleSubmit} className="bg-gray-800 flex flex-col gap-5 p-5 text-white rounded mb-4">
          <h3 className="text-xl font-bold">Add/Edit Experience</h3>

          <label className="block">
            Job Title*
            <input
              type="text"
              name="job_title"
              value={experience.job_title}
              onChange={handleChange}
              className={`w-full p-2 mt-1 bg-transparent border ${getInputBorderClass('job_title')} rounded`}
              placeholder="Eg: Software Developer"
              required
            />
          </label>

          <label className="block">
            Company Name*
            <input
              type="text"
              name="company_name"
              value={experience.company_name}
              onChange={handleChange}
              className={`w-full p-2 mt-1 bg-transparent border ${getInputBorderClass('company_name')} rounded`}
              placeholder="Eg: Google"
              required
            />
          </label>

          <label className="block">
            Employment Type*
            <select
              name="employment_type"
              value={experience.employment_type}
              onChange={handleChange}
              className="w-full p-2 mt-1 bg-gray-900 border border-gray-500 rounded"
              required
            >
              <option value="Full_Time">Full Time</option>
              <option value="Part_Time">Part Time</option>
              <option value="Internship">Internship</option>
              <option value="Freelance">Freelance</option>
              <option value="Contract">Contract</option>
            </select>
          </label>

          <div className="flex space-x-4">
            <label className="block flex-1">
              Start Date*
              <input
                type="date"
                name="start_date"
                value={experience.start_date}
                onChange={handleChange}
                className={`w-full p-2 mt-1 bg-transparent border ${getInputBorderClass('start_date')} rounded`}
                required
              />
            </label>
            <label className="block flex-1">
              End Date
              <input
                type="date"
                name="end_date"
                value={experience.end_date}
                onChange={handleChange}
                className="w-full p-2 mt-1 bg-transparent border border-gray-500 rounded"
                disabled={experience.currently_working}
              />
            </label>
          </div>

          <label className="flex items-center">
            <input
              type="checkbox"
              name="currently_working"
              checked={experience.currently_working}
              onChange={handleChange}
              className="mr-2"
              id="currently_working"
            />
            <span>Currently Working</span>
          </label>

          <label className="block">
            Location
            <input
              type="text"
              name="location"
              value={experience.location}
              onChange={handleChange}
              className="w-full p-2 mt-1 bg-transparent border border-gray-500 rounded"
              placeholder="Eg: San Francisco, CA"
            />
          </label>

          <label className="block">
            Job Description*
            <textarea
              name="description"
              value={experience.description}
              onChange={handleChange}
              className={`w-full p-2 mt-1 bg-transparent border ${getInputBorderClass('description')} rounded`}
              placeholder="Describe your role and responsibilities..."
              rows={4}
              required
            ></textarea>
            <p className="text-sm mt-1 text-gray-400">
              Description should be greater than 100 characters 
              {experience.description && ` (${experience.description.length}/100)`}
            </p>
          </label>

          <label className="block">
            Key Achievements
            <textarea
              name="key_achievements"
              value={experience.key_achievements}
              onChange={handleChange}
              className="w-full p-2 mt-1 bg-transparent border border-gray-500 rounded"
              placeholder="Your key achievements and accomplishments..."
              rows={3}
            ></textarea>
          </label>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className={`px-4 py-2 rounded text-white font-bold ${
                saving ? 'bg-gray-600 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {saving ? 'Saving...' : initialData ? 'Update' : 'Save'}
            </button>
            {initialData && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

const ExperienceCard = ({ experience, onEdit, onDelete, deleting }) => {
  return (
    <div className="bg-gray-900 text-white p-4 rounded flex justify-between items-center mb-4">
      <div className="flex-1">
        <h3 className="text-xl font-bold">{experience.job_title}</h3>
        <p className="text-lg">{experience.company_name}</p>
        <p className="text-sm text-purple-400">{experience.employment_type?.replace('_', ' ')}</p>
        {experience.location && (
          <p className="text-sm text-gray-400">{experience.location}</p>
        )}
        <p className="text-sm text-gray-300 mt-1">
          {new Date(experience.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} -{' '}
          {experience.currently_working
            ? 'Present'
            : experience.end_date
            ? new Date(experience.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
            : 'N/A'}
        </p>
        {experience.description && (
          <p className="text-sm text-gray-300 mt-2">{experience.description}</p>
        )}
        {experience.key_achievements && (
          <div className="mt-2">
            <p className="text-sm font-semibold text-gray-300">Key Achievements:</p>
            <p className="text-sm text-gray-400">{experience.key_achievements}</p>
          </div>
        )}
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => onEdit(experience)}
          className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-white"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(experience)}
          disabled={deleting}
          className={`px-4 py-2 rounded text-white ${
            deleting ? 'bg-gray-600 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {deleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  );
};

const ExperienceSection = ({ profileData, onUpdate }) => {
  const [experiences, setExperiences] = useState([]);
  const [editExperience, setEditExperience] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (profileData?.work_experience) {
      setExperiences(profileData.work_experience);
    }
  }, [profileData]);

  const handleSave = async (experience) => {
    setSaving(true);
    setMessage(null);
    try {
      if (editExperience) {
        // TODO: Add update API endpoint when available
        setMessage({ type: 'info', text: 'Update functionality coming soon. Please delete and re-add for now.' });
      } else {
        // Add new experience
        await api.post('/student/profile/experience', [experience]);
        setMessage({ type: 'success', text: 'Experience added successfully!' });
        if (onUpdate) onUpdate();
      }
      setEditExperience(null);
    } catch (error) {
      console.error('Error saving experience:', error);
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to save experience.' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleEdit = (experience) => {
    setEditExperience(experience);
  };

  const handleDelete = async (experience) => {
    if (!window.confirm('Are you sure you want to delete this experience entry?')) {
      return;
    }
    
    setDeleting(true);
    setMessage(null);
    try {
      // TODO: Add delete API endpoint when available
      setMessage({ type: 'info', text: 'Delete functionality coming soon.' });
    } catch (error) {
      console.error('Error deleting experience:', error);
      setMessage({ type: 'error', text: 'Failed to delete experience.' });
    } finally {
      setDeleting(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="p-6 bg-[#1f2937] text-white">
      <h2 className="text-2xl font-bold mb-4">Work Experience</h2>
      
      {message && (
        <div className={`p-4 mb-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-900/20 border border-green-500/50 text-green-400' :
          message.type === 'error' ? 'bg-red-900/20 border border-red-500/50 text-red-400' :
          'bg-blue-900/20 border border-blue-500/50 text-blue-400'
        }`}>
          {message.text}
        </div>
      )}
      
      <ExperienceForm 
        onSave={handleSave} 
        initialData={editExperience} 
        onCancel={() => setEditExperience(null)}
        saving={saving}
      />
      
      <div className="mt-6">
        {experiences.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No work experience added yet. Click "Add New Experience" to get started.</p>
        ) : (
          experiences.map((experience, index) => (
            <ExperienceCard
              key={experience.experience_id || index}
              experience={experience}
              onEdit={handleEdit}
              onDelete={handleDelete}
              deleting={deleting}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ExperienceSection;
