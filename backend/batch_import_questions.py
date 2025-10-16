"""
Batch Import All Test Questions from Quesbank folder

This script automatically imports all question files from the Quesbank directory
by matching filenames to skill names in the database.

Usage:
    python batch_import_questions.py
"""

import json
import os
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

# Skill name mapping (filename -> skill name in database)
SKILL_MAPPING = {
    "Py.Ques.json": "Python",
    "js.Ques.json": "JavaScript",
    "React.Ques.json": "React",
    "NodeJS.Ques.json": "Node.js",
    "DataStructures.Ques.json": "Data Structures",
    "MachineLearning.Ques.json": "Machine Learning",
    "Devops.Ques.json": "DevOps",
    "SystemDesign.Ques.json": "System Design",
    "SQL.Ques.JSON": "SQL"  # Note: uppercase .JSON extension
}

def get_supabase_client() -> Client:
    """Initialize Supabase client"""
    url = os.getenv("SUPABASE_URL")
    # Try both possible env variable names
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_SERVICE_KEY")
    
    if not url or not key:
        raise ValueError("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env file")
    
    return create_client(url, key)


def get_skill_id(db: Client, skill_name: str) -> str:
    """Get skill_id by skill name"""
    response = db.table("skills_master").select("skill_id").ilike("skill_name", f"%{skill_name}%").execute()
    
    if response.data:
        return response.data[0]["skill_id"]
    return None


def import_questions_for_skill(db: Client, file_path: str, skill_id: str, skill_name: str):
    """Import questions from a single file"""
    print(f"\n📁 Processing: {Path(file_path).name}")
    print(f"   Skill: {skill_name} (ID: {skill_id})")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            questions = json.load(f)
    except Exception as e:
        print(f"   ❌ Error loading file: {e}")
        return 0
    
    if not isinstance(questions, list):
        print("   ❌ Error: JSON must be an array of questions")
        return 0
    
    # Prepare questions
    questions_to_insert = []
    for q in questions:
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
    
    # Insert in batches
    batch_size = 50
    total_inserted = 0
    
    for i in range(0, len(questions_to_insert), batch_size):
        batch = questions_to_insert[i:i + batch_size]
        try:
            db.table("test_questions").insert(batch).execute()
            total_inserted += len(batch)
        except Exception as e:
            print(f"   ⚠️  Error inserting batch: {e}")
            continue
    
    print(f"   ✅ Imported {total_inserted}/{len(questions)} questions")
    return total_inserted


def batch_import_all():
    """Import all question files from Quesbank directory"""
    print("=" * 70)
    print("🚀 BATCH IMPORT - Question Banks")
    print("=" * 70)
    
    quesbank_dir = Path("Quesbank")
    
    if not quesbank_dir.exists():
        print("❌ Error: 'Quesbank' directory not found!")
        return
    
    # Initialize Supabase
    print("\n🔗 Connecting to Supabase...")
    db = get_supabase_client()
    print("✅ Connected!")
    
    # Get all JSON files
    json_files = list(quesbank_dir.glob("*.json"))
    
    if not json_files:
        print("❌ No JSON files found in Quesbank directory!")
        return
    
    print(f"\n📋 Found {len(json_files)} question files")
    
    # Import each file
    total_questions = 0
    successful_imports = 0
    skipped = 0
    
    for json_file in json_files:
        filename = json_file.name
        
        # Get skill name from mapping
        skill_name = SKILL_MAPPING.get(filename)
        
        if not skill_name:
            print(f"\n⚠️  Skipping {filename}: No skill mapping found")
            print(f"   Add mapping to SKILL_MAPPING in script")
            skipped += 1
            continue
        
        # Get skill ID
        skill_id = get_skill_id(db, skill_name)
        
        if not skill_id:
            print(f"\n⚠️  Skipping {filename}: Skill '{skill_name}' not found in database")
            print(f"   Create the skill first or update SKILL_MAPPING")
            skipped += 1
            continue
        
        # Import questions
        imported = import_questions_for_skill(db, str(json_file), skill_id, skill_name)
        
        if imported > 0:
            successful_imports += 1
            total_questions += imported
    
    # Summary
    print("\n" + "=" * 70)
    print("📊 IMPORT SUMMARY")
    print("=" * 70)
    print(f"✅ Successfully imported: {successful_imports}/{len(json_files)} files")
    print(f"📝 Total questions added: {total_questions}")
    if skipped > 0:
        print(f"⚠️  Skipped: {skipped} files")
    print("=" * 70)
    print("\n🎉 Batch import completed!")


def list_all_skills():
    """List all skills in database for reference"""
    print("\n📋 All Skills in Database:")
    print("=" * 70)
    
    db = get_supabase_client()
    response = db.table("skills_master").select("skill_id, skill_name, skill_category").execute()
    
    if not response.data:
        print("❌ No skills found!")
        return
    
    print(f"{'Skill Name':<30} {'Category':<20} {'Skill ID'}")
    print("-" * 70)
    
    for skill in response.data:
        print(f"{skill['skill_name']:<30} {skill['skill_category']:<20} {skill['skill_id']}")


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--list-skills":
        list_all_skills()
    else:
        batch_import_all()
        print("\n💡 Tip: Run 'python batch_import_questions.py --list-skills' to see all skills")
