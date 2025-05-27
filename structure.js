import { readdirSync, statSync, writeFileSync } from 'fs';
import { join, extname } from 'path';

// Directories to skip
const SKIP_FOLDERS = ['node_modules', '.git', 'dist', 'build', '__pycache__'];

// File extensions to include
const INCLUDE_EXTENSIONS = ['.ts', '.js', '.tsx', '.jsx', '.html', '.css', '.json'];

function isFileTypeIncluded(filename) {
  return INCLUDE_EXTENSIONS.includes(extname(filename));
}

function getFileStructure(dir, indent = '', depth = 0) {
  if (depth > 4) return '';

  let structure = '';
  const files = readdirSync(dir);

  for (const file of files) {
    const filePath = join(dir, file);
    const stats = statSync(filePath);

    if (stats.isDirectory()) {
      if (SKIP_FOLDERS.includes(file)) continue;

      structure += `${indent}📁 ${file}/\n`;
      structure += getFileStructure(filePath, indent + '  ', depth + 1);
    } else {
      if (!isFileTypeIncluded(file)) continue;

      structure += `${indent}📄 ${file}\n`;
    }
  }

  return structure;
}

// Start from current directory
const rootDir = './';
const fileStructure = getFileStructure(rootDir);

// Output to console
console.log(fileStructure);

// Save to file
writeFileSync('file_structure.txt', fileStructure);
console.log('File structure saved to file_structure.txt');