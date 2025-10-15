-- ============================================
-- AI-POWERED EDUCATION & CAREER READINESS PLATFORM
-- PostgreSQL Database Schema (Optimized for 100K+ users)
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. USER MANAGEMENT SCHEMA
-- ============================================

-- Custom ENUM types
CREATE TYPE user_role_enum AS ENUM ('Student', 'Educator', 'Company');
CREATE TYPE account_status_enum AS ENUM ('Active', 'Suspended', 'Pending_Verification');
CREATE TYPE education_level_enum AS ENUM ('High_School', 'Undergraduate', 'Graduate', 'PhD');
CREATE TYPE verification_status_enum AS ENUM ('Verified', 'Pending', 'Rejected');
CREATE TYPE company_size_enum AS ENUM ('1-10', '11-50', '51-200', '201-500', '500+');
CREATE TYPE employment_type_enum AS ENUM ('Full_Time', 'Part_Time', 'Internship', 'Freelance', 'Contract');

-- Base Users Table
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_role user_role_enum NOT NULL,
    account_status account_status_enum DEFAULT 'Pending_Verification',
    profile_completion_percentage SMALLINT DEFAULT 0 CHECK (profile_completion_percentage >= 0 AND profile_completion_percentage <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$$')
);

-- Student Profiles
CREATE TABLE student_profiles (
    student_id UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(50),
    phone_number VARCHAR(20),
    address JSONB, -- {street, city, state, country, zipcode}
    bio TEXT,
    profile_picture_url VARCHAR(500),
    current_education_level education_level_enum,
    career_goals TEXT,
    preferred_industries JSONB, -- Array of industries
    resume_url VARCHAR(500),
    linkedin_profile VARCHAR(255),
    github_profile VARCHAR(255),
    portfolio_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT age_check CHECK (date_of_birth IS NULL OR date_of_birth <= CURRENT_DATE - INTERVAL '13 years')
);

-- Educator Profiles
CREATE TABLE educator_profiles (
    educator_id UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    phone_number VARCHAR(20),
    address JSONB,
    bio TEXT,
    profile_picture_url VARCHAR(500),
    years_of_experience NUMERIC(4,1) CHECK (years_of_experience >= 0),
    specialization JSONB, -- Array of specializations
    teaching_certifications JSONB, -- Array of {name, issuer, date}
    linkedin_profile VARCHAR(255),
    verification_status verification_status_enum DEFAULT 'Pending',
    approval_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Company Profiles
CREATE TABLE company_profiles (
    company_id UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    company_size company_size_enum,
    founded_year SMALLINT CHECK (founded_year >= 1800 AND founded_year <= EXTRACT(YEAR FROM CURRENT_DATE)),
    headquarters_location JSONB, -- {city, state, country}
    company_website VARCHAR(255),
    company_description TEXT,
    logo_url VARCHAR(500),
    recruiter_contact_name VARCHAR(100),
    recruiter_contact_email VARCHAR(255),
    recruiter_contact_phone VARCHAR(20),
    verification_status verification_status_enum DEFAULT 'Pending',
    verification_document_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. EDUCATION & EXPERIENCE SCHEMA
-- ============================================

-- Education History
CREATE TABLE education_history (
    education_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES student_profiles(student_id) ON DELETE CASCADE,
    institution_name VARCHAR(255) NOT NULL,
    degree_qualification VARCHAR(150) NOT NULL,
    field_of_study VARCHAR(150),
    start_date DATE NOT NULL,
    end_date DATE,
    currently_enrolled BOOLEAN DEFAULT FALSE,
    gpa_percentage VARCHAR(20),
    achievements TEXT,
    location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT date_order CHECK (end_date IS NULL OR end_date >= start_date),
    CONSTRAINT enrollment_logic CHECK (
        (currently_enrolled = TRUE AND end_date IS NULL) OR 
        (currently_enrolled = FALSE)
    )
);

-- Work Experience
CREATE TABLE work_experience (
    experience_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    job_title VARCHAR(150) NOT NULL,
    employment_type employment_type_enum NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    currently_working BOOLEAN DEFAULT FALSE,
    location VARCHAR(255),
    description TEXT,
    key_achievements TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT work_date_order CHECK (end_date IS NULL OR end_date >= start_date),
    CONSTRAINT current_work_logic CHECK (
        (currently_working = TRUE AND end_date IS NULL) OR 
        (currently_working = FALSE)
    )
);

-- ============================================
-- 3. SKILLS & ASSESSMENT SCHEMA
-- ============================================

CREATE TYPE skill_category_enum AS ENUM ('Programming', 'Design', 'Data_Science', 'Business', 'Soft_Skills', 'Marketing', 'Engineering', 'Other');
CREATE TYPE difficulty_level_enum AS ENUM ('Beginner', 'Intermediate', 'Advanced', 'Expert');
CREATE TYPE proficiency_level_enum AS ENUM ('Beginner', 'Intermediate', 'Advanced', 'Expert');
CREATE TYPE skill_verification_enum AS ENUM ('Unverified', 'Verified', 'Failed');
CREATE TYPE assessment_type_enum AS ENUM ('MCQ', 'Coding', 'Project', 'Mixed');
CREATE TYPE question_type_enum AS ENUM ('MCQ', 'Multiple_Select', 'Coding', 'Short_Answer');

-- Skills Master
CREATE TABLE skills_master (
    skill_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    skill_name VARCHAR(150) UNIQUE NOT NULL,
    skill_category skill_category_enum NOT NULL,
    difficulty_level difficulty_level_enum,
    description TEXT,
    icon_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Skills (Claimed)
CREATE TABLE user_skills (
    user_skill_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills_master(skill_id) ON DELETE CASCADE,
    proficiency_level proficiency_level_enum NOT NULL,
    verification_status skill_verification_enum DEFAULT 'Unverified',
    claimed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    years_of_experience NUMERIC(4,1) CHECK (years_of_experience >= 0),
    UNIQUE(user_id, skill_id)
);

-- Skill Assessments/Tests
CREATE TABLE skill_assessments (
    assessment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    skill_id UUID NOT NULL REFERENCES skills_master(skill_id) ON DELETE CASCADE,
    assessment_title VARCHAR(255) NOT NULL,
    description TEXT,
    difficulty_level difficulty_level_enum NOT NULL,
    duration_minutes SMALLINT NOT NULL CHECK (duration_minutes > 0),
    total_questions SMALLINT NOT NULL CHECK (total_questions > 0),
    passing_score NUMERIC(5,2) NOT NULL CHECK (passing_score >= 0 AND passing_score <= 100),
    assessment_type assessment_type_enum NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID NOT NULL REFERENCES users(user_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Assessment Questions
CREATE TABLE assessment_questions (
    question_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL REFERENCES skill_assessments(assessment_id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type question_type_enum NOT NULL,
    options JSONB, -- For MCQ: [{id, text}, ...]
    correct_answer TEXT NOT NULL, -- Encrypted
    points SMALLINT NOT NULL CHECK (points > 0),
    difficulty_level difficulty_level_enum NOT NULL,
    explanation_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Assessment Attempts
CREATE TABLE user_assessment_attempts (
    attempt_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    assessment_id UUID NOT NULL REFERENCES skill_assessments(assessment_id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP WITH TIME ZONE,
    score NUMERIC(5,2) CHECK (score >= 0 AND score <= 100),
    total_correct SMALLINT DEFAULT 0,
    total_incorrect SMALLINT DEFAULT 0,
    unanswered SMALLINT DEFAULT 0,
    is_passed BOOLEAN,
    proctoring_data JSONB, -- {screenshots, tab_switches, violations}
    attempt_number SMALLINT NOT NULL DEFAULT 1,
    certificate_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT attempt_time_check CHECK (end_time IS NULL OR end_time >= start_time)
);

-- User Assessment Answers
CREATE TABLE user_assessment_answers (
    answer_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID NOT NULL REFERENCES user_assessment_attempts(attempt_id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES assessment_questions(question_id) ON DELETE CASCADE,
    user_answer TEXT,
    is_correct BOOLEAN,
    points_awarded SMALLINT DEFAULT 0,
    time_spent_seconds SMALLINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(attempt_id, question_id)
);

-- ============================================
-- 4. LEADERBOARD SCHEMA
-- ============================================

-- Student Leaderboard
CREATE TABLE student_leaderboard (
    leaderboard_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES student_profiles(student_id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills_master(skill_id) ON DELETE CASCADE,
    overall_rank INTEGER,
    skill_score NUMERIC(10,2) NOT NULL DEFAULT 0,
    total_assessments_taken SMALLINT DEFAULT 0,
    average_score NUMERIC(5,2),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, skill_id)
);

-- Educator Leaderboard
CREATE TABLE educator_leaderboard (
    leaderboard_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    educator_id UUID NOT NULL REFERENCES educator_profiles(educator_id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills_master(skill_id) ON DELETE CASCADE,
    overall_rank INTEGER,
    skill_score NUMERIC(10,2) NOT NULL DEFAULT 0,
    total_assessments_taken SMALLINT DEFAULT 0,
    course_rating NUMERIC(3,2) CHECK (course_rating >= 0 AND course_rating <= 5),
    total_students_taught INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(educator_id, skill_id)
);

-- ============================================
-- 5. COURSE MANAGEMENT SCHEMA
-- ============================================

CREATE TYPE course_status_enum AS ENUM ('Draft', 'Published', 'Archived');
CREATE TYPE content_type_enum AS ENUM ('Video', 'Article', 'Quiz', 'Assignment', 'Resource');
CREATE TYPE enrollment_status_enum AS ENUM ('Active', 'Completed', 'Dropped');

-- Courses
CREATE TABLE courses (
    course_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    educator_id UUID NOT NULL REFERENCES educator_profiles(educator_id) ON DELETE CASCADE,
    course_name VARCHAR(255) NOT NULL,
    description TEXT,
    skill_id UUID NOT NULL REFERENCES skills_master(skill_id) ON DELETE RESTRICT,
    difficulty_level difficulty_level_enum NOT NULL,
    duration_hours NUMERIC(6,2) CHECK (duration_hours > 0),
    thumbnail_url VARCHAR(500),
    course_status course_status_enum DEFAULT 'Draft',
    enrollment_count INTEGER DEFAULT 0 CHECK (enrollment_count >= 0),
    average_rating NUMERIC(3,2) CHECK (average_rating >= 0 AND average_rating <= 5),
    price NUMERIC(10,2) DEFAULT 0 CHECK (price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Course Modules
CREATE TABLE course_modules (
    module_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
    module_title VARCHAR(255) NOT NULL,
    description TEXT,
    sequence_order SMALLINT NOT NULL,
    duration_minutes SMALLINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_id, sequence_order)
);

-- Course Content
CREATE TABLE course_content (
    content_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES course_modules(module_id) ON DELETE CASCADE,
    content_type content_type_enum NOT NULL,
    content_title VARCHAR(255) NOT NULL,
    content_url VARCHAR(500),
    duration_minutes SMALLINT,
    sequence_order SMALLINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(module_id, sequence_order)
);

-- Course Enrollments
CREATE TABLE course_enrollments (
    enrollment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES student_profiles(student_id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completion_percentage SMALLINT DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    status enrollment_status_enum DEFAULT 'Active',
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    certificate_url VARCHAR(500),
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(student_id, course_id)
);

-- Course Reviews
CREATE TABLE course_reviews (
    review_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES student_profiles(student_id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, course_id)
);

-- ============================================
-- 6. JOB MANAGEMENT SCHEMA
-- ============================================

CREATE TYPE experience_level_enum AS ENUM ('Entry', 'Mid', 'Senior', 'Lead');
CREATE TYPE job_status_enum AS ENUM ('Open', 'Closed', 'Filled');
CREATE TYPE application_status_enum AS ENUM ('Applied', 'Under_Review', 'Shortlisted', 'Rejected', 'Offered', 'Accepted');

-- Job Postings
CREATE TABLE job_postings (
    job_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES company_profiles(company_id) ON DELETE CASCADE,
    job_title VARCHAR(255) NOT NULL,
    job_description TEXT NOT NULL,
    employment_type employment_type_enum NOT NULL,
    experience_level experience_level_enum NOT NULL,
    location JSONB, -- {city, state, country, remote_option}
    salary_range JSONB, -- {min, max, currency}
    posted_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    application_deadline DATE,
    job_status job_status_enum DEFAULT 'Open',
    required_skills UUID[] NOT NULL, -- Array of skill_ids
    preferred_qualifications TEXT,
    benefits TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Job Applications
CREATE TABLE job_applications (
    application_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES job_postings(job_id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES student_profiles(student_id) ON DELETE CASCADE,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    application_status application_status_enum DEFAULT 'Applied',
    cover_letter TEXT,
    resume_url VARCHAR(500),
    match_score NUMERIC(5,2) CHECK (match_score >= 0 AND match_score <= 100),
    reviewer_notes TEXT,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(job_id, student_id)
);

-- Recommended Candidates (System-generated)
CREATE TABLE recommended_candidates (
    recommendation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES job_postings(job_id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES student_profiles(student_id) ON DELETE CASCADE,
    match_score NUMERIC(5,2) NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
    matched_skills UUID[], -- Array of skill_ids
    leaderboard_rank INTEGER,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(job_id, student_id)
);

-- ============================================
-- 7. ANALYTICS & REPORTING SCHEMA
-- ============================================

-- Learning Analytics (Time-series data)
CREATE TABLE learning_analytics (
    analytics_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES student_profiles(student_id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills_master(skill_id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL,
    total_study_time_minutes INTEGER DEFAULT 0,
    assessments_completed SMALLINT DEFAULT 0,
    average_score NUMERIC(5,2),
    skill_progress_percentage SMALLINT CHECK (skill_progress_percentage >= 0 AND skill_progress_percentage <= 100),
    strength_areas JSONB, -- Array of topics
    weakness_areas JSONB, -- Array of topics
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, skill_id, week_start_date)
);

-- Career Insights
CREATE TABLE career_insights (
    insight_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES student_profiles(student_id) ON DELETE CASCADE,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    career_path VARCHAR(255),
    required_skills JSONB, -- Array of {skill_id, skill_name}
    skill_gaps JSONB, -- Array of {skill_id, skill_name, gap_percentage}
    recommended_courses UUID[], -- Array of course_ids
    industry_trends TEXT,
    salary_expectations JSONB, -- {min, max, currency, role}
    confidence_score NUMERIC(5,2) CHECK (confidence_score >= 0 AND confidence_score <= 100)
);

-- Platform Activity Logs (Partitioned by month)
CREATE TABLE platform_activity_logs (
    log_id UUID DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    activity_type VARCHAR(100) NOT NULL,
    activity_details JSONB,
    ip_address INET,
    device_info JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (log_id, timestamp)
) PARTITION BY RANGE (timestamp);

-- Create partitions for activity logs (example for 2025)
CREATE TABLE platform_activity_logs_2025_q1 PARTITION OF platform_activity_logs
    FOR VALUES FROM ('2025-01-01') TO ('2025-04-01');
CREATE TABLE platform_activity_logs_2025_q2 PARTITION OF platform_activity_logs
    FOR VALUES FROM ('2025-04-01') TO ('2025-07-01');
CREATE TABLE platform_activity_logs_2025_q3 PARTITION OF platform_activity_logs
    FOR VALUES FROM ('2025-07-01') TO ('2025-10-01');
CREATE TABLE platform_activity_logs_2025_q4 PARTITION OF platform_activity_logs
    FOR VALUES FROM ('2025-10-01') TO ('2026-01-01');

-- ============================================
-- 8. NOTIFICATION & MESSAGING SCHEMA
-- ============================================

CREATE TYPE notification_type_enum AS ENUM ('System', 'Course_Update', 'Job_Match', 'Assessment_Due', 'Achievement', 'Message', 'Application_Update');

-- Notifications
CREATE TABLE notifications (
    notification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    notification_type notification_type_enum NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP WITH TIME ZONE
);

-- Messages (Platform communication)
CREATE TABLE messages (
    message_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    subject VARCHAR(255),
    message_body TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP WITH TIME ZONE,
    parent_message_id UUID REFERENCES messages(message_id) ON DELETE SET NULL
);

-- ============================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================

-- User Management Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(user_role);
CREATE INDEX idx_users_status ON users(account_status);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Student Profile Indexes
CREATE INDEX idx_student_profiles_name ON student_profiles(first_name, last_name);
CREATE INDEX idx_student_profiles_education_level ON student_profiles(current_education_level);

-- Skills Indexes
CREATE INDEX idx_skills_master_name ON skills_master(skill_name);
CREATE INDEX idx_skills_master_category ON skills_master(skill_category);
CREATE INDEX idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX idx_user_skills_skill_id ON user_skills(skill_id);
CREATE INDEX idx_user_skills_verification ON user_skills(verification_status);
CREATE INDEX idx_user_skills_composite ON user_skills(user_id, skill_id, verification_status);

-- Assessment Indexes
CREATE INDEX idx_assessments_skill ON skill_assessments(skill_id);
CREATE INDEX idx_assessments_active ON skill_assessments(is_active);
CREATE INDEX idx_assessment_attempts_user ON user_assessment_attempts(user_id);
CREATE INDEX idx_assessment_attempts_assessment ON user_assessment_attempts(assessment_id);
CREATE INDEX idx_assessment_attempts_passed ON user_assessment_attempts(is_passed);
CREATE INDEX idx_assessment_attempts_composite ON user_assessment_attempts(user_id, assessment_id, is_passed);

-- Leaderboard Indexes
CREATE INDEX idx_student_leaderboard_rank ON student_leaderboard(skill_id, overall_rank);
CREATE INDEX idx_student_leaderboard_score ON student_leaderboard(skill_id, skill_score DESC);
CREATE INDEX idx_educator_leaderboard_rank ON educator_leaderboard(skill_id, overall_rank);
CREATE INDEX idx_educator_leaderboard_score ON educator_leaderboard(skill_id, skill_score DESC);

-- Course Indexes
CREATE INDEX idx_courses_educator ON courses(educator_id);
CREATE INDEX idx_courses_skill ON courses(skill_id);
CREATE INDEX idx_courses_status ON courses(course_status);
CREATE INDEX idx_courses_rating ON courses(average_rating DESC);
CREATE INDEX idx_course_enrollments_student ON course_enrollments(student_id);
CREATE INDEX idx_course_enrollments_status ON course_enrollments(status);

-- Job Indexes
CREATE INDEX idx_jobs_company ON job_postings(company_id);
CREATE INDEX idx_jobs_status ON job_postings(job_status);
CREATE INDEX idx_jobs_posted_date ON job_postings(posted_date DESC);
CREATE INDEX idx_jobs_required_skills ON job_postings USING GIN(required_skills);
CREATE INDEX idx_applications_job ON job_applications(job_id);
CREATE INDEX idx_applications_student ON job_applications(student_id);
CREATE INDEX idx_applications_status ON job_applications(application_status);
CREATE INDEX idx_applications_composite ON job_applications(job_id, application_status);
CREATE INDEX idx_recommended_candidates_job ON recommended_candidates(job_id, match_score DESC);

-- Analytics Indexes
CREATE INDEX idx_learning_analytics_student ON learning_analytics(student_id, week_start_date DESC);
CREATE INDEX idx_career_insights_student ON career_insights(student_id, generated_at DESC);
CREATE INDEX idx_activity_logs_user ON platform_activity_logs(user_id, timestamp DESC);
CREATE INDEX idx_activity_logs_type ON platform_activity_logs(activity_type, timestamp DESC);

-- Notification Indexes
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id, sent_at DESC);
CREATE INDEX idx_messages_receiver ON messages(receiver_id, is_read, sent_at DESC);

-- ============================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_profiles_updated_at BEFORE UPDATE ON student_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_educator_profiles_updated_at BEFORE UPDATE ON educator_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_profiles_updated_at BEFORE UPDATE ON company_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skill_assessments_updated_at BEFORE UPDATE ON skill_assessments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update leaderboard after assessment completion
CREATE OR REPLACE FUNCTION update_leaderboard_after_assessment()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_passed = TRUE AND NEW.end_time IS NOT NULL THEN
        -- Update student leaderboard
        INSERT INTO student_leaderboard (student_id, skill_id, skill_score, total_assessments_taken, average_score, last_updated)
        SELECT 
            NEW.user_id,
            sa.skill_id,
            COALESCE(SUM(uaa.score), 0) as skill_score,
            COUNT(DISTINCT uaa.attempt_id) as total_assessments,
            AVG(uaa.score) as avg_score,
            CURRENT_TIMESTAMP
        FROM user_assessment_attempts uaa
        JOIN skill_assessments sa ON uaa.assessment_id = sa.assessment_id
        WHERE uaa.user_id = NEW.user_id 
          AND sa.skill_id = (SELECT skill_id FROM skill_assessments WHERE assessment_id = NEW.assessment_id)
          AND uaa.is_passed = TRUE
        GROUP BY NEW.user_id, sa.skill_id
        ON CONFLICT (student_id, skill_id) 
        DO UPDATE SET
            skill_score = EXCLUDED.skill_score,
            total_assessments_taken = EXCLUDED.total_assessments_taken,
            average_score = EXCLUDED.average_score,
            last_updated = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_leaderboard 
AFTER INSERT OR UPDATE ON user_assessment_attempts
FOR EACH ROW EXECUTE FUNCTION update_leaderboard_after_assessment();

-- Trigger to update course enrollment count
CREATE OR REPLACE FUNCTION update_course_enrollment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE courses 
        SET enrollment_count = enrollment_count + 1 
        WHERE course_id = NEW.course_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE courses 
        SET enrollment_count = GREATEST(enrollment_count - 1, 0)
        WHERE course_id = OLD.course_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_enrollment_count
AFTER INSERT OR DELETE ON course_enrollments
FOR EACH ROW EXECUTE FUNCTION update_course_enrollment_count();

-- Trigger to update course average rating
CREATE OR REPLACE FUNCTION update_course_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE courses
    SET average_rating = (
        SELECT AVG(rating)
        FROM course_reviews
        WHERE course_id = COALESCE(NEW.course_id, OLD.course_id)
    )
    WHERE course_id = COALESCE(NEW.course_id, OLD.course_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_course_rating
AFTER INSERT OR UPDATE OR DELETE ON course_reviews
FOR EACH ROW EXECUTE FUNCTION update_course_rating();

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- Comprehensive Student Profile View
CREATE VIEW v_student_complete_profile AS
SELECT 
    u.user_id,
    u.email,
    u.account_status,
    u.profile_completion_percentage,
    sp.first_name,
    sp.last_name,
    sp.date_of_birth,
    sp.phone_number,
    sp.current_education_level,
    sp.career_goals,
    sp.profile_picture_url,
    sp.resume_url,
    COUNT(DISTINCT us.skill_id) as total_skills,
    COUNT(DISTINCT us.skill_id) FILTER (WHERE us.verification_status = 'Verified') as verified_skills,
    COUNT(DISTINCT ce.course_id) as enrolled_courses,
    COUNT(DISTINCT ce.course_id) FILTER (WHERE ce.status = 'Completed') as completed_courses
FROM users u
JOIN student_profiles sp ON u.user_id = sp.student_id
LEFT JOIN user_skills us ON u.user_id = us.user_id
LEFT JOIN course_enrollments ce ON sp.student_id = ce.student_id
WHERE u.user_role = 'Student'
GROUP BY u.user_id, u.email, u.account_status, u.profile_completion_percentage,
    sp.first_name, sp.last_name, sp.date_of_birth, sp.phone_number, 
    sp.current_education_level, sp.career_goals, sp.profile_picture_url, sp.resume_url;

-- Course Statistics View
CREATE VIEW v_course_statistics AS
SELECT 
    c.course_id,
    c.course_name,
    c.educator_id,
    ep.first_name || ' ' || ep.last_name as educator_name,
    c.difficulty_level,
    c.course_status,
    c.price,
    c.enrollment_count,
    c.average_rating,
    COUNT(DISTINCT cm.module_id) as total_modules,
    COUNT(DISTINCT cc.content_id) as total_content_items,
    COUNT(DISTINCT cr.review_id) as total_reviews,
    COUNT(DISTINCT ce.enrollment_id) FILTER (WHERE ce.status = 'Completed') as completed_enrollments
FROM courses c
JOIN educator_profiles ep ON c.educator_id = ep.educator_id
LEFT JOIN course_modules cm ON c.course_id = cm.course_id
LEFT JOIN course_content cc ON cm.module_id = cc.module_id
LEFT JOIN course_reviews cr ON c.course_id = cr.course_id
LEFT JOIN course_enrollments ce ON c.course_id = ce.course_id
GROUP BY c.course_id, c.course_name, c.educator_id, ep.first_name, ep.last_name,
    c.difficulty_level, c.course_status, c.price, c.enrollment_count, c.average_rating;

-- Top Performers by Skill View
CREATE VIEW v_top_performers_by_skill AS
SELECT 
    sl.skill_id,
    sm.skill_name,
    sm.skill_category,
    sl.student_id,
    sp.first_name || ' ' || sp.last_name as student_name,
    sl.overall_rank,
    sl.skill_score,
    sl.average_score,
    sl.total_assessments_taken,
    ROW_NUMBER() OVER (PARTITION BY sl.skill_id ORDER BY sl.skill_score DESC) as rank_within_skill
FROM student_leaderboard sl
JOIN skills_master sm ON sl.skill_id = sm.skill_id
JOIN student_profiles sp ON sl.student_id = sp.student_id
WHERE sl.skill_score > 0;

-- Active Job Listings with Required Skills View
CREATE VIEW v_active_jobs_with_skills AS
SELECT 
    jp.job_id,
    jp.job_title,
    cp.company_name,
    jp.employment_type,
    jp.experience_level,
    jp.location,
    jp.salary_range,
    jp.posted_date,
    jp.application_deadline,
    ARRAY_AGG(DISTINCT sm.skill_name) as required_skill_names,
    COUNT(DISTINCT ja.application_id) as total_applications,
    COUNT(DISTINCT ja.application_id) FILTER (WHERE ja.application_status = 'Shortlisted') as shortlisted_count
FROM job_postings jp
JOIN company_profiles cp ON jp.company_id = cp.company_id
LEFT JOIN LATERAL UNNEST(jp.required_skills) AS unnested_skill(skill_id) ON true
LEFT JOIN skills_master sm ON sm.skill_id = unnested_skill.skill_id
LEFT JOIN job_applications ja ON jp.job_id = ja.job_id
WHERE jp.job_status = 'Open'
GROUP BY jp.job_id, jp.job_title, cp.company_name, jp.employment_type, 
    jp.experience_level, jp.location, jp.salary_range, jp.posted_date, jp.application_deadline;

-- Student Learning Progress View
CREATE VIEW v_student_learning_progress AS
SELECT 
    sp.student_id,
    sp.first_name || ' ' || sp.last_name as student_name,
    COUNT(DISTINCT ce.course_id) as total_enrolled_courses,
    AVG(ce.completion_percentage) as avg_completion_percentage,
    COUNT(DISTINCT uaa.assessment_id) as total_assessments_taken,
    COUNT(DISTINCT uaa.assessment_id) FILTER (WHERE uaa.is_passed = TRUE) as passed_assessments,
    AVG(uaa.score) FILTER (WHERE uaa.is_passed = TRUE) as avg_assessment_score,
    COUNT(DISTINCT us.skill_id) FILTER (WHERE us.verification_status = 'Verified') as verified_skills_count
FROM student_profiles sp
LEFT JOIN course_enrollments ce ON sp.student_id = ce.student_id
LEFT JOIN user_assessment_attempts uaa ON sp.student_id = uaa.user_id
LEFT JOIN user_skills us ON sp.student_id = us.user_id
GROUP BY sp.student_id, sp.first_name, sp.last_name;

-- ============================================
-- MATERIALIZED VIEWS FOR EXPENSIVE QUERIES
-- ============================================

-- Materialized view for global leaderboard rankings
CREATE MATERIALIZED VIEW mv_global_student_rankings AS
SELECT 
    sl.student_id,
    sp.first_name || ' ' || sp.last_name as student_name,
    sl.skill_id,
    sm.skill_name,
    sm.skill_category,
    sl.skill_score,
    sl.average_score,
    sl.total_assessments_taken,
    RANK() OVER (PARTITION BY sl.skill_id ORDER BY sl.skill_score DESC) as skill_rank,
    PERCENT_RANK() OVER (PARTITION BY sl.skill_id ORDER BY sl.skill_score DESC) as percentile
FROM student_leaderboard sl
JOIN student_profiles sp ON sl.student_id = sp.student_id
JOIN skills_master sm ON sl.skill_id = sm.skill_id
WHERE sl.skill_score > 0;

CREATE UNIQUE INDEX idx_mv_global_rankings ON mv_global_student_rankings(student_id, skill_id);
CREATE INDEX idx_mv_global_rankings_skill ON mv_global_student_rankings(skill_id, skill_rank);

-- Materialized view for educator performance
CREATE MATERIALIZED VIEW mv_educator_performance AS
SELECT 
    ep.educator_id,
    ep.first_name || ' ' || ep.last_name as educator_name,
    ep.years_of_experience,
    COUNT(DISTINCT c.course_id) as total_courses,
    SUM(c.enrollment_count) as total_students_taught,
    AVG(c.average_rating) as overall_rating,
    COUNT(DISTINCT cr.review_id) as total_reviews,
    COUNT(DISTINCT el.skill_id) as skills_taught,
    MAX(el.skill_score) as highest_skill_score
FROM educator_profiles ep
LEFT JOIN courses c ON ep.educator_id = c.educator_id
LEFT JOIN course_reviews cr ON c.course_id = cr.course_id
LEFT JOIN educator_leaderboard el ON ep.educator_id = el.educator_id
GROUP BY ep.educator_id, ep.first_name, ep.last_name, ep.years_of_experience;

CREATE UNIQUE INDEX idx_mv_educator_performance ON mv_educator_performance(educator_id);

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_leaderboard_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_global_student_rankings;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_educator_performance;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SAMPLE SEED DATA
-- ============================================

-- Insert Sample Skills
INSERT INTO skills_master (skill_name, skill_category, difficulty_level, description) VALUES
('Python', 'Programming', 'Intermediate', 'High-level programming language'),
('JavaScript', 'Programming', 'Intermediate', 'Web programming language'),
('React', 'Programming', 'Advanced', 'JavaScript library for building UIs'),
('Node.js', 'Programming', 'Advanced', 'JavaScript runtime environment'),
('MongoDB', 'Data_Science', 'Intermediate', 'NoSQL database'),
('Express.js', 'Programming', 'Intermediate', 'Web framework for Node.js'),
('PostgreSQL', 'Data_Science', 'Advanced', 'Relational database'),
('Machine Learning', 'Data_Science', 'Expert', 'AI and ML algorithms'),
('UI/UX Design', 'Design', 'Intermediate', 'User interface and experience design'),
('Project Management', 'Business', 'Intermediate', 'Managing projects and teams'),
('Communication', 'Soft_Skills', 'Beginner', 'Effective communication skills'),
('Leadership', 'Soft_Skills', 'Advanced', 'Team leadership and management');

-- Insert Sample Users (Students)
INSERT INTO users (email, password_hash, user_role, account_status, profile_completion_percentage) VALUES
('john.doe@email.com', crypt('password123', gen_salt('bf')), 'Student', 'Active', 85),
('jane.smith@email.com', crypt('password123', gen_salt('bf')), 'Student', 'Active', 90),
('alex.johnson@email.com', crypt('password123', gen_salt('bf')), 'Student', 'Active', 75);

-- Insert Sample Student Profiles
INSERT INTO student_profiles (student_id, first_name, last_name, date_of_birth, gender, current_education_level, career_goals)
SELECT 
    user_id,
    CASE 
        WHEN email = 'john.doe@email.com' THEN 'John'
        WHEN email = 'jane.smith@email.com' THEN 'Jane'
        ELSE 'Alex'
    END,
    CASE 
        WHEN email = 'john.doe@email.com' THEN 'Doe'
        WHEN email = 'jane.smith@email.com' THEN 'Smith'
        ELSE 'Johnson'
    END,
    '2000-05-15',
    'Male',
    'Undergraduate',
    'Become a full-stack developer'
FROM users WHERE user_role = 'Student';

-- Insert Sample Educators
INSERT INTO users (email, password_hash, user_role, account_status, profile_completion_percentage) VALUES
('prof.wilson@edu.com', crypt('password123', gen_salt('bf')), 'Educator', 'Active', 95);

INSERT INTO educator_profiles (educator_id, first_name, last_name, years_of_experience, verification_status, approval_date)
SELECT 
    user_id,
    'Sarah',
    'Wilson',
    10.5,
    'Verified',
    CURRENT_DATE
FROM users WHERE email = 'prof.wilson@edu.com';

-- Insert Sample Company
INSERT INTO users (email, password_hash, user_role, account_status) VALUES
('hr@techcorp.com', crypt('password123', gen_salt('bf')), 'Company', 'Active');

INSERT INTO company_profiles (company_id, company_name, industry, company_size, verification_status)
SELECT 
    user_id,
    'TechCorp Solutions',
    'Information Technology',
    '201-500',
    'Verified'
FROM users WHERE email = 'hr@techcorp.com';

-- ============================================
-- STORED PROCEDURES & FUNCTIONS
-- ============================================

-- Function to calculate student-job match score
CREATE OR REPLACE FUNCTION calculate_job_match_score(
    p_student_id UUID,
    p_job_id UUID
)
RETURNS NUMERIC AS $$
DECLARE
    required_skills_count INTEGER;
    matched_skills_count INTEGER;
    verified_skills_count INTEGER;
    avg_leaderboard_rank NUMERIC;
    match_score NUMERIC;
BEGIN
    -- Get required skills count
    SELECT array_length(required_skills, 1) INTO required_skills_count
    FROM job_postings WHERE job_id = p_job_id;
    
    -- Count matched skills
    SELECT COUNT(*) INTO matched_skills_count
    FROM user_skills us
    JOIN job_postings jp ON us.skill_id = ANY(jp.required_skills)
    WHERE us.user_id = p_student_id AND jp.job_id = p_job_id;
    
    -- Count verified skills
    SELECT COUNT(*) INTO verified_skills_count
    FROM user_skills us
    JOIN job_postings jp ON us.skill_id = ANY(jp.required_skills)
    WHERE us.user_id = p_student_id 
      AND jp.job_id = p_job_id
      AND us.verification_status = 'Verified';
    
    -- Get average leaderboard rank for matched skills
    SELECT AVG(COALESCE(overall_rank, 1000)) INTO avg_leaderboard_rank
    FROM student_leaderboard sl
    JOIN job_postings jp ON sl.skill_id = ANY(jp.required_skills)
    WHERE sl.student_id = p_student_id AND jp.job_id = p_job_id;
    
    -- Calculate weighted match score (0-100)
    match_score := (
        (matched_skills_count::NUMERIC / NULLIF(required_skills_count, 0) * 40) +
        (verified_skills_count::NUMERIC / NULLIF(required_skills_count, 0) * 30) +
        (CASE 
            WHEN avg_leaderboard_rank <= 10 THEN 30
            WHEN avg_leaderboard_rank <= 50 THEN 20
            WHEN avg_leaderboard_rank <= 100 THEN 10
            ELSE 5
        END)
    );
    
    RETURN COALESCE(match_score, 0);
END;
$$ LANGUAGE plpgsql;

-- Procedure to generate candidate recommendations for a job
CREATE OR REPLACE PROCEDURE generate_job_recommendations(p_job_id UUID)
LANGUAGE plpgsql AS $$
BEGIN
    -- Clear existing recommendations
    DELETE FROM recommended_candidates WHERE job_id = p_job_id;
    
    -- Generate new recommendations
    INSERT INTO recommended_candidates (job_id, student_id, match_score, matched_skills, leaderboard_rank)
    SELECT 
        p_job_id,
        sp.student_id,
        calculate_job_match_score(sp.student_id, p_job_id) as match_score,
        ARRAY(
            SELECT us.skill_id 
            FROM user_skills us
            JOIN job_postings jp ON us.skill_id = ANY(jp.required_skills)
            WHERE us.user_id = sp.student_id 
              AND jp.job_id = p_job_id
              AND us.verification_status = 'Verified'
        ) as matched_skills,
        MIN(sl.overall_rank) as best_rank
    FROM student_profiles sp
    JOIN users u ON sp.student_id = u.user_id
    LEFT JOIN student_leaderboard sl ON sp.student_id = sl.student_id
    WHERE u.account_status = 'Active'
    GROUP BY sp.student_id
    HAVING calculate_job_match_score(sp.student_id, p_job_id) >= 50
    ORDER BY match_score DESC
    LIMIT 50;
END;
$$;

-- Function to update leaderboard ranks
CREATE OR REPLACE FUNCTION update_leaderboard_ranks()
RETURNS void AS $$
BEGIN
    -- Update student leaderboard ranks
    UPDATE student_leaderboard sl
    SET overall_rank = ranked.rank
    FROM (
        SELECT 
            leaderboard_id,
            RANK() OVER (PARTITION BY skill_id ORDER BY skill_score DESC) as rank
        FROM student_leaderboard
    ) ranked
    WHERE sl.leaderboard_id = ranked.leaderboard_id;
    
    -- Update educator leaderboard ranks
    UPDATE educator_leaderboard el
    SET overall_rank = ranked.rank
    FROM (
        SELECT 
            leaderboard_id,
            RANK() OVER (PARTITION BY skill_id ORDER BY skill_score DESC) as rank
        FROM educator_leaderboard
    ) ranked
    WHERE el.leaderboard_id = ranked.leaderboard_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SECURITY & ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on sensitive tables
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE educator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_assessment_answers ENABLE ROW LEVEL SECURITY;

-- Example RLS Policy: Students can only see their own data
CREATE POLICY student_profile_access ON student_profiles
    FOR ALL
    USING (student_id = current_setting('app.current_user_id')::UUID);

-- Example RLS Policy: Educators can only modify their own courses
CREATE POLICY educator_course_access ON courses
    FOR ALL
    USING (educator_id = current_setting('app.current_user_id')::UUID);

-- Create audit log table
CREATE TABLE audit_logs (
    audit_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    operation VARCHAR(10) NOT NULL, -- INSERT, UPDATE, DELETE
    old_values JSONB,
    new_values JSONB,
    changed_by UUID REFERENCES users(user_id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_table ON audit_logs(table_name, changed_at DESC);
CREATE INDEX idx_audit_logs_record ON audit_logs(record_id);

-- Generic audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (table_name, record_id, operation, new_values)
        VALUES (TG_TABLE_NAME, NEW.user_id, 'INSERT', row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (table_name, record_id, operation, old_values, new_values)
        VALUES (TG_TABLE_NAME, NEW.user_id, 'UPDATE', row_to_json(OLD), row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (table_name, record_id, operation, old_values)
        VALUES (TG_TABLE_NAME, OLD.user_id, 'DELETE', row_to_json(OLD));
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to critical tables
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- ============================================
-- PERFORMANCE MONITORING QUERIES
-- ============================================

-- Query to identify slow queries
CREATE VIEW v_slow_queries AS
SELECT 
    query,
    calls,
    total_exec_time,
    mean_exec_time,
    max_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC
LIMIT 20;


COMMENT ON TABLE users IS 'Base table for all platform users (students, educators, companies)';
COMMENT ON TABLE student_profiles IS 'Extended profile information for student users';
COMMENT ON TABLE skill_assessments IS 'Skill verification tests with proctoring';
COMMENT ON TABLE student_leaderboard IS 'Technology-specific rankings for students';
COMMENT ON TABLE recommended_candidates IS 'AI-generated job-candidate matches';
COMMENT ON FUNCTION calculate_job_match_score IS 'Calculates compatibility between student skills and job requirements';
