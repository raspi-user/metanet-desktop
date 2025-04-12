#!/bin/bash

# Set the base directory (defaults to current directory if not provided)
BASE_DIR="${1:-.}"

# Ensure the directory exists
if [ ! -d "$BASE_DIR" ]; then
    echo "Error: Directory $BASE_DIR does not exist."
    exit 1
fi

# Find all text-based source files, excluding specific directories and file types
files=$(find "$BASE_DIR" -type f \
        ! -path "*/ios/*" \
        ! -path "*/android/*" \
        ! -path "*/target/*" \
        ! -path "*/local-data/*" \
        ! -path "*/.git/*" \
        ! -path "*/node_modules/*" \
        ! -path "*/dist/*" \
        ! -path "*/build/*" \
        ! -path "*/coverage/*" \
        ! -path "*/public/*" \
        ! -path "*/artifacts/*" \
        ! -name "package-lock.json" \
        ! -path "*artifact*" \
        ! -name "*.png" \
        ! -name "*.jpg" \
        ! -name "*.ico" \
        ! -name "*.sh" \
        ! -name "*.map" \
        ! -name "*.md" )

# Check if any files were found
if [ -z "$files" ]; then
    echo "No relevant source files found in $BASE_DIR."
    exit 0
fi

# Clear screen and display found files
clear
echo "=== Displaying All Relevant Source Files in: $BASE_DIR ==="

# Loop through and display file contents
for file in $files; do
    echo "=== $file ==="
    
    # Check if file is text-based before displaying content
    if file "$file" | grep -q text; then
        cat "$file" | iconv -f utf-8 -t utf-8//IGNORE | sed 's/[^[:print:]\t]//g'
    else
        echo "[Binary or non-text file skipped]"
    fi
    
    echo -e "\n"  # Add spacing between files
done
