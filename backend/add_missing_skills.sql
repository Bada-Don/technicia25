-- Add missing skills for question banks
-- Run this in your Supabase SQL Editor

INSERT INTO skills_master (skill_name, skill_category, difficulty_level, description) VALUES
('Data Structures', 'Programming', 'Intermediate', 'Fundamental data structures including arrays, linked lists, trees, graphs, and algorithms'),
('DevOps', 'Engineering', 'Advanced', 'DevOps practices, CI/CD, containerization, orchestration, and cloud infrastructure'),
('System Design', 'Engineering', 'Advanced', 'System architecture, scalability, distributed systems, and design patterns'),
('SQL', 'Data_Science', 'Intermediate', 'Structured Query Language for database management and data manipulation');
