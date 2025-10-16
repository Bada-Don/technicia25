import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import DonutChart from '../components/DonutChart';
import IndividualSkillDonut from '../components/IndividualSkillDonut';
import { 
  User, 
  Code, 
  GraduationCap, 
  BookOpen, 
  Menu, 
  X, 
  Search,
  LogOut,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Award,
  Clock,
  TrendingUp
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("personal");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sample user data
  const userData = {
    name: 'Alex Johnson',
    role: 'Full Stack Developer',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    email: 'alex.johnson@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    position: 'Senior Full Stack Developer',
    department: 'Engineering',
    experience: '6+ Years',
    joinDate: 'March 2019'
  };

  const sectionTitles = {
    personal: "Personal Details",
    skills: "Skills",
    education: "Education Details",
    courses: "Course Enrollment",
  };

  const skills = [
    { name: 'React', level: 95, category: 'Expert' },
    { name: 'Node.js', level: 90, category: 'Expert' },
    { name: 'TypeScript', level: 88, category: 'Advanced' },
    { name: 'Python', level: 85, category: 'Advanced' },
    { name: 'AWS', level: 80, category: 'Advanced' },
    { name: 'Docker', level: 75, category: 'Intermediate' }
  ];

  const tools = ['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker', 'MongoDB', 'PostgreSQL', 'Git', 'VS Code'];

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

  const navigationItems = [
    { id: 'personal', label: 'Personal Information', icon: User },
    { id: 'skills', label: 'Skills', icon: Code },
    { id: 'education', label: 'Education Details', icon: GraduationCap },
    { id: 'courses', label: 'Course Enrollment', icon: BookOpen }
  ];

  const education = [
    {
      degree: 'Master of Computer Science',
      institution: 'Stanford University',
      period: '2017 - 2019',
      gpa: '3.9/4.0',
      achievements: ['Dean\'s List', 'Research Assistant', 'Graduate Fellowship']
    },
    {
      degree: 'Bachelor of Software Engineering',
      institution: 'UC Berkeley',
      period: '2013 - 2017',
      gpa: '3.7/4.0',
      achievements: ['Magna Cum Laude', 'ACM Member', 'Hackathon Winner']
    }
  ];

  const courses = [
    {
      title: 'Advanced React Patterns & Performance',
      instructor: 'Kent C. Dodds',
      progress: 85,
      duration: '12 weeks',
      status: 'In Progress'
    },
    {
      title: 'Microservices Architecture with Node.js',
      instructor: 'Maximilian Schwarzmüller',
      progress: 100,
      duration: '8 weeks',
      status: 'Completed'
    },
    {
      title: 'AWS Solutions Architect',
      instructor: 'Ryan Kroonenburg',
      progress: 60,
      duration: '16 weeks',
      status: 'In Progress'
    },
    {
      title: 'System Design Interview Prep',
      instructor: 'Alex Xu',
      progress: 100,
      duration: '6 weeks',
      status: 'Completed'
    }
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Background with radial gradient matching home page */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,_#000000_0%,_rgba(74,26,125,0.6)_30%,_#000000_70%)] -z-10"></div>
      {/* Mobile Header */}
      <div className="lg:hidden bg-black/80 backdrop-blur-md shadow-sm border-b border-purple-800/30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src={userData.avatar} 
              alt="Profile" 
              className="w-8 h-8 rounded-full object-cover ring-2 ring-purple-500/30"
            />
            <div>
              <h2 className="text-sm font-semibold text-white">{userData.name}</h2>
              <p className="text-xs text-purple-200">{userData.role}</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/40 transition-colors text-white"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-black/90 backdrop-blur-md border-r border-purple-800/30 shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex flex-col h-full">
            {/* Profile Section */}
            <div className="p-6 bg-gradient-to-br from-purple-900 to-purple-700">
              <div className="flex flex-col items-center text-white">
                <img 
                  src={userData.avatar} 
                  alt="Profile" 
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-purple-400/30 mb-4"
                />
                <h2 className="text-lg font-semibold text-white">{userData.name}</h2>
                <p className="text-purple-200 text-sm">{userData.role}</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-purple-800/30">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-purple-400" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="w-full pl-10 pr-4 py-2 border border-purple-700/50 rounded-lg bg-purple-900/30 text-white placeholder-purple-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 text-sm"
                />
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
              <div className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveSection(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                        isActive
                          ? 'bg-purple-600/30 text-purple-200 border-r-4 border-purple-400 font-medium'
                          : 'text-purple-100 hover:bg-purple-800/30 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-purple-400' : 'text-purple-300'}`} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </nav>

            {/* Logout Button */}
            <div className="p-4 border-t border-purple-800/30">
              <button className="w-full flex items-center px-4 py-3 text-purple-100 hover:bg-red-900/30 hover:text-red-300 rounded-lg transition-colors">
                <LogOut className="w-5 h-5 mr-3" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          <div className="p-4 lg:p-8 max-w-6xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                {navigationItems.find(item => item.id === activeSection)?.label}
              </h1>
              <p className="text-purple-200">
                {activeSection === 'personal' && 'Manage your personal information and professional details'}
                {activeSection === 'skills' && 'Track your technical skills and professional growth'}
                {activeSection === 'education' && 'View your educational background and achievements'}
                {activeSection === 'courses' && 'Monitor your course progress and certifications'}
              </p>
            </div>
            
            <div className="transition-all duration-300 ease-in-out">
              {/* Personal Details Section */}
              {activeSection === 'personal' && (
                <div className="space-y-6">
                  <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-purple-800/30">
                    <div className="flex items-center mb-6">
                      <User className="w-6 h-6 text-purple-400 mr-3" />
                      <h3 className="text-lg font-semibold text-white">Basic Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 text-purple-400 mr-3" />
                          <div>
                            <p className="text-sm text-purple-300">Email</p>
                            <p className="text-white font-medium">{userData.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 text-purple-400 mr-3" />
                          <div>
                            <p className="text-sm text-purple-300">Phone</p>
                            <p className="text-white font-medium">{userData.phone}</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 text-purple-400 mr-3" />
                          <div>
                            <p className="text-sm text-purple-300">Location</p>
                            <p className="text-white font-medium">{userData.location}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Briefcase className="w-4 h-4 text-purple-400 mr-3" />
                          <div>
                            <p className="text-sm text-purple-300">Position</p>
                            <p className="text-white font-medium">{userData.position}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-purple-800/30">
                    <div className="flex items-center mb-6">
                      <Calendar className="w-6 h-6 text-purple-400 mr-3" />
                      <h3 className="text-lg font-semibold text-white">Professional Details</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-purple-900/30 rounded-lg border border-purple-700/30">
                        <p className="text-2xl font-bold text-purple-300">{userData.experience}</p>
                        <p className="text-sm text-purple-200 mt-1">Experience</p>
                      </div>
                      <div className="text-center p-4 bg-purple-900/30 rounded-lg border border-purple-700/30">
                        <p className="text-2xl font-bold text-purple-300">{userData.department}</p>
                        <p className="text-sm text-purple-200 mt-1">Department</p>
                      </div>
                      <div className="text-center p-4 bg-purple-900/30 rounded-lg border border-purple-700/30">
                        <p className="text-2xl font-bold text-purple-300">{userData.joinDate}</p>
                        <p className="text-sm text-purple-200 mt-1">Joined</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Skills Section */}
              {activeSection === 'skills' && (
                <div className="space-y-6">
                  {/* Individual Skills Overview */}
                  <div className="bg-gradient-to-r from-purple-900/30 to-purple-800/30 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-purple-700/30">
                    <div className="flex items-center mb-6">
                      <Code className="w-6 h-6 text-purple-400 mr-3" />
                      <h3 className="text-lg font-semibold text-white">Skills Overview</h3>
                    </div>
                    
                    {/* Individual Donut Charts Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {skills.map((skill, index) => (
                        <IndividualSkillDonut 
                          key={index}
                          skill={skill}
                          size={140}
                          thickness={14}
                        />
                      ))}
                    </div>
                    
                    {/* Overall Stats */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 text-center border border-purple-700/30">
                        <div className="text-2xl font-bold text-purple-300">
                          {Math.round(skills.reduce((sum, skill) => sum + skill.level, 0) / skills.length)}%
                        </div>
                        <div className="text-sm text-purple-200">Average Skill Level</div>
                      </div>
                      <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 text-center border border-purple-700/30">
                        <div className="text-2xl font-bold text-purple-300">
                          {skills.filter(skill => skill.level >= 90).length}
                        </div>
                        <div className="text-sm text-purple-200">Expert Skills</div>
                      </div>
                      <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 text-center border border-purple-700/30">
                        <div className="text-2xl font-bold text-purple-300">
                          {skills.length}
                        </div>
                        <div className="text-sm text-purple-200">Total Skills</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-purple-800/30">
                    <div className="flex items-center mb-6">
                      <TrendingUp className="w-6 h-6 text-purple-400 mr-3" />
                      <h3 className="text-lg font-semibold text-white">Technologies & Tools</h3>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {tools.map((tool, index) => (
                        <span key={index} className="px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm rounded-full font-medium hover:shadow-lg hover:from-purple-500 hover:to-purple-600 transition-all">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Education Section */}
              {activeSection === 'education' && (
                <div className="space-y-6">
                  <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-purple-800/30">
                    <div className="flex items-center mb-6">
                      <GraduationCap className="w-6 h-6 text-purple-400 mr-3" />
                      <h3 className="text-lg font-semibold text-white">Academic Background</h3>
                    </div>
                    <div className="space-y-6">
                      {education.map((edu, index) => (
                        <div key={index} className="relative pl-8 pb-6 border-l-2 border-purple-600/50 last:border-l-0 last:pb-0">
                          <div className="absolute -left-2 top-0 w-4 h-4 bg-purple-500 rounded-full ring-4 ring-purple-500/20"></div>
                          <div className="bg-purple-900/20 backdrop-blur-sm rounded-lg p-4 border border-purple-700/30">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-3">
                              <h4 className="text-lg font-semibold text-white">{edu.degree}</h4>
                              <span className="text-sm bg-purple-600/30 text-purple-200 px-3 py-1 rounded-full font-medium">
                                {edu.period}
                              </span>
                            </div>
                            <p className="text-purple-300 font-medium mb-2">{edu.institution}</p>
                            <p className="text-purple-200 mb-3">GPA: {edu.gpa}</p>
                            <div className="flex flex-wrap gap-2">
                              {edu.achievements.map((achievement, idx) => (
                                <span key={idx} className="px-2 py-1 bg-purple-600/20 text-purple-200 text-xs rounded-md border border-purple-600/30">
                                  {achievement}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Courses Section */}
              {activeSection === 'courses' && (
                <div className="space-y-6">
                  <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-purple-800/30">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <BookOpen className="w-6 h-6 text-purple-400 mr-3" />
                        <h3 className="text-lg font-semibold text-white">Course Progress</h3>
                      </div>
                      <div className="flex space-x-4 text-sm">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                          <span className="text-purple-200">Completed</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-purple-400 rounded-full mr-2"></div>
                          <span className="text-purple-200">In Progress</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6 text-white border border-purple-500/30">
                        <h4 className="text-2xl font-bold">
                          {courses.filter(c => c.status === 'Completed').length}
                        </h4>
                        <p className="text-purple-200">Completed Courses</p>
                      </div>
                      <div className="bg-gradient-to-r from-purple-700 to-purple-800 rounded-lg p-6 text-white border border-purple-600/30">
                        <h4 className="text-2xl font-bold">
                          {courses.filter(c => c.status === 'In Progress').length}
                        </h4>
                        <p className="text-purple-200">In Progress</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {courses.map((course, index) => (
                        <div key={index} className="bg-purple-900/20 backdrop-blur-sm rounded-lg p-4 border border-purple-700/30 hover:shadow-xl hover:border-purple-600/50 transition-all">
                          <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-3">
                            <div>
                              <h4 className="font-semibold text-white mb-1">{course.title}</h4>
                              <p className="text-purple-200 text-sm">by {course.instructor}</p>
                            </div>
                            <div className="flex items-center space-x-4 mt-2 md:mt-0">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                course.status === 'Completed' 
                                  ? 'bg-green-600/30 text-green-300 border border-green-500/50' 
                                  : 'bg-purple-600/30 text-purple-300 border border-purple-500/50'
                              }`}>
                                {course.status}
                              </span>
                              <div className="flex items-center text-purple-300 text-sm">
                                <Clock className="w-4 h-4 mr-1" />
                                {course.duration}
                              </div>
                            </div>
                          </div>
                          <div className="mb-2">
                            <div className="flex justify-between text-sm text-purple-200 mb-1">
                              <span>Progress</span>
                              <span>{course.progress}%</span>
                            </div>
                            <div className="w-full bg-purple-900/50 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-700 ${
                                  course.status === 'Completed' 
                                    ? 'bg-green-500' 
                                    : 'bg-purple-500'
                                }`}
                                style={{ width: `${course.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Notification */}
      {showNotification && (
        <div className={`notification ${showNotification ? 'show' : ''} fixed top-20 right-5 bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg border border-purple-500/50 backdrop-blur-sm z-50 transition-all duration-300`}>
          {notificationMessage}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
