import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const EducationForm = ({ onSave, initialData = null, onCancel, saving }) => {
  const [education, setEducation] = useState(
    initialData || {
      institution_name: '',
      degree_qualification: '',
      field_of_study: '',
      gpa_percentage: '',
      start_date: '',
      end_date: '',
      currently_enrolled: false,
      achievements: '',
      location: '',
    }
  );

  const [formErrors, setFormErrors] = useState({});
  const [formCollapsed, setFormCollapsed] = useState(true);

  useEffect(() => {
    if (initialData) {
      setEducation(initialData);
      setFormCollapsed(false);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEducation({
      ...education,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const validateForm = () => {
    const errors = {};
    if (!education.institution_name) errors.institution_name = 'This field is mandatory';
    if (!education.degree_qualification) errors.degree_qualification = 'This field is mandatory';
    if (!education.start_date) errors.start_date = 'This field is mandatory';
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length === 0) {
      onSave(education);
      if (!initialData) {
        setEducation({
          institution_name: '',
          degree_qualification: '',
          field_of_study: '',
          gpa_percentage: '',
          start_date: '',
          end_date: '',
          currently_enrolled: false,
          achievements: '',
          location: '',
        });
        setFormCollapsed(true);
      }
    } else {
      setFormErrors(errors);
    }
  };

  return (
    <div className="education-section">
      <button
        onClick={() => setFormCollapsed(!formCollapsed)}
        className="mb-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
        type="button"
      >
        {formCollapsed ? 'Add New Education' : 'Cancel'}
      </button>

      {!formCollapsed && (
        <form onSubmit={handleSubmit} className="p-6 bg-gray-800 text-white rounded mb-4">
          <div className="flex space-x-4 mb-4">
            <label className="block w-full">
              Institution Name*
              <input
                type="text"
                name="institution_name"
                value={education.institution_name}
                onChange={handleChange}
                className={`w-full p-2 mt-1 bg-transparent border rounded ${
                  formErrors.institution_name ? 'border-red-500' : 'border-gray-500'
                }`}
                placeholder="Eg: BITS Pilani"
                required
              />
              {formErrors.institution_name && (
                <p className="text-red-500 text-sm mt-1">{formErrors.institution_name}</p>
              )}
            </label>

            <label className="block w-full">
              Degree*
              <input
                type="text"
                name="degree_qualification"
                value={education.degree_qualification}
                onChange={handleChange}
                className={`w-full p-2 mt-1 bg-transparent border rounded ${
                  formErrors.degree_qualification ? 'border-red-500' : 'border-gray-500'
                }`}
                placeholder="Eg: Bachelor of Technology"
                required
              />
              {formErrors.degree_qualification && (
                <p className="text-red-500 text-sm mt-1">{formErrors.degree_qualification}</p>
              )}
            </label>
          </div>

          <div className="flex space-x-4 mb-4">
            <label className="block w-full">
              Field of Study
              <input
                type="text"
                name="field_of_study"
                value={education.field_of_study}
                onChange={handleChange}
                className="w-full p-2 mt-1 bg-transparent border border-gray-500 rounded"
                placeholder="Eg: Computer Science"
              />
            </label>

            <label className="block w-full">
              GPA / Percentage
              <input
                type="text"
                name="gpa_percentage"
                value={education.gpa_percentage}
                onChange={handleChange}
                className="w-full p-2 mt-1 bg-transparent border border-gray-500 rounded"
                placeholder="Eg: 8.5 or 85%"
              />
            </label>
          </div>

          <div className="flex space-x-4 mb-4">
            <label className="block w-full">
              Start Date*
              <input
                type="date"
                name="start_date"
                value={education.start_date}
                onChange={handleChange}
                className={`w-full p-2 mt-1 bg-transparent border rounded ${
                  formErrors.start_date ? 'border-red-500' : 'border-gray-500'
                }`}
                required
              />
              {formErrors.start_date && (
                <p className="text-red-500 text-sm mt-1">{formErrors.start_date}</p>
              )}
            </label>

            <label className="block w-full">
              End Date
              <input
                type="date"
                name="end_date"
                value={education.end_date}
                onChange={handleChange}
                className="w-full p-2 mt-1 bg-transparent border border-gray-500 rounded"
                disabled={education.currently_enrolled}
              />
            </label>
          </div>

          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              name="currently_enrolled"
              checked={education.currently_enrolled}
              onChange={handleChange}
              className="mr-2"
              id="currently_enrolled"
            />
            <label htmlFor="currently_enrolled">Currently Enrolled</label>
          </div>

          <label className="block mb-4">
            Location
            <input
              type="text"
              name="location"
              value={education.location}
              onChange={handleChange}
              className="w-full p-2 mt-1 bg-transparent border border-gray-500 rounded"
              placeholder="Eg: New Delhi, India"
            />
          </label>

          <label className="block mb-4">
            Achievements / Description
            <textarea
              name="achievements"
              value={education.achievements}
              onChange={handleChange}
              className="w-full p-2 mt-1 bg-transparent border border-gray-500 rounded"
              placeholder="Your achievements and activities..."
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

const EducationCard = ({ education, onEdit, onDelete, deleting }) => {
  return (
    <div className="bg-gray-900 text-white p-4 rounded flex justify-between items-center mb-4">
      <div className="flex-1">
        <h3 className="text-xl font-bold">{education.degree_qualification}</h3>
        <p className="text-lg">{education.institution_name}</p>
        {education.field_of_study && (
          <p className="text-sm text-gray-400">{education.field_of_study}</p>
        )}
        {education.location && (
          <p className="text-sm text-gray-400">{education.location}</p>
        )}
        <p className="text-sm text-gray-300 mt-1">
          {new Date(education.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} -{' '}
          {education.currently_enrolled
            ? 'Present'
            : education.end_date 
            ? new Date(education.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
            : 'N/A'}
        </p>
        {education.gpa_percentage && (
          <p className="text-sm text-purple-400 mt-1">GPA: {education.gpa_percentage}</p>
        )}
        {education.achievements && (
          <p className="text-sm text-gray-300 mt-2">{education.achievements}</p>
        )}
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => onEdit(education)}
          className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-white"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(education)}
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

const EducationSection = ({ profileData, onUpdate }) => {
  const [educations, setEducations] = useState([]);
  const [editEducation, setEditEducation] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (profileData?.education_history) {
      setEducations(profileData.education_history);
    }
  }, [profileData]);

  const handleSave = async (education) => {
    setSaving(true);
    setMessage(null);
    try {
      if (editEducation) {
        // TODO: Add update API endpoint when available
        setMessage({ type: 'info', text: 'Update functionality coming soon. Please delete and re-add for now.' });
      } else {
        // Add new education
        await api.post('/student/profile/education', [education]);
        setMessage({ type: 'success', text: 'Education added successfully!' });
        if (onUpdate) onUpdate();
      }
      setEditEducation(null);
    } catch (error) {
      console.error('Error saving education:', error);
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to save education.' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleEdit = (education) => {
    setEditEducation(education);
  };

  const handleDelete = async (education) => {
    if (!window.confirm('Are you sure you want to delete this education entry?')) {
      return;
    }
    
    setDeleting(true);
    setMessage(null);
    try {
      // TODO: Add delete API endpoint when available
      setMessage({ type: 'info', text: 'Delete functionality coming soon.' });
    } catch (error) {
      console.error('Error deleting education:', error);
      setMessage({ type: 'error', text: 'Failed to delete education.' });
    } finally {
      setDeleting(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="p-6 bg-[#1f2937] text-white">
      <h2 className="text-2xl font-bold mb-4">Education</h2>
      
      {message && (
        <div className={`p-4 mb-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-900/20 border border-green-500/50 text-green-400' :
          message.type === 'error' ? 'bg-red-900/20 border border-red-500/50 text-red-400' :
          'bg-blue-900/20 border border-blue-500/50 text-blue-400'
        }`}>
          {message.text}
        </div>
      )}
      
      <EducationForm 
        onSave={handleSave} 
        initialData={editEducation} 
        onCancel={() => setEditEducation(null)}
        saving={saving}
      />
      
      <div className="mt-6">
        {educations.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No education history added yet. Click "Add New Education" to get started.</p>
        ) : (
          educations.map((education, index) => (
            <EducationCard
              key={education.education_id || index}
              education={education}
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

export default EducationSection;
