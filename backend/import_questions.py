"""
Import Test Questions into Supabase Database

Usage:
    python import_questions.py <questions_file.json> <skill_id>

Example:
    python import_questions.py questions_python.json 550e8400-e29b-41d4-a716-446655440000
"""

import json
import sys
import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

def get_supabase_client() -> Client:
    """Initialize Supabase client"""
    url = os.getenv("SUPABASE_URL")
    # Try both possible env variable names
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_SERVICE_KEY")
    
    if not url or not key:
        raise ValueError("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env file")
    
    return create_client(url, key)


def import_questions(questions_file: str, skill_id: str):
    """Import questions from JSON file to database"""
    
    # Load questions from file
    print(f"📖 Loading questions from {questions_file}...")
    try:
        with open(questions_file, 'r', encoding='utf-8') as f:
            questions = json.load(f)
    except FileNotFoundError:
        print(f"❌ Error: File '{questions_file}' not found!")
        return
    except json.JSONDecodeError as e:
        print(f"❌ Error: Invalid JSON in file: {e}")
        return
    
    if not isinstance(questions, list):
        print("❌ Error: JSON must be an array of questions")
        return
    
    print(f"✅ Loaded {len(questions)} questions")
    
    # Initialize Supabase client
    print("🔗 Connecting to Supabase...")
    db = get_supabase_client()
    
    # Verify skill exists
    print(f"🔍 Verifying skill_id: {skill_id}...")
    skill_check = db.table("skills_master").select("skill_name").eq("skill_id", skill_id).execute()
    
    if not skill_check.data:
        print(f"❌ Error: Skill with ID '{skill_id}' not found!")
        print("\n💡 To get skill IDs, run:")
        print("   SELECT skill_id, skill_name FROM skills_master;")
        return
    
    skill_name = skill_check.data[0]["skill_name"]
    print(f"✅ Found skill: {skill_name}")
    
    # Prepare questions for insertion
    print("📝 Preparing questions...")
    questions_to_insert = []
    for idx, q in enumerate(questions, 1):
        question_data = {
            "skill_id": skill_id,
            "question_type": q.get("question_type", "MCQ"),
            "difficulty_level": q.get("difficulty_level", "Medium"),
            "question_text": q["question_text"],
            "options": q.get("options"),
            "correct_answer": q["correct_answer"],
            "points": q.get("points", 1),
            "time_limit_seconds": q.get("time_limit_seconds", 60)
        }
        questions_to_insert.append(question_data)
    
    # Insert questions in batches
    print(f"💾 Inserting {len(questions_to_insert)} questions into database...")
    batch_size = 50
    total_inserted = 0
    
    for i in range(0, len(questions_to_insert), batch_size):
        batch = questions_to_insert[i:i + batch_size]
        try:
            response = db.table("test_questions").insert(batch).execute()
            total_inserted += len(batch)
            print(f"   ✓ Inserted batch {i//batch_size + 1}: {len(batch)} questions")
        except Exception as e:
            print(f"   ❌ Error inserting batch: {e}")
            continue
    
    print(f"\n🎉 Success! Imported {total_inserted} questions for '{skill_name}'")
    print(f"📊 Students can now take tests for this skill!")


def list_skills():
    """List all available skills"""
    print("📋 Fetching all skills...")
    db = get_supabase_client()
    
    response = db.table("skills_master").select("skill_id, skill_name, skill_category").execute()
    
    if not response.data:
        print("❌ No skills found in database!")
        return
    
    print(f"\n✅ Found {len(response.data)} skills:\n")
    print(f"{'Skill Name':<30} {'Category':<20} {'Skill ID'}")
    print("-" * 90)
    
    for skill in response.data:
        print(f"{skill['skill_name']:<30} {skill['skill_category']:<20} {skill['skill_id']}")


if __name__ == "__main__":
    if len(sys.argv) == 2 and sys.argv[1] == "--list-skills":
        list_skills()
    elif len(sys.argv) != 3:
        print("❌ Usage:")
        print("   python import_questions.py <questions_file.json> <skill_id>")
        print("   python import_questions.py --list-skills")
        print("\nExample:")
        print("   python import_questions.py questions_python.json 550e8400-e29b-41d4-a716-446655440000")
        sys.exit(1)
    else:
        questions_file = sys.argv[1]
        skill_id = sys.argv[2]
        import_questions(questions_file, skill_id)
