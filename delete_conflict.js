const fs = require('fs');
const path = require('path');

// Function to recursively delete directory
function deleteFolderRecursive(directoryPath) {
  if (fs.existsSync(directoryPath)) {
    fs.readdirSync(directoryPath).forEach((file) => {
      const curPath = path.join(directoryPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(directoryPath);
  }
}

const conflictingPath = '/Users/courtneyeverest/Pilot Project/childcare-dashboard/src/app/(dashboard)/admin';

console.log('🗑️ Removing conflicting admin directory completely...');

try {
  if (fs.existsSync(conflictingPath)) {
    deleteFolderRecursive(conflictingPath);
    console.log('✅ Successfully deleted:', conflictingPath);
  } else {
    console.log('ℹ️ Directory does not exist:', conflictingPath);
  }
  
  // Double check it's gone
  console.log('Verification - Directory exists:', fs.existsSync(conflictingPath));
  
  // Clear Next.js cache
  const nextCache = '/Users/courtneyeverest/Pilot Project/childcare-dashboard/.next';
  if (fs.existsSync(nextCache)) {
    console.log('🧹 Clearing Next.js cache...');
    deleteFolderRecursive(nextCache);
    console.log('✅ Cache cleared');
  }
  
} catch (error) {
  console.error('❌ Error:', error);
}
