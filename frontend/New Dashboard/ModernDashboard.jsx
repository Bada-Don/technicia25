import React, { useState } from 'react';
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

const ModernDashboard = () => {
  const [activeSection, setActiveSection] = useState('personal');
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

  const skills = [
    { name: 'React', level: 95, category: 'Expert' },
    { name: 'Node.js', level: 90, category: 'Expert' },
    { name: 'TypeScript', level: 88, category: 'Advanced' },
    { name: 'Python', level: 85, category: 'Advanced' },
    { name: 'AWS', level: 80, category: 'Advanced' },
    { name: 'Docker', level: 75, category: 'Intermediate' }
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

  const navigationItems = [
    { id: 'personal', label: 'Personal Information', icon: User },
    { id: 'skills', label: 'Skills', icon: Code },
    { id: 'education', label: 'Education Details', icon: GraduationCap },
    { id: 'courses', label: 'Course Enrollment', icon: BookOpen }
  ];

  const PersonalInfo = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center mb-6">
          <User className="w-6 h-6 text-blue-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="flex items-center">
              <Mail className="w-4 h-4 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-800 font-medium">{userData.email}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Phone className="w-4 h-4 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-gray-800 font-medium">{userData.phone}</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="text-gray-800 font-medium">{userData.location}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Briefcase className="w-4 h-4 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Position</p>
                <p className="text-gray-800 font-medium">{userData.position}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center mb-6">
          <Calendar className="w-6 h-6 text-blue-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-800">Professional Details</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{userData.experience}</p>
            <p className="text-sm text-gray-600 mt-1">Experience</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{userData.department}</p>
            <p className="text-sm text-gray-600 mt-1">Department</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{userData.joinDate}</p>
            <p className="text-sm text-gray-600 mt-1">Joined</p>
          </div>
        </div>
      </div>
    </div>
  );

  const Skills = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center mb-6">
          <Code className="w-6 h-6 text-blue-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-800">Technical Skills</h3>
        </div>
        <div className="space-y-4">
          {skills.map((skill, index) => (
            <div key={index} className="skill-item">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-800">{skill.name}</span>
                <span className="text-sm text-gray-500">{skill.category}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2.5 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${skill.level}%` }}
                ></div>
              </div>
              <div className="text-right mt-1">
                <span className="text-xs text-gray-400">{skill.level}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center mb-6">
          <TrendingUp className="w-6 h-6 text-blue-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-800">Technologies & Tools</h3>
        </div>
        <div className="flex flex-wrap gap-3">
          {['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker', 'MongoDB', 'PostgreSQL', 'Git', 'VS Code'].map((tool, index) => (
            <span key={index} className="px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm rounded-full font-medium hover:shadow-md transition-shadow">
              {tool}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  const Education = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center mb-6">
          <GraduationCap className="w-6 h-6 text-blue-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-800">Academic Background</h3>
        </div>
        <div className="space-y-6">
          {education.map((edu, index) => (
            <div key={index} className="relative pl-8 pb-6 border-l-2 border-blue-200 last:border-l-0 last:pb-0">
              <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-500 rounded-full"></div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-3">
                  <h4 className="text-lg font-semibold text-gray-800">{edu.degree}</h4>
                  <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                    {edu.period}
                  </span>
                </div>
                <p className="text-blue-600 font-medium mb-2">{edu.institution}</p>
                <p className="text-gray-600 mb-3">GPA: {edu.gpa}</p>
                <div className="flex flex-wrap gap-2">
                  {edu.achievements.map((achievement, idx) => (
                    <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md">
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
  );

  const Courses = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <BookOpen className="w-6 h-6 text-blue-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-800">Course Progress</h3>
          </div>
          <div className="flex space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Completed</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-gray-600">In Progress</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <h4 className="text-2xl font-bold">
              {courses.filter(c => c.status === 'Completed').length}
            </h4>
            <p className="text-blue-100">Completed Courses</p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <h4 className="text-2xl font-bold">
              {courses.filter(c => c.status === 'In Progress').length}
            </h4>
            <p className="text-purple-100">In Progress</p>
          </div>
        </div>

        <div className="space-y-4">
          {courses.map((course, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-3">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">{course.title}</h4>
                  <p className="text-gray-600 text-sm">by {course.instructor}</p>
                </div>
                <div className="flex items-center space-x-4 mt-2 md:mt-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    course.status === 'Completed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {course.status}
                  </span>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Clock className="w-4 h-4 mr-1" />
                    {course.duration}
                  </div>
                </div>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{course.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-700 ${
                      course.status === 'Completed' 
                        ? 'bg-green-500' 
                        : 'bg-blue-500'
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
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'personal':
        return <PersonalInfo />;
      case 'skills':
        return <Skills />;
      case 'education':
        return <Education />;
      case 'courses':
        return <Courses />;
      default:
        return <PersonalInfo />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src={userData.avatar} 
              alt="Profile" 
              className="w-8 h-8 rounded-full object-cover"
            />
            <div>
              <h2 className="text-sm font-semibold text-gray-800">{userData.name}</h2>
              <p className="text-xs text-gray-500">{userData.role}</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex flex-col h-full">
            {/* Profile Section */}
            <div className="p-6 bg-gradient-to-br from-blue-600 to-purple-700">
              <div className="flex flex-col items-center text-white">
                <img 
                  src={userData.avatar} 
                  alt="Profile" 
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-white/20 mb-4"
                />
                <h2 className="text-lg font-semibold">{userData.name}</h2>
                <p className="text-blue-100 text-sm">{userData.role}</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
                          ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600 font-medium'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </nav>

            {/* Logout Button */}
            <div className="p-4 border-t border-gray-200">
              <button className="w-full flex items-center px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
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
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
                {navigationItems.find(item => item.id === activeSection)?.label}
              </h1>
              <p className="text-gray-600">
                {activeSection === 'personal' && 'Manage your personal information and professional details'}
                {activeSection === 'skills' && 'Track your technical skills and professional growth'}
                {activeSection === 'education' && 'View your educational background and achievements'}
                {activeSection === 'courses' && 'Monitor your course progress and certifications'}
              </p>
            </div>
            
            <div className="transition-all duration-300 ease-in-out">
              {renderContent()}
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
    </div>
  );
};

export default ModernDashboard;