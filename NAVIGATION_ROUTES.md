# Navigation Routes Guide

## 🎯 Button Routing Structure

All navigation buttons have been organized logically based on user types.

### 📚 For Students (Learning)

**"Start Learning"** button routes:

- **Navbar**: `/signup-students` → Student Signup Page
- **Hero Section**: `/signup-students` → Student Signup Page
- **Purpose**: Register as a student to access courses and learning materials

Alternative Student Routes:

- `/login` → Student Login Page
- `/talent` → Alternative Student Signup (Talent Form)

---

### 👨‍🏫 For Teachers/Educators (Teaching)

**"Start Teaching"** button routes:

- **Navbar**: `/login-teachers` → Teacher Login Page
- **Hero Section**: `/signup-teachers` → Teacher Signup Page
- **Purpose**: Register/login as an educator to create and teach courses

Teacher Routes:

- `/login-teachers` → Teacher Login
- `/signup-teachers` → Teacher Signup

---

### 🏢 For Companies (Hiring)

**"Hire Talent" / "Get Started"** button routes:

- **Navbar (scrolled)**: `/signup` → Company Signup Page
- **Hero Section**: `/signup` → Company Signup Page
- **Purpose**: Register as a company to post jobs and hire talent

Company Routes:

- `/signup` → Company Signup
- `/company/login` → Company Login
- `/company/profile` → Company Profile (Protected)

---

## 🗺️ Complete Route Map

### Public Routes (No Authentication Required)

| Route                 | Page           | Description                   |
| --------------------- | -------------- | ----------------------------- |
| `/`                   | Home           | Landing page with all options |
| `/login`              | Student Login  | Login page for students       |
| `/login-teachers`     | Teacher Login  | Login page for teachers       |
| `/company/login`      | Company Login  | Login page for companies      |
| `/signup-students`    | Student Signup | Registration for students     |
| `/signup-teachers`    | Teacher Signup | Registration for teachers     |
| `/signup`             | Company Signup | Registration for companies    |
| `/talent`             | Talent Form    | Alternative student signup    |
| `/leaderboard`        | Leaderboard    | Public leaderboard            |
| `/resume-scorer-test` | Resume Scorer  | Resume scoring tool           |

### Protected Routes (Authentication Required)

| Route              | Page               | Access            | Description             |
| ------------------ | ------------------ | ----------------- | ----------------------- |
| `/profile`         | User Profile       | Students/Teachers | View and edit profile   |
| `/company/profile` | Company Profile    | Companies         | Company dashboard       |
| `/jobs`            | Job Listings       | Students/Teachers | Browse available jobs   |
| `/application`     | Application Status | Students          | Track job applications  |
| `/test`            | Test Page          | All               | Assessment/testing page |
| `/profile/courses` | Courses Tab        | Students/Teachers | View courses            |

---

## 🎨 Button Placement & Behavior

### Navbar (Top)

- **Not Scrolled** (Full navbar):
  - "Start Teaching" button → Teacher Login
  - "Start Learning" button → Student Signup
- **Scrolled** (Compact navbar):
  - "Hire Talent" button → Company Signup (replaces other buttons)

### Hero Section (Center)

- "Start Learning" button → Student Signup
- "Start Teaching" button → Teacher Signup
- "Hire Talent" button → Company Signup (NEW)

---

## 🔄 User Journey Examples

### Student Journey:

1. Click "Start Learning" → `/signup-students`
2. Fill registration form → Account created
3. Redirected to → `/profile`
4. Browse jobs → `/jobs`
5. Apply for jobs → `/application`

### Teacher Journey:

1. Click "Start Teaching" → `/signup-teachers`
2. Fill registration form → Account created
3. Redirected to → `/profile`
4. Create/manage courses
5. View students

### Company Journey:

1. Click "Hire Talent" → `/signup`
2. Fill registration form → Account created
3. Redirected to → `/company/profile`
4. Post job listings
5. Review applications

---

## 🚨 Important Notes

### Button Logic:

- **Start Learning** = Student actions (courses, learning)
- **Start Teaching** = Educator actions (teaching, creating courses)
- **Hire Talent** = Company actions (recruiting, posting jobs)

### Login vs Signup:

- Navbar buttons typically go to **login pages** (assumes returning users)
- Hero buttons typically go to **signup pages** (assumes new users)
- Both can be adjusted based on analytics/user behavior

### Mobile Behavior:

- On mobile, all buttons appear in the menu
- Hero section may show different buttons based on screen size

---

## 🔧 Customization

To change any button route, edit:

- **Navbar buttons**: `frontend/src/components/home page/navbar.jsx`
- **Hero buttons**: `frontend/src/components/home page/hero.jsx`

Example:

```jsx
// Change from signup to login
<Link to="/signup-students"> // OLD
<Link to="/login"> // NEW
```

---

## ✅ Testing Checklist

- [ ] "Start Learning" goes to student signup
- [ ] "Start Teaching" goes to teacher signup/login
- [ ] "Hire Talent" goes to company signup
- [ ] All buttons work on mobile
- [ ] Scrolled navbar shows correct button
- [ ] After signup, users redirect to correct profile
- [ ] Protected routes redirect to login when not authenticated

---

## 📝 Future Improvements

Consider adding:

1. **Smart routing**: Detect if user is logged in and route accordingly
2. **Role-based navbar**: Show different buttons based on user type
3. **Quick action dropdowns**: Multiple options under each button
4. **Modal dialogs**: Ask user type before routing
5. **Logout button**: Visible when user is authenticated
