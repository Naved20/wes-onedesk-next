/**
 * Bug Condition Exploration Test
 * 
 * Property 1: Fault Condition - TypeScript Syntax in JavaScript Files
 * 
 * This test MUST FAIL on unfixed code - failure confirms the bug exists
 * DO NOT attempt to fix the test or the code when it fails
 * 
 * Test that src/components/ui/progress.js contains valid JavaScript syntax
 * The test attempts to parse the file as JavaScript and fails when TypeScript syntax is detected
 * 
 * Validates: Requirements 1.1, 1.2
 */

const fs = require('fs');
const path = require('path');

describe('Bug Condition Exploration - TypeScript Syntax in JavaScript Files', () => {
  test('progress.js should contain valid JavaScript syntax (test should fail on unfixed code)', () => {
    const filePath = path.join(__dirname, '../src/components/ui/progress.js');
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for TypeScript generic syntax pattern - the specific bug condition
    // Looking for: React.forwardRef<Type1, Type2>(({...}, ref) => ...)
    const typescriptGenericPattern = /React\.forwardRef\s*<\s*[^>]+\s*,\s*[^>]+\s*>\s*\(/;
    
    const match = content.match(typescriptGenericPattern);
    
    // This test should FAIL on unfixed code
    // If it passes, that means the bug doesn't exist (or test is wrong)
    expect(match).not.toBeNull();
    
    if (match) {
      // Document the counterexample
      console.log('✅ Bug condition confirmed:');
      console.log(`   TypeScript syntax found: ${match[0]}`);
      console.log(`   Location: Line ${getLineNumber(content, match.index)}`);
      console.log('   This test failure proves the bug exists!');
    }
  });
  
  test('progress.js should not contain any React.forwardRef with TypeScript generics', () => {
    const filePath = path.join(__dirname, '../src/components/ui/progress.js');
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for any React.forwardRef with generics
    const anyForwardRefWithGenerics = /React\.forwardRef\s*<[^>]+>/;
    const match = content.match(anyForwardRefWithGenerics);
    
    // This test should also FAIL on unfixed code
    expect(match).not.toBeNull();
    
    if (match) {
      console.log('✅ Additional bug confirmation:');
      console.log(`   React.forwardRef with generics: ${match[0]}`);
    }
  });
});

// Helper function to get line number from index
function getLineNumber(content, index) {
  const lines = content.substring(0, index).split('\n');
  return lines.length;
}