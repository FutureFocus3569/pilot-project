const fs = require('fs');
const path = require('path');

const adminDir = '/Users/courtneyeverest/Pilot Project/childcare-dashboard/src/app/admin';
const adminFile = path.join(adminDir, 'page.tsx');

console.log('Checking admin directory...');

try {
  if (fs.existsSync(adminFile)) {
    console.log('Found conflicting admin file, removing...');
    fs.unlinkSync(adminFile);
    console.log('File removed successfully');
  }
  
  if (fs.existsSync(adminDir)) {
    console.log('Removing admin directory...');
    fs.rmdirSync(adminDir);
    console.log('Directory removed successfully');
  }
  
  console.log('Cleanup complete!');
} catch (error) {
  console.error('Error:', error.message);
}

// Verify removal
console.log('Verification:');
console.log('Admin file exists:', fs.existsSync(adminFile));
console.log('Admin directory exists:', fs.existsSync(adminDir));
