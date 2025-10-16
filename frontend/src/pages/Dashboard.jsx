import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
// import "./profile.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("personal");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Sample user data
  const userData = {
    name: "John Doe",
    role: "Software Developer",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    location: "New York, NY",
    position: "Senior Software Developer",
    department: "Engineering",
    experience: "5+ Years",
    joinDate: "January 2020",
  };

  const sectionTitles = {
    personal: "Personal Details",
    skills: "Skills",
    education: "Education Details",
    courses: "Course Enrollment",
  };

  const skills = [
    { name: "JavaScript", level: 90, category: "Expert" },
    { name: "React", level: 85, category: "Advanced" },
    { name: "Node.js", level: 80, category: "Advanced" },
    { name: "Python", level: 75, category: "Intermediate" },
  ];

  const tools = ["Git", "Docker", "AWS", "MongoDB", "PostgreSQL", "Redis"];

  // Handle section navigation
  const handleSectionClick = (section) => {
    setActiveSection(section);
  };

  // Handle edit button click
  const handleEdit = () => {
    showNotificationMessage(
      "Edit functionality would be implemented here",
      "info"
    );
  };

  // Show notification
  const showNotificationMessage = (message, type = "info") => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  // Check profile completion on mount
  useEffect(() => {
    const checkProfileCompletion = async () => {
      try {
        // Only check for students
        if (user && user.user && user.user.user_role === 'Student') {
          const profileCompletion = user.user.profile_completion_percentage;
          
          // Redirect to onboarding if profile is not complete (less than 50%)
          if (profileCompletion < 50) {
            navigate('/student/onboarding');
            return;
          }
        }
        
        setLoading(false);
        setTimeout(() => {
          showNotificationMessage("Welcome to your dashboard! 👋", "info");
        }, 1000);
      } catch (error) {
        console.error('Error checking profile:', error);
        setLoading(false);
      }
    };

    checkProfileCompletion();
  }, [user, navigate]);

  return (
    <>
      <div className="dashboard-container">
        {/* Left Column */}
        <div className="left-column">
          <div className="profile-section">
            <div className="profile-image">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
                alt="Profile Picture"
                id="profileImg"
              />
            </div>
            <div className="profile-name">
              <h3 id="userName">{userData.name}</h3>
              <p id="userRole">{userData.role}</p>
            </div>
          </div>

          <nav className="navigation">
            <ul className="nav-menu">
              <li
                className={`nav-item ${
                  activeSection === "personal" ? "active" : ""
                }`}
                onClick={() => handleSectionClick("personal")}
              >
                <i className="fas fa-user"></i>
                <span>Personal Details</span>
              </li>
              <li
                className={`nav-item ${
                  activeSection === "skills" ? "active" : ""
                }`}
                onClick={() => handleSectionClick("skills")}
              >
                <i className="fas fa-code"></i>
                <span>Skills</span>
              </li>
              <li
                className={`nav-item ${
                  activeSection === "education" ? "active" : ""
                }`}
                onClick={() => handleSectionClick("education")}
              >
                <i className="fas fa-graduation-cap"></i>
                <span>Education Details</span>
              </li>
              <li
                className={`nav-item ${
                  activeSection === "courses" ? "active" : ""
                }`}
                onClick={() => handleSectionClick("courses")}
              >
                <i className="fas fa-book"></i>
                <span>Course Enrollment</span>
              </li>
            </ul>
          </nav>
        </div>

        {/* Right Column */}
        <div className="right-column">
          <div className="content-header">
            <h2 id="contentTitle">{sectionTitles[activeSection]}</h2>
            <div className="header-actions">
              <button className="btn-secondary" onClick={handleEdit}>
                <i className="fas fa-edit"></i>
                Edit
              </button>
            </div>
          </div>

          <div className="content-area">
            {/* Personal Details Section */}
            {activeSection === "personal" && (
              <div className="content-section active">
                <div className="info-grid">
                  <div className="info-card">
                    <div className="info-header">
                      <i className="fas fa-user-circle"></i>
                      <h4>Basic Information</h4>
                    </div>
                    <div className="info-content">
                      <div className="info-row">
                        <span className="label">Full Name:</span>
                        <span className="value">{userData.name}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Email:</span>
                        <span className="value">{userData.email}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Phone:</span>
                        <span className="value">{userData.phone}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Location:</span>
                        <span className="value">{userData.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="info-card">
                    <div className="info-header">
                      <i className="fas fa-briefcase"></i>
                      <h4>Professional Info</h4>
                    </div>
                    <div className="info-content">
                      <div className="info-row">
                        <span className="label">Position:</span>
                        <span className="value">{userData.position}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Department:</span>
                        <span className="value">{userData.department}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Experience:</span>
                        <span className="value">{userData.experience}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Join Date:</span>
                        <span className="value">{userData.joinDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Skills Section */}
            {activeSection === "skills" && (
              <div className="content-section active">
                <div className="skills-container">
                  <div className="skills-category">
                    <h4>
                      <i className="fas fa-laptop-code"></i> Technical Skills
                    </h4>
                    <div className="skills-grid">
                      {skills.map((skill, index) => (
                        <div key={index} className="skill-item">
                          <span className="skill-name">{skill.name}</span>
                          <div className="skill-bar">
                            <div
                              className="skill-progress"
                              style={{ width: `${skill.level}%` }}
                            ></div>
                          </div>
                          <span className="skill-level">{skill.category}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="skills-category">
                    <h4>
                      <i className="fas fa-tools"></i> Tools & Technologies
                    </h4>
                    <div className="tools-grid">
                      {tools.map((tool, index) => (
                        <div key={index} className="tool-tag">
                          {tool}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Education Section */}
            {activeSection === "education" && (
              <div className="content-section active">
                <div className="timeline">
                  <div className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <h4>Master of Science in Computer Science</h4>
                        <span className="timeline-date">2018 - 2020</span>
                      </div>
                      <p className="timeline-institution">
                        Stanford University
                      </p>
                      <p className="timeline-description">
                        Specialized in Machine Learning and Data Structures.
                        GPA: 3.8/4.0
                      </p>
                      <div className="timeline-achievements">
                        <span className="achievement-tag">Dean's List</span>
                        <span className="achievement-tag">
                          Research Assistant
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <h4>Bachelor of Engineering in Software Engineering</h4>
                        <span className="timeline-date">2014 - 2018</span>
                      </div>
                      <p className="timeline-institution">
                        University of California, Berkeley
                      </p>
                      <p className="timeline-description">
                        Focus on Software Development and System Design. GPA:
                        3.6/4.0
                      </p>
                      <div className="timeline-achievements">
                        <span className="achievement-tag">Magna Cum Laude</span>
                        <span className="achievement-tag">IEEE Member</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Courses Section */}
            {activeSection === "courses" && (
              <div className="content-section active">
                <div className="courses-container">
                  <div className="courses-stats">
                    <div className="stat-card">
                      <div className="stat-number">12</div>
                      <div className="stat-label">Completed Courses</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-number">3</div>
                      <div className="stat-label">In Progress</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-number">85%</div>
                      <div className="stat-label">Average Score</div>
                    </div>
                  </div>

                  <div className="courses-list">
                    <h4>Current Enrollments</h4>
                    <div className="course-card active">
                      <div className="course-header">
                        <div className="course-title">
                          Advanced React Patterns
                        </div>
                        <div className="course-progress">75%</div>
                      </div>
                      <div className="course-details">
                        <span className="course-instructor">
                          By Sarah Johnson
                        </span>
                        <span className="course-duration">8 weeks</span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress"
                          style={{ width: "75%" }}
                        ></div>
                      </div>
                    </div>

                    <div className="course-card active">
                      <div className="course-header">
                        <div className="course-title">
                          AWS Cloud Architecture
                        </div>
                        <div className="course-progress">60%</div>
                      </div>
                      <div className="course-details">
                        <span className="course-instructor">
                          By Michael Chen
                        </span>
                        <span className="course-duration">10 weeks</span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress"
                          style={{ width: "60%" }}
                        ></div>
                      </div>
                    </div>

                    <div className="course-card active">
                      <div className="course-header">
                        <div className="course-title">
                          Machine Learning Fundamentals
                        </div>
                        <div className="course-progress">30%</div>
                      </div>
                      <div className="course-details">
                        <span className="course-instructor">
                          By Dr. Amanda Smith
                        </span>
                        <span className="course-duration">12 weeks</span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress"
                          style={{ width: "30%" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notification */}
      {showNotification && (
        <div className={`notification ${showNotification ? "show" : ""}`}>
          {notificationMessage}
        </div>
      )}
    </>
  );
};

export default Dashboard;
