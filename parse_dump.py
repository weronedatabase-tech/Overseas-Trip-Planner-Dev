import os
import re
import sys

def parse_and_write(filename):
    if not os.path.exists(filename):
        print(f"File {filename} does not exist.")
        return
    with open(filename, 'r', encoding='utf-8') as f:
        text = f.read()

    pattern = re.compile(
        r"@@@===FILE_PATH:\s*(.*?)\s*===@@@\s*@@@===CODE_START===@@@\r?\n(.*?)\r?\n?@@@===CODE_END===@@@",
        re.DOTALL
    )
    matches = pattern.findall(text)
    print(f"Found {len(matches)} files in {filename}")

    for path, content in matches:
        path = path.strip()
        dir_name = os.path.dirname(path)
        if dir_name:
            os.makedirs(dir_name, exist_ok=True)
        with open(path, 'w', encoding='utf-8') as out:
            out.write(content)
        print(f"  -> Updated {path} ({len(content)} chars)")

if __name__ == '__main__':
    for arg in sys.argv[1:]:
        parse_and_write(arg)
