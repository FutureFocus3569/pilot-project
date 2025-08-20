const fs = require('fs');
const path = require('path');

function removeDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach((file) => {
      const curPath = path.join(dirPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        removeDirectory(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dirPath);
  }
}

const conflictingDir = '/Users/courtneyeverest/Pilot Project/childcare-dashboard/src/app/(dashboard)/admin';

console.log('🔧 Removing conflicting admin directory...');
console.log('Target:', conflictingDir);

try {
  if (fs.existsSync(conflictingDir)) {
    removeDirectory(conflictingDir);
    console.log('✅ Successfully removed conflicting directory!');
  } else {
    console.log('ℹ️ Directory already removed or does not exist');
  }
  
  // Verify it's gone
  console.log('Verification - Directory exists:', fs.existsSync(conflictingDir));
  
  // Check remaining admin directories
  const appDir = '/Users/courtneyeverest/Pilot Project/childcare-dashboard/src/app';
  const contents = fs.readdirSync(appDir);
  console.log('Remaining directories in /src/app:', contents.filter(item => 
    fs.lstatSync(path.join(appDir, item)).isDirectory()
  ));
  
} catch (error) {
  console.error('❌ Error:', error.message);
}
