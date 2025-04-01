const fs = require('fs');
const path = require('path');

// Get the version from command line arguments
const newVersion = process.argv[2];

if (!newVersion) {
  console.error('Please provide a version number as an argument');
  console.error('Example: node update-version.js 0.2.4');
  process.exit(1);
}

// Validate version format
if (!/^\d+\.\d+\.\d+$/.test(newVersion)) {
  console.error('Version should be in format x.y.z');
  process.exit(1);
}

// Files to update
const filesToUpdate = [
  {
    path: 'package.json',
    update: (content) => {
      const json = JSON.parse(content);
      json.version = newVersion;
      return JSON.stringify(json, null, 2) + '\n';
    }
  },
  {
    path: 'src-tauri/tauri.conf.json',
    update: (content) => {
      const json = JSON.parse(content);
      json.version = newVersion;
      return JSON.stringify(json, null, 2) + '\n';
    }
  },
  {
    path: 'src-tauri/Cargo.toml',
    update: (content) => {
      return content.replace(/^version = ".*?"/m, `version = "${newVersion}"`);
    }
  },
  {
    path: 'src-tauri/metanet-desktop.appdata.xml',
    update: (content) => {
      return content.replace(/<release version=".*?"/, `<release version="${newVersion}"`);
    }
  },
  {
    path: 'src-tauri/metanet-desktop.desktop',
    update: (content) => {
      return content.replace(/^Version=.*$/m, `Version=${newVersion}`);
    }
  }
];

// Update each file
filesToUpdate.forEach(file => {
  const filePath = path.resolve(file.path);
  
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const updatedContent = file.update(content);
      fs.writeFileSync(filePath, updatedContent);
      console.log(`Updated ${file.path} to version ${newVersion}`);
    } else {
      console.warn(`File not found: ${file.path}`);
    }
  } catch (error) {
    console.error(`Failed to update ${file.path}:`, error.message);
  }
});

console.log(`Version updated to ${newVersion} successfully!`);
