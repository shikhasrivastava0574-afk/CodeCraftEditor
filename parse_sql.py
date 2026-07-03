import re
import json

def slugify(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s\-]+', '', text)
    text = re.sub(r'[\s\-]+', '-', text)
    return text.strip('-')

def camel_case(text):
    clean = re.sub(r'[^a-zA-Z0-9\s\-]+', '', text)
    words = re.split(r'[\s\-]+', clean)
    if not words:
        return 'selectQuery'
    first = words[0].lower()
    rest = [w.capitalize() for w in words[1:]]
    return first + ''.join(rest)

def parse_sql():
    with open('sql_list.txt', 'r') as f:
        lines = f.readlines()
        
    sql_questions = []
    current_category = "SQL: General"
    last_title = None
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        if line.startswith("Case Study -"):
            current_category = f"SQL: {line.replace('Case Study - ', '')}"
            last_title = None
            continue
            
        if line.lower() in ['easy', 'medium', 'hard']:
            if last_title:
                difficulty = line.lower()
                q_id = slugify(last_title)
                fn_name = camel_case(last_title)
                
                sql_questions.append({
                    "id": q_id,
                    "title": last_title,
                    "difficulty": difficulty,
                    "category": current_category,
                    "description": f"Write an SQL query for **{last_title}**.\n\nImplement your query under the SQL editor to complete this practice task.",
                    "examples": [
                        {
                            "input": "SQL schema tables",
                            "output": "Result table records"
                        }
                    ],
                    "constraints": [
                        "SQL Dialect: Standard SQL / SQLite"
                    ],
                    "functionName": fn_name,
                    "templates": {
                        "sql": f"-- Write your SQL query here\nSELECT \n\n;\n"
                    },
                    "testCases": [
                        {
                            "input": [],
                            "expected": None
                        }
                    ]
                })
                last_title = None
        else:
            last_title = line

    # Now load the existing questions in js/dsa_sheet.js, append, and rewrite
    try:
        with open('js/dsa_sheet.js', 'r') as sheet_file:
            content = sheet_file.read()
            # extract JSON string from export const dsaQuestions = [...]
            json_str_match = re.search(r'export const dsaQuestions = (\[[\s\S]*\]);', content)
            if json_str_match:
                existing_questions = json.loads(json_str_match.group(1))
            else:
                existing_questions = []
    except Exception as err:
        print(f"Could not load existing dsa_sheet.js, starting fresh: {err}")
        existing_questions = []

    # Merge, avoiding duplicate IDs
    merged_questions = list(existing_questions)
    added_count = 0
    for q in sql_questions:
        if not any(item['id'] == q['id'] for item in merged_questions):
            merged_questions.append(q)
            added_count += 1

    # Rewrite js/dsa_sheet.js
    with open('js/dsa_sheet.js', 'w') as out:
        out.write("// Auto-generated Striver's DSA & SQL Sheet Database\n")
        out.write("export const dsaQuestions = ")
        json.dump(merged_questions, out, indent=2)
        out.write(";\n")
        
    print(f"Successfully added {added_count} SQL questions. Total database size: {len(merged_questions)}.")

if __name__ == '__main__':
    parse_sql()
