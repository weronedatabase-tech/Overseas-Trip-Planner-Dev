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
        r"@@@===FILE_PATH:\s*(.*?)\s*===@@@\s*@@@===CODE_START===@@@\r?\n(.*?)\r?\n?