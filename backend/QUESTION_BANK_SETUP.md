# Question Bank Setup Guide

## Step 1: List Available Skills

First, see what skills exist in your database:

```powershell
python import_questions.py --list-skills
```

This will show you all skills with their IDs.

## Step 2: Generate Questions Using AI

### Prompt for AI (ChatGPT/Claude/Gemini):

```
I need you to generate 50 multiple-choice questions (MCQs) for testing knowledge in: Python Programming

Requirements:
- Generate exactly 50 questions
- Mix difficulty: 20 Easy, 20 Medium, 10 Hard
- Each question must have 4 options (A, B, C, D)
- Mark the correct answer clearly
- Questions should be practical and test real understanding
- Each question is worth 1 point

Output format (JSON):
[
  {
    "question_type": "MCQ",
    "difficulty_level": "Easy",
    "question_text": "What is the output of print(type([]))?",
    "options": [
      {"option_id": "A", "option_text": "<class 'list'>"},
      {"option_id": "B", "option_text": "<class 'dict'>"},
      {"option_id": "C", "option_text": "<class 'tuple'>"},
      {"option_id": "D", "option_text": "<class 'set'>"}
    ],
    "correct_answer": "A",
    "points": 1,
    "time_limit_seconds": 60
  }
]

Generate all 50 questions in this exact JSON format.
```

### Save the Output:
1. Copy the AI's JSON response
2. Save it to a file: `questions_python.json` (or whatever skill name)

## Step 3: Import Questions to Database

```powershell
python import_questions.py questions_python.json <SKILL_ID>
```

Replace `<SKILL_ID>` with the actual UUID from Step 1.

### Example:
```powershell
python import_questions.py questions_python.json 550e8400-e29b-41d4-a716-446655440000
```

## Step 4: Verify Import

The script will show:
- ✅ Number of questions loaded
- ✅ Skill verification
- ✅ Import progress
- 🎉 Success message

## Quick Tips

### For Multiple Skills:
```powershell
# Generate and import for each skill
python import_questions.py questions_python.json <python_skill_id>
python import_questions.py questions_javascript.json <js_skill_id>
python import_questions.py questions_react.json <react_skill_id>
```

### Troubleshooting:
- **File not found**: Make sure the JSON file is in the backend directory
- **Invalid JSON**: Check for syntax errors in the AI output
- **Skill not found**: Run `--list-skills` to verify the skill_id
- **Connection error**: Check your `.env` file has SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY

## Sample Question Format

```json
[
  {
    "question_type": "MCQ",
    "difficulty_level": "Easy",
    "question_text": "Which keyword is used to define a function in Python?",
    "options": [
      {"option_id": "A", "option_text": "def"},
      {"option_id": "B", "option_text": "function"},
      {"option_id": "C", "option_text": "define"},
      {"option_id": "D", "option_text": "func"}
    ],
    "correct_answer": "A",
    "points": 1,
    "time_limit_seconds": 60
  },
  {
    "question_type": "MCQ",
    "difficulty_level": "Medium",
    "question_text": "What is the time complexity of list.append() in Python?",
    "options": [
      {"option_id": "A", "option_text": "O(1)"},
      {"option_id": "B", "option_text": "O(n)"},
      {"option_id": "C", "option_text": "O(log n)"},
      {"option_id": "D", "option_text": "O(n^2)"}
    ],
    "correct_answer": "A",
    "points": 1,
    "time_limit_seconds": 90
  }
]
```

## Need Help?

Check the following files:
- `AI_QUESTION_GENERATION_PROMPT.md` - Full AI prompt template
- `import_questions.py` - The import script source code
