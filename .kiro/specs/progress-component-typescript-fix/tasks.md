# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Fault Condition** - TypeScript Syntax in JavaScript Files
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: For deterministic bugs, scope the property to the concrete failing case(s) to ensure reproducibility
  - Test that `src/components/ui/progress.js` contains valid JavaScript syntax (from Fault Condition in design)
  - The test should attempt to parse the file as JavaScript and fail when TypeScript syntax is detected
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found to understand root cause (e.g., "Syntax error at React.forwardRef<...>")
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - JavaScript File Behavior
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy files
  - Observe: `src/components/ui/button.js` compiles successfully on unfixed code
  - Observe: `src/components/ui/input.js` compiles successfully on unfixed code
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements
  - Test that all other `.js` files in `/src/components/ui/` contain only valid JavaScript syntax
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 3. Fix for TypeScript syntax in progress.js

  - [x] 3.1 Implement the fix
    - Remove TypeScript generic syntax from `React.forwardRef` declaration
    - Convert `React.forwardRef<React.ElementRef<typeof ProgressPrimitive.Root>, React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>>` to `React.forwardRef`
    - Ensure the component function signature remains: `({ className, value, ...props }, ref)`
    - Preserve all existing functionality and behavior
    - Verify the file contains only valid JavaScript syntax
    - _Bug_Condition: isBugCondition(file) where file contains TypeScript syntax in .js file_
    - _Expected_Behavior: expectedBehavior(result) from design - file compiles without syntax errors_
    - _Preservation: Preservation Requirements from design - other files unchanged, functionality preserved_
    - _Requirements: 2.1, 2.2, 3.1, 3.2, 3.3_

  - [x] 3.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - TypeScript Syntax in JavaScript Files
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: Expected Behavior Properties from design_

  - [x] 3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - JavaScript File Behavior
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.