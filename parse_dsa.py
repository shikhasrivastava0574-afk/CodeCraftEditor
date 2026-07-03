import re
import json

def slugify(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s\-]+', '', text)
    text = re.sub(r'[\s\-]+', '-', text)
    return text.strip('-')

def camel_case(text):
    # Remove special chars and split by spaces/hyphens
    clean = re.sub(r'[^a-zA-Z0-9\s\-]+', '', text)
    words = re.split(r'[\s\-]+', clean)
    if not words:
        return 'solve'
    
    first = words[0].lower()
    # capitalize rest
    rest = [w.capitalize() for w in words[1:]]
    return first + ''.join(rest)

def parse_file():
    with open('dsa_list.txt', 'r') as f:
        lines = f.readlines()
        
    questions = []
    current_category = "General"
    
    last_title = None
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Check if category header like "Arrays (21)" or "Stack + Queue (2)"
        cat_match = re.match(r'^([a-zA-Z\s\+\-\&]+)\s*\((\d+)\)$', line)
        if cat_match:
            current_category = cat_match.group(1).strip()
            last_title = None
            continue
            
        # Check if difficulty line
        if line.lower() in ['easy', 'medium', 'hard']:
            if last_title:
                difficulty = line.lower()
                q_id = slugify(last_title)
                fn_name = camel_case(last_title)
                
                # Check for SQL or database question to adjust templates
                is_sql = "sql" in last_title.lower() or "database" in current_category.lower()
                
                templates = {}
                if is_sql:
                    templates = {
                        "sql": f"-- Write your SQL query here\nSELECT * FROM {fn_name};\n"
                    }
                else:
                    templates = {
                        "javascript": f"function {fn_name}() {{\n    // Write your code here\n    \n}}",
                        "python": f"def {fn_name}():\n    # Write your code here\n    pass",
                        "cpp": f"class Solution {{\npublic:\n    // Update types and arguments as needed\n    void {fn_name}() {{\n        \n    }}\n}};",
                        "java": f"class Solution {{\n    // Update types and arguments as needed\n    public void {fn_name}() {{\n        \n    }}\n}}"
                    }
                
                # Construct standard mock details
                questions.append({
                    "id": q_id,
                    "title": last_title,
                    "difficulty": difficulty,
                    "category": current_category,
                    "description": f"Write a solution for **{last_title}**.\n\nImplement the function `{fn_name}` under the selected language template to solve this problem.",
                    "examples": [
                        {
                            "input": "Default / User-defined",
                            "output": "Self-verify execution"
                        }
                    ],
                    "constraints": [
                        "Optimize for time and space complexity."
                    ],
                    "functionName": fn_name,
                    "templates": templates,
                    "testCases": [
                        {
                            "input": [],
                            "expected": None
                        }
                    ]
                })
                last_title = None
        else:
            # It's a question title
            # Skip noise lines
            if "important sorting algorithms" in line.lower() or "important bit operations" in line.lower() or "important traversal" in line.lower():
                continue
            last_title = line

    # Write output to dsa_sheet.js
    with open('js/dsa_sheet.js', 'w') as out:
        out.write("// Auto-generated Striver's DSA Sheet Database (250 questions)\n")
        out.write("export const dsaQuestions = ")
        json.dump(questions, out, indent=2)
        out.write(";\n")
        
    print(f"Successfully parsed {len(questions)} questions.")

if __name__ == '__main__':
    parse_file()
