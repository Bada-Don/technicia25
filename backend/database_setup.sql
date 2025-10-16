-- Technicia Platform - Database Schema for Proctored Test System
-- Run this in Supabase SQL Editor

-- =====================================================
-- 1. TEST QUESTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS test_questions (
    question_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    skill_id UUID NOT NULL REFERENCES skills_master(skill_id) ON DELETE CASCADE,
    question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('MCQ', 'Coding', 'ShortAnswer')),
    difficulty_level VARCHAR(20) NOT NULL CHECK (difficulty_level IN ('Easy', 'Medium', 'Hard')),
    question_text TEXT NOT NULL,
    options JSONB,  -- For MCQ: [{"option_id": "A", "option_text": "..."}, ...]
    correct_answer TEXT,  -- For MCQ: option_id, For others: expected answer
    points INTEGER DEFAULT 1,
    time_limit_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster question retrieval
CREATE INDEX IF NOT EXISTS idx_test_questions_skill_id ON test_questions(skill_id);
CREATE INDEX IF NOT EXISTS idx_test_questions_type ON test_questions(question_type);
CREATE INDEX IF NOT EXISTS idx_test_questions_difficulty ON test_questions(difficulty_level);

-- =====================================================
-- 2. TEST SESSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS test_sessions (
    session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills_master(skill_id) ON DELETE CASCADE,
    is_proctored BOOLEAN DEFAULT TRUE,
    status VARCHAR(20) NOT NULL DEFAULT 'NotStarted' CHECK (status IN ('NotStarted', 'InProgress', 'Completed', 'Abandoned')),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    total_questions INTEGER NOT NULL,
    total_score INTEGER NOT NULL,
    obtained_score INTEGER,
    percentage DECIMAL(5,2),
    verification_status VARCHAR(20) DEFAULT 'Unverified' CHECK (verification_status IN ('Unverified', 'Verified', 'Failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_test_sessions_user_id ON test_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_test_sessions_skill_id ON test_sessions(skill_id);
CREATE INDEX IF NOT EXISTS idx_test_sessions_status ON test_sessions(status);
CREATE INDEX IF NOT EXISTS idx_test_sessions_verification ON test_sessions(verification_status);

-- =====================================================
-- 3. SESSION QUESTIONS MAPPING TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS session_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES test_sessions(session_id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES test_questions(question_id) ON DELETE CASCADE,
    question_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(session_id, question_id)
);

-- Index for efficient retrieval
CREATE INDEX IF NOT EXISTS idx_session_questions_session_id ON session_questions(session_id);
CREATE INDEX IF NOT EXISTS idx_session_questions_order ON session_questions(session_id, question_order);

-- =====================================================
-- 4. TEST ANSWERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS test_answers (
    answer_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES test_sessions(session_id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES test_questions(question_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    answer TEXT NOT NULL,
    is_correct BOOLEAN,  -- NULL for answers needing manual grading
    points_earned INTEGER DEFAULT 0,
    time_taken_seconds INTEGER,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(session_id, question_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_test_answers_session_id ON test_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_test_answers_user_id ON test_answers(user_id);

-- =====================================================
-- 5. PROCTORING VIOLATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS proctoring_violations (
    violation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES test_sessions(session_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    violation_type VARCHAR(50) NOT NULL,  -- 'TabSwitch', 'MultipleFaces', 'NoFace', 'FaceNotMatched'
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('Low', 'Medium', 'High')),
    details JSONB,
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_proctoring_violations_session_id ON proctoring_violations(session_id);
CREATE INDEX IF NOT EXISTS idx_proctoring_violations_user_id ON proctoring_violations(user_id);
CREATE INDEX IF NOT EXISTS idx_proctoring_violations_type ON proctoring_violations(violation_type);
CREATE INDEX IF NOT EXISTS idx_proctoring_violations_occurred_at ON proctoring_violations(occurred_at);

-- =====================================================
-- 6. FACE VERIFICATION LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS face_verification_logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES test_sessions(session_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    verified BOOLEAN NOT NULL,
    confidence DECIMAL(5,2),
    error TEXT,
    captured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_face_verification_logs_session_id ON face_verification_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_face_verification_logs_user_id ON face_verification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_face_verification_logs_captured_at ON face_verification_logs(captured_at);

-- =====================================================
-- 7. UPDATE STUDENT PROFILES FOR PROFILE PICTURE
-- =====================================================
ALTER TABLE student_profiles 
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

-- =====================================================
-- 8. UPDATE COMPANY PROFILES FOR PROFILE PICTURE
-- =====================================================
ALTER TABLE company_profiles 
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

-- =====================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE proctoring_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE face_verification_logs ENABLE ROW LEVEL SECURITY;

-- Test Questions Policies (Read only for authenticated users)
CREATE POLICY "Anyone can view test questions" ON test_questions
    FOR SELECT USING (true);

-- Test Sessions Policies (Users can only access their own sessions)
CREATE POLICY "Users can view their own test sessions" ON test_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own test sessions" ON test_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own test sessions" ON test_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Session Questions Policies
CREATE POLICY "Users can view questions for their sessions" ON session_questions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM test_sessions 
            WHERE test_sessions.session_id = session_questions.session_id 
            AND test_sessions.user_id = auth.uid()
        )
    );

-- Test Answers Policies
CREATE POLICY "Users can view their own answers" ON test_answers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can submit their own answers" ON test_answers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own answers" ON test_answers
    FOR UPDATE USING (auth.uid() = user_id);

-- Proctoring Violations Policies
CREATE POLICY "Users can view their own violations" ON proctoring_violations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can log violations" ON proctoring_violations
    FOR INSERT WITH CHECK (true);

-- Face Verification Logs Policies
CREATE POLICY "Users can view their own face verification logs" ON face_verification_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create face verification logs" ON face_verification_logs
    FOR INSERT WITH CHECK (true);

-- =====================================================
-- 10. SAMPLE TEST QUESTIONS (FOR TESTING)
-- =====================================================
-- You'll need to insert your actual skill_id values here
-- Example for Python skill:

-- INSERT INTO test_questions (skill_id, question_type, difficulty_level, question_text, options, correct_answer, points)
-- VALUES 
-- (
--     'YOUR_PYTHON_SKILL_ID',
--     'MCQ',
--     'Easy',
--     'What is the output of: print(type([]))?',
--     '[
--         {"option_id": "A", "option_text": "<class ''list''>"},
--         {"option_id": "B", "option_text": "<class ''tuple''>"},
--         {"option_id": "C", "option_text": "<class ''dict''>"},
--         {"option_id": "D", "option_text": "<class ''set''>"}
--     ]'::jsonb,
--     'A',
--     1
-- );

-- =====================================================
-- 11. HELPER FUNCTIONS
-- =====================================================

-- Function to calculate test percentage
CREATE OR REPLACE FUNCTION calculate_test_percentage(
    p_session_id UUID
)
RETURNS DECIMAL AS $$
DECLARE
    v_total_score INTEGER;
    v_obtained_score INTEGER;
    v_percentage DECIMAL;
BEGIN
    SELECT total_score, obtained_score 
    INTO v_total_score, v_obtained_score
    FROM test_sessions 
    WHERE session_id = p_session_id;
    
    IF v_total_score > 0 THEN
        v_percentage := (v_obtained_score::DECIMAL / v_total_score::DECIMAL) * 100;
    ELSE
        v_percentage := 0;
    END IF;
    
    RETURN ROUND(v_percentage, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to get violation count for a session
CREATE OR REPLACE FUNCTION get_violation_count(
    p_session_id UUID
)
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) 
    INTO v_count
    FROM proctoring_violations 
    WHERE session_id = p_session_id;
    
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 12. TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_test_questions_updated_at BEFORE UPDATE ON test_questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_test_sessions_updated_at BEFORE UPDATE ON test_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 13. STORAGE BUCKET SETUP (Run in Supabase Dashboard)
-- =====================================================
-- Go to Storage > Create a new bucket
-- Bucket name: "Profile Picture Storage"
-- Public bucket: Yes
-- File size limit: 5MB
-- Allowed MIME types: image/jpeg, image/jpg, image/png, image/webp

-- Storage Policies (Apply these in Storage settings)
-- 1. Allow authenticated users to upload their own pictures:
--    Policy name: "Users can upload their own profile pictures"
--    INSERT: (bucket_id = 'Profile Picture Storage' AND auth.uid()::text = (storage.foldername(name))[1])
--
-- 2. Allow public read access:
--    Policy name: "Public read access"
--    SELECT: bucket_id = 'Profile Picture Storage'
--
-- 3. Allow users to update their own pictures:
--    Policy name: "Users can update their own profile pictures"
--    UPDATE: (bucket_id = 'Profile Picture Storage' AND auth.uid()::text = (storage.foldername(name))[1])
--
-- 4. Allow users to delete their own pictures:
--    Policy name: "Users can delete their own profile pictures"
--    DELETE: (bucket_id = 'Profile Picture Storage' AND auth.uid()::text = (storage.foldername(name))[1])

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- Next steps:
-- 1. Install Python dependencies: pip install -r requirements.txt
-- 2. Start backend server: uvicorn main:app --reload
-- 3. Start frontend: npm run dev
-- 4. Upload profile picture in profile page
-- 5. Add test questions for your skills
-- 6. Take a proctored test!
