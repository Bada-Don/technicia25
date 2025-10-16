# AI Prompt for Generating Test Questions

Use this prompt with any AI (ChatGPT, Claude, Gemini, etc.) to generate questions for your skills.

## Prompt Template

```
I need you to generate 50 multiple-choice questions (MCQs) for testing knowledge in: [SKILL_NAME]

Requirements:
- Generate exactly 50 questions
- Mix difficulty: 20 Easy, 20 Medium, 10 Hard
- Each question must have 4 options (A, B, C, D)
- Mark the correct answer clearly
- Questions should be practical and test real understanding
- Each question is worth 1 point

Output format (JSON):
```json
[
  {
    "question_type": "MCQ",
    "difficulty_level": "Easy|Medium|Hard",
    "question_text": "What is...?",
    "options": [
      {"option_id": "A", "option_text": "First option"},
      {"option_id": "B", "option_text": "Second option"},
      {"option_id": "C", "option_text": "Third option"},
      {"option_id": "D", "option_text": "Fourth option"}
    ],
    "correct_answer": "A",
    "points": 1,
    "time_limit_seconds": 60
  }
]
```

Skills to generate for: [YOUR_SKILL_NAME_HERE]
```

## Example Skills to Generate For

Replace `[SKILL_NAME]` with:
- Python Programming
- JavaScript
- React
- Node.js
- SQL
- Data Structures
- Machine Learning
- DevOps
- System Design
- etc.

## After Generation

1. Save the JSON output to a file: `questions_[skill_name].json`
2. Get your skill_id from the database (see below)
3. Run the import script (see import_questions.py)
