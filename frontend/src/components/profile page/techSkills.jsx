import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import api from "../../services/api";

// Verification Confirmation Modal
const VerifySkillModal = ({ isOpen, onClose, onConfirm, skillName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-white mb-4">Verify Skill</h2>
        <p className="text-gray-300 mb-6">
          You are about to attempt a verification test for <span className="font-semibold text-purple-400">{skillName}</span>.
        </p>
        <p className="text-gray-400 text-sm mb-6">
          This test will be web-proctored and will take approximately 30-45 minutes. 
          Make sure you're in a quiet environment with good internet connection.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Start Test
          </button>
        </div>
      </div>
    </div>
  );
};

const SkillsTable = ({ profileData, onUpdate }) => {
  const [availableSkills, setAvailableSkills] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [selectedSkillForVerify, setSelectedSkillForVerify] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchSkills();
  }, [profileData]);

  const fetchSkills = async () => {
    setLoading(true);
    try {
      // Fetch available skills from skills_master
      const skillsResponse = await api.get('/skills/list');
      setAvailableSkills(skillsResponse.data || []);

      // Fetch user's claimed skills
      const userSkillsResponse = await api.get('/skills/student/skills');
      setUserSkills(userSkillsResponse.data || []);
    } catch (error) {
      console.error('Error fetching skills:', error);
      // Set some default skills if API fails
      setAvailableSkills([
        { skill_id: '1', skill_name: 'JavaScript' },
        { skill_id: '2', skill_name: 'Python' },
        { skill_id: '3', skill_name: 'React' },
        { skill_id: '4', skill_name: 'Node.js' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSkillChange = (index, skillId) => {
    const newUserSkills = [...userSkills];
    const selectedSkill = availableSkills.find(s => s.skill_id === skillId);
    
    newUserSkills[index] = {
      ...newUserSkills[index],
      skill_id: skillId,
      skill_name: selectedSkill?.skill_name || '',
    };
    setUserSkills(newUserSkills);
  };

  const handleProficiencyChange = (index, proficiency) => {
    const newUserSkills = [...userSkills];
    newUserSkills[index] = {
      ...newUserSkills[index],
      proficiency_level: proficiency,
    };
    setUserSkills(newUserSkills);
  };

  const handleYearsChange = (index, years) => {
    const newUserSkills = [...userSkills];
    newUserSkills[index] = {
      ...newUserSkills[index],
      years_of_experience: years ? parseFloat(years) : null,
    };
    setUserSkills(newUserSkills);
  };

  const addSkill = () => {
    setUserSkills([
      ...userSkills,
      {
        skill_id: '',
        skill_name: '',
        proficiency_level: 'Intermediate',
        years_of_experience: null,
        verification_status: 'Unverified',
      },
    ]);
  };

  const removeSkill = async (index) => {
    const skill = userSkills[index];
    
    // If skill has user_skill_id, it exists in DB and needs to be deleted via API
    if (skill.user_skill_id) {
      if (!window.confirm(`Are you sure you want to remove ${skill.skill_name}?`)) {
        return;
      }
      
      try {
        await api.delete(`/skills/student/skills/${skill.user_skill_id}`);
        setMessage({ type: 'success', text: 'Skill removed successfully!' });
        if (onUpdate) onUpdate();
      } catch (error) {
        console.error('Error deleting skill:', error);
        setMessage({ type: 'error', text: 'Failed to remove skill.' });
      }
    }
    
    // Remove from local state
    const newUserSkills = userSkills.filter((_, i) => i !== index);
    setUserSkills(newUserSkills);
    
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSaveSkills = async () => {
    setSaving(true);
    setMessage(null);

    try {
      // Filter out incomplete skills
      const validSkills = userSkills.filter(
        skill => skill.skill_id && skill.proficiency_level
      );

      if (validSkills.length === 0) {
        setMessage({ type: 'error', text: 'Please add at least one skill before saving.' });
        setSaving(false);
        return;
      }

      // Prepare data for API
      const skillsToSave = validSkills.map(skill => ({
        skill_id: skill.skill_id,
        proficiency_level: skill.proficiency_level,
        years_of_experience: skill.years_of_experience || null,
      }));

      await api.post('/skills/student/skills', skillsToSave);
      setMessage({ type: 'success', text: 'Skills saved successfully!' });
      
      // Refresh skills data
      fetchSkills();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error saving skills:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || 'Failed to save skills. Please try again.',
      });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleVerifySkill = (skill) => {
    setSelectedSkillForVerify(skill);
    setVerifyModalOpen(true);
  };

  const handleConfirmVerify = () => {
    setVerifyModalOpen(false);
    // Navigate to test page with skill info
    navigate('/test/skill-verification', {
      state: {
        skill: selectedSkillForVerify,
        isProctored: true,
      },
    });
  };

  const getVerificationBadge = (status) => {
    switch (status) {
      case 'Verified':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-green-900/30 text-green-400 border border-green-500/50">
            ✓ Verified
          </span>
        );
      case 'Failed':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-red-900/30 text-red-400 border border-red-500/50">
            ✗ Failed
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-gray-700 text-gray-400">
            Unverified
          </span>
        );
    }
  };

  if (loading) {
    return (
      <section className="bg-[#1f2937] flex flex-col gap-5 p-5">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          <span className="ml-3 text-gray-400">Loading skills...</span>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#1f2937] flex flex-col gap-5 p-5">
      <h3 className="text-2xl font-bold text-white">Technical Skills</h3>
      <hr className="border-gray-700" />

      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-900/20 border border-green-500/50 text-green-400'
              : 'bg-red-900/20 border border-red-500/50 text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="skills-table overflow-x-auto">
        <table className="w-full text-left text-white bg-transparent">
          <thead>
            <tr className="border-b border-gray-500">
              <th className="p-2">Skill</th>
              <th className="p-2">Proficiency Level</th>
              <th className="p-2">Years of Experience</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {userSkills.map((skill, index) => (
              <tr key={index} className="border-b border-gray-500">
                <td className="p-2">
                  <select
                    value={skill.skill_id || ''}
                    onChange={(e) => handleSkillChange(index, e.target.value)}
                    className="p-2 bg-gray-800 border border-gray-500 text-white outline-none rounded w-full"
                    disabled={skill.user_skill_id} // Don't allow changing saved skills
                  >
                    <option value="" disabled>
                      Select a skill
                    </option>
                    {availableSkills.map((s) => (
                      <option key={s.skill_id} value={s.skill_id}>
                        {s.skill_name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-2">
                  <select
                    value={skill.proficiency_level || 'Intermediate'}
                    onChange={(e) => handleProficiencyChange(index, e.target.value)}
                    className="p-2 bg-transparent border border-gray-500 text-white outline-none rounded"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="50"
                    value={skill.years_of_experience || ''}
                    onChange={(e) => handleYearsChange(index, e.target.value)}
                    placeholder="0.0"
                    className="p-2 bg-transparent border border-gray-500 text-white outline-none rounded w-20"
                  />
                </td>
                <td className="p-2">
                  {getVerificationBadge(skill.verification_status)}
                </td>
                <td className="p-2">
                  <div className="flex gap-2">
                    {skill.verification_status !== 'Verified' && skill.user_skill_id && (
                      <button
                        onClick={() => handleVerifySkill(skill)}
                        className="px-3 py-1 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                        title="Verify this skill"
                      >
                        Verify
                      </button>
                    )}
                    <button
                      onClick={() => removeSkill(index)}
                      className="text-red-500 hover:text-red-400 transition-colors"
                      title="Remove skill"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan="5" className="p-2">
                <button
                  onClick={addSkill}
                  className="text-purple-400 hover:text-purple-300 font-medium"
                >
                  + Add Skill
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <button
        onClick={handleSaveSkills}
        disabled={saving}
        className={`w-fit px-6 py-2 rounded-xl text-white font-semibold transition-colors ${
          saving
            ? 'bg-gray-600 cursor-not-allowed'
            : 'bg-[#7c35c7] hover:bg-[#4d217b]'
        }`}
      >
        {saving ? 'Saving...' : 'Save Skills'}
      </button>

      <VerifySkillModal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        onConfirm={handleConfirmVerify}
        skillName={selectedSkillForVerify?.skill_name}
      />
    </section>
  );
};

export default SkillsTable;
