import re
import json

raw_text = '```json\n{\n    "speech": "Why did the programmer quit his job? Because he didn\'t get arrays! Ha ha.",\n    "gesture": "Head tilt"\n}\n```'

print("Raw text:")
print(repr(raw_text))

match = re.search(r'\{.*\}', raw_text, re.DOTALL)
if match:
    raw_text_extracted = match.group(0)
    print("Extracted:")
    print(repr(raw_text_extracted))
    try:
        data = json.loads(raw_text_extracted)
        print("JSON Loads success!")
        print(data)
    except Exception as e:
        print("JSON Loads failed:", e)
else:
    print("Regex failed to match!")
