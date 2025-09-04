#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROJECT_ROOT = join(__dirname, '..');
const BACKGROUNDS_SRC_DIR = join(PROJECT_ROOT, 'src/lib/backgrounds');
const BACKGROUNDS_STATIC_DIR = join(PROJECT_ROOT, 'static/backgrounds');

/**
 * Extract dependencies from a Svelte component file
 */
function extractDependencies(content) {
  const dependencies = new Set();
  
  // Look for import statements
  const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    
    // Skip relative imports and built-in modules
    if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
      dependencies.add(importPath);
    }
  }
  
  return Array.from(dependencies);
}

/**
 * Extract component description from comments or props
 */
function extractDescription(content, componentName) {
  // Look for JSDoc-style comments at the top
  const jsdocMatch = content.match(/\/\*\*\s*\n\s*\*\s*(.+?)\s*\n\s*\*\//);
  if (jsdocMatch) {
    return jsdocMatch[1];
  }
  
  // Look for single-line comments at the top
  const commentMatch = content.match(/^\/\/\s*(.+)/m);
  if (commentMatch) {
    return commentMatch[1];
  }
  
  // Default description
  return `${componentName} background component`;
}

/**
 * Generate registry JSON for a component
 */
function generateRegistryJson(componentPath, componentName) {
  const content = readFileSync(componentPath, 'utf-8');
  const dependencies = extractDependencies(content);
  const description = extractDescription(content, componentName);
  
  // Convert absolute path to relative path for the registry
  const relativePath = componentPath.replace(PROJECT_ROOT + '/', '');
  
  return {
    "$schema": "https://ui.shadcn.com/schema/registry-item.json",
    "name": componentName.toLowerCase(),
    "type": "registry:block",
    "title": componentName,
    "description": description,
    "dependencies": dependencies,
    "files": [
      {
        "path": relativePath,
        "content": content,
        "type": "registry:component"
      }
    ]
  };
}

/**
 * Process all components in the backgrounds directory
 */
function processBackgrounds() {
  console.log('🔍 Scanning backgrounds directory...');
  
  const items = readdirSync(BACKGROUNDS_SRC_DIR);
  let processedCount = 0;
  
  for (const item of items) {
    const itemPath = join(BACKGROUNDS_SRC_DIR, item);
    const stat = statSync(itemPath);
    
    if (stat.isDirectory()) {
      // Look for .svelte files in the directory
      const files = readdirSync(itemPath);
      const svelteFiles = files.filter(file => 
        file.endsWith('.svelte') && 
        !file.includes('copy') && 
        !file.includes('.old') &&
        !file.includes('Old')
      );
      
      for (const svelteFile of svelteFiles) {
        const componentPath = join(itemPath, svelteFile);
        const componentName = basename(svelteFile, '.svelte');
        
        try {
          console.log(`📝 Processing ${componentName}...`);
          
          const registryJson = generateRegistryJson(componentPath, componentName);
          const outputPath = join(BACKGROUNDS_STATIC_DIR, `${componentName.toLowerCase()}.json`);
          
          writeFileSync(outputPath, JSON.stringify(registryJson, null, 2));
          console.log(`✅ Generated ${outputPath}`);
          processedCount++;
          
        } catch (error) {
          console.error(`❌ Error processing ${componentName}:`, error.message);
        }
      }
    }
  }
  
  console.log(`\n🎉 Successfully processed ${processedCount} components!`);
}

// Run the script
try {
  processBackgrounds();
} catch (error) {
  console.error('❌ Script failed:', error.message);
  process.exit(1);
}
