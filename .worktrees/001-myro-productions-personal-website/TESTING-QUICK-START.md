# Testing Quick Start Guide

## Run Tests

### All Unit & Integration Tests
```bash
npm test
```

### Watch Mode (Auto-rerun on file changes)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### E2E Tests
```bash
# Headless mode
npm run test:e2e

# Interactive UI mode
npm run test:e2e:ui
```

### All Tests (Unit + Integration + E2E)
```bash
npm run test:all
```

## Current Test Results

✅ **51 tests passing**

### Coverage Summary
- Button Component: **100%** coverage
- Navigation Component: **96.86%** coverage
- Hero Section: **71.89%** coverage
- Overall: **77.05%** statement coverage

## Test Files

- `__tests__/unit/Button.test.tsx` - Button component tests
- `__tests__/unit/Navigation.test.tsx` - Navigation component tests
- `__tests__/integration/Hero.test.tsx` - Hero section integration tests
- `__tests__/e2e/homepage.spec.ts` - Homepage E2E tests

## Quick Tips

### Run Specific Test File
```bash
npm test Button.test
```

### Run Tests Matching Pattern
```bash
npm test -- --testNamePattern="renders"
```

### Update Snapshots
```bash
npm test -- -u
```

### Debug Mode
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Documentation

Full testing guide: [__tests__/README.md](./__tests__/README.md)

Setup details: [TESTING-SETUP-COMPLETE.md](./TESTING-SETUP-COMPLETE.md)
