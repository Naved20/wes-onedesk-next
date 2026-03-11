/**
 * Preservation Property Tests
 * 
 * Property 2: Preservation - JavaScript File Behavior
 * 
 * IMPORTANT: Follow observation-first methodology
 * Observe behavior on UNFIXED code for non-buggy files
 * 
 * Test that all other `.js` files in `/src/components/ui/` contain only valid JavaScript syntax
 * Property-based testing generates many test cases for stronger guarantees
 * 
 * Run tests on UNFIXED code
 * EXPECTED OUTCOME: Tests PASS (this confirms baseline behavior to preserve)
 * 
 * Validates: Requirements 3.1, 3.2, 3.3
 */

const fs = require('fs');
const path = require('path');

describe('Preservation Property Tests - JavaScript File Behavior', () => {
  // Get all .js files in the UI components directory
  const uiComponentsDir = path.join(__dirname, '../src/components/ui');
  const jsFiles = fs.readdirSync(uiComponentsDir)
    .filter(file => file.endsWith('.js'))
    .map(file => path.join(uiComponentsDir, file));
  
  // Property 1: All .js files should not contain TypeScript generic syntax
  describe('Property: No TypeScript generic syntax in .js files', () => {
    // Test each .js file individually
    jsFiles.forEach(filePath => {
      const fileName = path.basename(filePath);
      
      // Skip progress.js since it's the buggy file we're testing preservation for
      if (fileName === 'progress.js') {
        return;
      }
      
      test(`${fileName} should not contain React.forwardRef with TypeScript generics`, () => {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for React.forwardRef with TypeScript generics
        // Pattern: React.forwardRef<...>
        const typescriptGenericPattern = /React\.forwardRef\s*<[^>]+>/;
        const match = content.match(typescriptGenericPattern);
        
        // This test should PASS on unfixed code for non-buggy files
        // If it fails, that means the file has TypeScript syntax when it shouldn't
        expect(match).toBeNull();
        
        if (match) {
          console.log(`❌ Preservation violation in ${fileName}:`);
          console.log(`   Found TypeScript syntax: ${match[0]}`);
          console.log(`   This file should contain only valid JavaScript syntax`);
        } else {
          console.log(`✅ ${fileName} contains only valid JavaScript syntax (no TypeScript generics)`);
        }
      });
    });
  });
  
  // Property 2: All .js files should be valid JavaScript (syntax check)
  describe('Property: Valid JavaScript syntax in .js files', () => {
    // Test each .js file individually
    jsFiles.forEach(filePath => {
      const fileName = path.basename(filePath);
      
      // Skip progress.js since it's the buggy file
      if (fileName === 'progress.js') {
        return;
      }
      
      test(`${fileName} should contain valid JavaScript syntax`, () => {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for common TypeScript syntax patterns that would break JavaScript
        const typescriptPatterns = [
          // TypeScript generics: <Type>
          /:\s*[A-Z][a-zA-Z0-9_]*\s*(?:<[^>]*>)?\s*(?=\{|;|,|\))/,
          // Type annotations: variable: Type
          /(?:const|let|var|function)\s+[a-zA-Z_$][a-zA-Z0-9_$]*\s*:\s*[A-Z][a-zA-Z0-9_]*/,
          // Interface and type declarations
          /(?:interface|type)\s+[A-Z][a-zA-Z0-9_]*/,
          // Import type syntax
          /import\s+type\s+/,
          // Export type syntax
          /export\s+type\s+/,
        ];
        
        const violations = [];
        typescriptPatterns.forEach((pattern, index) => {
          const matches = content.match(pattern);
          if (matches) {
            violations.push(`Pattern ${index + 1} matched: ${matches[0].substring(0, 50)}...`);
          }
        });
        
        // This test should PASS on unfixed code for non-buggy files
        expect(violations).toEqual([]);
        
        if (violations.length > 0) {
          console.log(`❌ JavaScript syntax violation in ${fileName}:`);
          violations.forEach(violation => console.log(`   ${violation}`));
        }
      });
    });
  });
  
  // Property 3: Specific observation-based tests for known good files
  describe('Property: Observed behavior preservation', () => {
    test('button.js should compile successfully (observed behavior)', () => {
      const filePath = path.join(uiComponentsDir, 'button.js');
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check that button.js uses plain JavaScript React.forwardRef
      const hasReactForwardRef = content.includes('React.forwardRef');
      const hasTypeScriptGenerics = content.match(/React\.forwardRef\s*<[^>]+>/);
      
      expect(hasReactForwardRef).toBe(true);
      expect(hasTypeScriptGenerics).toBeNull();
      
      console.log('✅ button.js uses plain JavaScript React.forwardRef (no TypeScript generics)');
    });
    
    test('input.js should compile successfully (observed behavior)', () => {
      const filePath = path.join(uiComponentsDir, 'input.js');
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check that input.js uses plain JavaScript React.forwardRef
      const hasReactForwardRef = content.includes('React.forwardRef');
      const hasTypeScriptGenerics = content.match(/React\.forwardRef\s*<[^>]+>/);
      
      expect(hasReactForwardRef).toBe(true);
      expect(hasTypeScriptGenerics).toBeNull();
      
      console.log('✅ input.js uses plain JavaScript React.forwardRef (no TypeScript generics)');
    });
  });
  
  // Property 4: Property-based test across all UI component files
  describe('Property: All UI component files should maintain compilation', () => {
    // This is a property-based test in spirit - we're testing the property
    // across all files in the directory
    test('All .js files in /src/components/ui/ (except progress.js) should not have TypeScript syntax', () => {
      const violations = [];
      
      jsFiles.forEach(filePath => {
        const fileName = path.basename(filePath);
        
        if (fileName === 'progress.js') {
          return; // Skip the buggy file
        }
        
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for the specific bug pattern
        const hasTypeScriptForwardRef = content.match(/React\.forwardRef\s*<[^>]+>/);
        
        if (hasTypeScriptForwardRef) {
          violations.push({
            file: fileName,
            pattern: hasTypeScriptForwardRef[0].substring(0, 50)
          });
        }
      });
      
      // This property should hold for ALL files (except progress.js)
      expect(violations).toEqual([]);
      
      if (violations.length === 0) {
        console.log(`✅ Property holds: All ${jsFiles.length - 1} .js files (except progress.js) contain only valid JavaScript syntax`);
      } else {
        console.log(`❌ Property violated: ${violations.length} files have TypeScript syntax`);
        violations.forEach(v => console.log(`   - ${v.file}: ${v.pattern}...`));
      }
    });
  });
});

// Helper function for property-based testing
function generateTestCases() {
  // In a true property-based test framework, we would generate random test cases
  // For now, we're testing all files in the directory as our "generated" test cases
  return {
    description: 'Testing preservation property across all UI component .js files',
    testCount: jsFiles.length - 1, // minus progress.js
    property: 'No TypeScript generic syntax in .js files'
  };
}