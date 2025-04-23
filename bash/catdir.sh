#!/bin/bash

# Set the base directory (defaults to current directory if not provided)
BASE_DIR="${1:-.}"

# Ensure the directory exists
if [ ! -d "$BASE_DIR" ]; then
    echo "Error: Directory $BASE_DIR does not exist."
    exit 1
fi

# Define excluded patterns as an array
EXCLUDED_PATHS=(
    "*/assets/*"
    "*/src-tauri/*"
    "*/*package-lock*"
    "*/*copy*"
    "*.bak"
    "*.logs"
    "*/logs/*"
    "*/bash/*"
    "*/ios/*"
    "*/android/*"
    "*/target/*"
    "*/local-data/*"
    "*/.git/*"
    "*/node_modules/*"
    "*/dist/*"
    "*/build/*"
    "*/coverage/*"
    "*/public/*"
    "*/artifacts/*"
    "*artifact*"
)

# Build the find command with exclusions
FIND_CMD="find \"$BASE_DIR\" -type f"
for pattern in "${EXCLUDED_PATHS[@]}"; do
    FIND_CMD="$FIND_CMD ! -path \"$pattern\""
done

# Exclude specific file extensions
FIND_CMD="$FIND_CMD ! -name \"*.png\" ! -name \"*.jpg\" ! -name \"*.ico\" ! -name \"*.sh\" ! -name \"*.map\" ! -name \"*.md\""

# Execute the find command
files=$(eval "$FIND_CMD")

# Check if any files were found
if [ -z "$files" ]; then
    echo "No relevant source files found in $BASE_DIR."
    exit 0
fi

# Display found files
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
