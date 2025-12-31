import os
import re
import urllib.parse

ROOT_DIR = r"d:\Dev\TORO-Wiki"

def main():
    # 1. Index all markdown files
    print("Indexing files...")
    file_index = {}
    for root, dirs, files in os.walk(ROOT_DIR):
        for file in files:
            if file.lower().endswith(".md"):
                # Store by lowercase filename for case-insensitive lookup
                # Also stripping extension for easier matching if needed, but keeping full name is safer
                # Obsidian often links to "Filename" without extension
                name_no_ext = os.path.splitext(file)[0].lower()
                full_path = os.path.join(root, file)
                file_index[name_no_ext] = full_path
                # Also index with extension just in case
                file_index[file.lower()] = full_path

    print(f"Indexed {len(file_index)} file entries.")

    # 2. Process all markdown files
    for root, dirs, files in os.walk(ROOT_DIR):
        for file in files:
            if file.lower().endswith(".md"):
                process_file(os.path.join(root, file), file_index)

def process_file(file_path, file_index):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return

    # Regex for [[Target]] or [[Target|Label]]
    # Non-greedy match for content inside [[...]]
    # We need to capture the whole group to replace it
    pattern = re.compile(r'\[\[(.*?)\]\]')
    
    def replace_link(match):
        original = match.group(0)
        inner = match.group(1)
        
        target = inner
        label = inner
        
        if '|' in inner:
            parts = inner.split('|', 1)
            target = parts[0]
            label = parts[1]
            
        # Handle anchors
        anchor = ""
        if '#' in target:
            parts = target.split('#', 1)
            target = parts[0]
            anchor = '#' + parts[1]
            
        # Clean up target (Obsidian links might have path separators, but we only have filename index)
        # We assume unique filenames or simplest match
        target_name = os.path.basename(target)
        target_key = target_name.lower()
        
        if not target_key and anchor:
             # Link to self with anchor [[#Section]]
             # Converted to [Label](#Section)
             # But standard markdown for section links usually works if label matches header id
             # For internal anchor links, just keeping the anchor is often enough: [Label](#Section)
             return f"[{label}]({anchor})"

        if target_key in file_index:
            target_full_path = file_index[target_key]
            
            # Calculate relative path
            start_dir = os.path.dirname(file_path)
            rel_path = os.path.relpath(target_full_path, start_dir)
            
            # Normalize to forward slashes
            rel_path = rel_path.replace(os.path.sep, '/')
            
            # URL encode the path
            # We encode the path segments but keep the slashes
            parts = rel_path.split('/')
            encoded_parts = [urllib.parse.quote(p) for p in parts]
            encoded_path = '/'.join(encoded_parts)
            
            if anchor:
                encoded_path += anchor
                
            return f"[{label}]({encoded_path})"
        else:
            print(f"Warning: Could not resolve link '{original}' in {file_path}")
            return original # Keep as is if not found

    new_content = pattern.sub(replace_link, content)
    
    if new_content != content:
        print(f"Modifying {file_path}")
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)

if __name__ == "__main__":
    main()
