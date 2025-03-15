import { readdirSync, statSync, writeFileSync } from 'fs';
import { join } from 'path';

// Function to recursively get the file structure
function getFileStructure(dir, indent = '') {
  const files = readdirSync(dir); // Read the directory contents
  let structure = '';

  files.forEach((file) => {
    const filePath = join(dir, file);
    const stats = statSync(filePath); // Get file/directory stats

    if (stats.isDirectory()) {
      // If it's a directory, add it to the structure and recurse
      structure += `${indent}📁 ${file}/\n`;
      structure += getFileStructure(filePath, indent + '  ');
    } else {
      // If it's a file, add it to the structure
      structure += `${indent}📄 ${file}\n`;
    }
  });

  return structure;
}

// Root directory of your project
const rootDir = './';
const fileStructure = getFileStructure(rootDir);

// Output the file structure
console.log(fileStructure);

// Optionally, save the structure to a file
writeFileSync('file_structure.txt', fileStructure);
console.log('File structure saved to file_structure.txt');
