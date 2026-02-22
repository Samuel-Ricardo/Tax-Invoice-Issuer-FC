# Test Suite Documentation

## 📊 Test Coverage Structure

This project implements a complete **Test Pyramid** with three levels of testing:

```
       /\
      /E2E\         ← Few, Slow, High-level
     /------\
    /  INT  \       ← Some, Medium, API-level
   /----------\
  /   UNIT     \    ← Many, Fast, Component-level
 /--------------\
```

## 🎯 Test Distribution

### ✅ Unit Tests (Base of Pyramid) - ~60-70%

**Purpose**: Test individual components in isolation

#### Entity Tests

- **Location**: `test/unit/domain/entity/`
- **Coverage**:
  - `contract.entity.spec.ts` - Contract entity behavior
  - `payment.entity.spec.ts` - Payment entity behavior
  - `invoice.entity.spec.ts` - Invoice entity behavior
- **Tests**: 30+ test cases

#### Strategy Tests

- **Location**: `test/unit/domain/strategy/invoice/`
- **Coverage**:
  - `cash.strategy.spec.ts` - Cash basis invoice generation
  - `accrual.strategy.spec.ts` - Accrual basis invoice generation
  - `invoice.factory.spec.ts` - Strategy factory pattern
- **Tests**: 35+ test cases

#### Use Case Tests

- **Location**: `test/unit/application/use-case/`
- **Coverage**:
  - `invoice/generate/` - Invoice generation logic
  - `contract/list/` - Contract listing logic
  - `email/send/invoice/` - Email sending logic
- **Tests**: 25+ test cases

#### Service Tests

- **Location**: `test/unit/application/service/`
- **Coverage**:
  - `invoice.service.spec.ts` - Invoice service orchestration
- **Tests**: 15+ test cases

#### Infrastructure Tests

- **Location**: `test/unit/infra/`
- **Coverage**:
  - `mediator/native/` - Event mediator pattern
  - `presenter/json/` - JSON presentation logic
- **Tests**: 25+ test cases

#### Decorator & Utility Tests

- **Location**: `test/unit/decorators/` & `test/unit/utils/`
- **Coverage**:
  - `logger.decorator.spec.ts` - Logging decorator
  - `load.util.spec.ts` - Module loading utilities
  - `metadata.util.spec.ts` - Metadata utilities
- **Tests**: 30+ test cases

**Total Unit Tests**: ~160 test cases

---

### ✅ Integration Tests (Middle of Pyramid) - ~20-30%

**Purpose**: Test interactions between components

#### Repository Tests

- **Location**: `test/integration/repository/`
- **Coverage**:
  - `contract/contract.repository.spec.ts` - Database contract operations
  - `payment/payment.repository.spec.ts` - Database payment operations
- **Tests**: 25+ test cases

#### Database Tests

- **Location**: `test/integration/infra/database/`
- **Coverage**:
  - `postgres/pgpromise.connection.spec.ts` - Database connection
- **Tests**: 8+ test cases

#### Service Integration Tests

- **Location**: `test/integration/service/`
- **Coverage**:
  - `invoice/invoice.service.integration.spec.ts` - Full service flow
- **Tests**: 12+ test cases

**Total Integration Tests**: ~45 test cases

---

### ✅ E2E Tests (Top of Pyramid) - ~10%

**Purpose**: Test complete user flows through the API

#### API Tests

- **Location**: `test/E2E/invoice/`
- **Coverage**:
  - `invoice.e2e.spec.ts` - Complete invoice generation flow
- **Scenarios**:
  - POST /invoice with accrual strategy
  - POST /invoice with cash strategy
  - Complete user journeys
  - Event publishing verification
  - Database integration
- **Tests**: 15+ test cases

**Total E2E Tests**: ~15 test cases

---

## 🛠️ Test Helpers & Utilities

### Test Fixtures

**Location**: `test/helpers/fixtures.ts`

- `createContract()` - Create test contract entities
- `createPayment()` - Create test payment entities
- `createInvoice()` - Create test invoice entities
- `createContractWithPayments()` - Create complete contract with payments

### Database Helper

**Location**: `test/helpers/database.helper.ts`

- `MockDatabaseConnection` - Mock SQL database for testing
- `DatabaseTestHelper` - Helper methods for database testing

### Mediator Helper

**Location**: `test/helpers/mediator.helper.ts`

- `MockMediator` - Mock event mediator for testing
- Event tracking and verification

---

## 🚀 Running Tests

### Run All Tests

```bash
npm test
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Run Tests in Watch Mode

```bash
npm run test:dev
```

### Run Tests in Docker

```bash
npm run test:docker
```

### Run Specific Test Suite

```bash
# Unit tests only
npm test -- test/unit

# Integration tests only
npm test -- test/integration

# E2E tests only
npm test -- test/E2E

# Specific file
npm test -- test/unit/domain/entity/contract/contract.entity.spec.ts
```

---

## 📈 Coverage Goals

- **Overall Coverage**: Target 100%
- **Statements**: 100%
- **Branches**: 100%
- **Functions**: 100%
- **Lines**: 100%

### Coverage Reports

Coverage reports are generated in:

- **HTML**: `coverage/lcov-report/index.html`
- **LCOV**: `coverage/lcov.info`
- **JSON**: `coverage/coverage-final.json`
- **Clover**: `coverage/clover.xml`

---

## 🎨 Test Naming Conventions

### Test File Naming

- Unit Tests: `*.spec.ts`
- Integration Tests: `*.spec.ts` or `*.integration.spec.ts`
- E2E Tests: `*.e2e.spec.ts`

### Test Description Format

```typescript
describe("[TYPE] Component - Description", () => {
  // [UNIT] for unit tests
  // [INTEGRATION] for integration tests
  // [E2E] for end-to-end tests
});
```

### Test Case Format

```typescript
test("Should [action] [expected result]", () => {
  // Arrange
  // Act
  // Assert
});
```

---

## 🧪 Test Patterns Used

### 1. **AAA Pattern** (Arrange-Act-Assert)

```typescript
test("Should calculate balance correctly", () => {
  // Arrange
  const contract = createContract({ amount: 1000 });

  // Act
  const balance = contract.getBalance();

  // Assert
  expect(balance).toBe(1000);
});
```

### 2. **Mocking & Stubbing**

```typescript
const mockRepository = {
  list: jest.fn().mockResolvedValue([...]),
};
```

### 3. **Test Fixtures**

```typescript
const contract = TestFixtures.createContract();
```

### 4. **beforeEach/afterEach**

```typescript
beforeEach(() => {
  // Setup before each test
});

afterEach(() => {
  // Cleanup after each test
});
```

---

## 🔍 Key Testing Features

### ✅ Comprehensive Coverage

- All entities tested
- All strategies tested
- All use cases tested
- All services tested
- All repositories tested
- Infrastructure components tested

### ✅ Test Pyramid Compliance

- 70% Unit Tests (fast, isolated)
- 20% Integration Tests (component interaction)
- 10% E2E Tests (full system)

### ✅ Mocking & Isolation

- Database mocked for unit/integration tests
- External dependencies mocked
- Event system mocked and verifiable

### ✅ Real-world Scenarios

- Complete user journeys tested
- Edge cases covered
- Error scenarios tested
- Boundary conditions verified

---

## 📝 Test Maintenance

### Adding New Tests

1. **For new entities/models**:
   - Create unit test in `test/unit/domain/entity/`
   - Test all methods and properties
   - Test immutability where applicable

2. **For new use cases**:
   - Create unit test in `test/unit/application/use-case/`
   - Mock all dependencies
   - Test happy path and error scenarios

3. **For new repositories**:
   - Create integration test in `test/integration/repository/`
   - Use mock database connection
   - Test CRUD operations

4. **For new API endpoints**:
   - Add E2E test in `test/E2E/`
   - Test complete request/response cycle
   - Verify side effects (events, database changes)

---

## 🎯 Best Practices

1. **Keep tests isolated** - No test should depend on another
2. **Use descriptive names** - Test name should describe what's being tested
3. **Test one thing at a time** - Each test should verify one behavior
4. **Mock external dependencies** - Don't rely on external services
5. **Keep tests fast** - Unit tests should run in milliseconds
6. **Clean up after tests** - Reset mocks and state
7. **Test edge cases** - Don't just test the happy path
8. **Maintain test code quality** - Tests are code too!

---

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/)
- [Testing Best Practices](https://testingjavascript.com/)
- [Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html)
- [TypeScript Testing](https://www.typescriptlang.org/docs/handbook/testing.html)

---

**Total Test Suite**: 220+ test cases across all levels
**Coverage Target**: 100%
**Execution Time**: < 10 seconds for unit tests
