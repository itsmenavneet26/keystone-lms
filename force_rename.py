import os

def replace_in_file(filepath, old_str, new_str):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        if old_str in content:
            content = content.replace(old_str, new_str)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
    except Exception as e:
        pass

for root, dirs, files in os.walk('.'):
    if '.git' in root or 'node_modules' in root:
        continue
    for file in files:
        if file.endswith(('.py', '.js', '.json', '.html', '.txt')):
            replace_in_file(os.path.join(root, file), 'from keystone_lms.', 'from keystone_lms.')
            replace_in_file(os.path.join(root, file), 'import keystone_lms.', 'import keystone_lms.')
            replace_in_file(os.path.join(root, file), '\"lms\"', '\"keystone_lms\"')
            replace_in_file(os.path.join(root, file), '\'lms\'', '\'keystone_lms\'')
            replace_in_file(os.path.join(root, file), 'app_name = \"lms\"', 'app_name = \"keystone_lms\"')
            replace_in_file(os.path.join(root, file), '\"name\": \"lms\"', '\"name\": \"keystone_lms\"')
