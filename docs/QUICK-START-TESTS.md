# Quick Start - Automated Tests

Guide to running the project's test suite on your machine.

> ✅ This project uses **`npm`** (not pnpm). All commands below use `npm` and have been verified against the real `package.json` scripts.

---

## 📋 Prerequisites

### Required to Run the Tests

```bash
✅ Node.js >= 18.x (verify with: node --version)
✅ npm >= 9.x (comes with Node.js)
✅ PostgreSQL database (only for E2E tests)
```

**The tests DO NOT require** (these are only needed to run the application):

- ❌ Prisma configured (the `prisma` dependency exists but is unused — SQLite is only used by the legacy Python branch)
- ❌ Infisical
- ❌ Redis

---

## 🚀 Quick Start (3 commands)

```bash
# 1. Install dependencies
npm install

# 2. Configure the environment (optional — test/setup-env.ts already defines DATABASE_URL)
cp .env.example .env

# 3. Run all tests
npm test
```

**That's it!** The tests will run automatically.

---

## 🔧 Environment Setup (if needed)

If you run into issues, configure the environment manually:

### 1. Copy the `.env` file

```bash
cp .env.example .env
```

### 2. Edit `.env` if necessary

The project already comes with functional settings for the tests (`test/setup-env.ts` sets `DATABASE_URL=postgresql://test:test@localhost:5432/testdb` for the test process). For manual E2E runs you may want a real database:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/tax_invoice_test"
```

### 3. Database schema (for E2E tests)

```bash
# The db:sync script is currently broken (no prisma/schema.prisma exists).
# Apply the schema manually instead:
psql $DATABASE_URL -f migration/create.sql   # destructive: recreates and seeds the sam schema
```

### 4. (Optional) Start PostgreSQL with Docker

If you don't have PostgreSQL installed:

```bash
# Quick PostgreSQL
docker run -d \
  --name postgres-test \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=tax_invoice_test \
  -p 5432:5432 \
  postgres:17
```

---

## ✅ Verify Installation

### 1. Check the environment

```bash
node --version        # Must be >= v18.0.0
npm --version         # Must be >= 9.0.0
```

### 2. Run a simple test

```bash
npm test -- --testPathPattern="invoice" --silent
```

---

## 🧪 Run the Tests

### All tests (default)

```bash
npm test
```

**What it does:**

- Runs all 34 spec files (226 test cases)
- Automatically generates a coverage report (required by the Jest config)

**Expected execution time:** ~15 seconds

---

### Unit tests only

```bash
npm test -- --testPathIgnorePatterns="E2E|integration"
```

Or:

```bash
npx jest test/unit
```

---

### Integration tests

```bash
npx jest test/integration
```

---

### E2E tests (require a database)

```bash
# First ensure PostgreSQL is running, then:
npx jest test/E2E
```

**⚠️ Attention:** E2E tests **require** the `sam` schema and the seed data to exist.

---

### Watch mode (development)

```bash
npm run test:dev
# or
npx jest --watch
```

---

### Coverage only

```bash
npm run test:coverage
```

**Outputs:**

- Terminal: summary table
- `coverage/lcov-report/index.html`: detailed report (open in a browser)

---

## 📊 Understand the Results

### ✅ All tests passed

```
Test Suites: 34 passed, 34 total
Tests:       226 passed, 226 total
Snapshots:   0 total
Time:        10.045 s
```

### ❌ Failures

If tests fail, you will see something like:

```
 FAIL  test/unit/application/usecase/generate-invoices.spec.ts
  ● GenerateInvoices Use Case › should generate invoices

    Expected: 1
    Received: 0
```

**Next steps:**

1. Read the full error message
2. Check if PostgreSQL is running (if it is an E2E/integration test)
3. Reinstall dependencies: `rm -rf node_modules && npm install`

---

## 📁 Test Structure

```
test/
├── unit/                          # Unit tests (no database)
│   ├── application/
│   │   ├── service/               # Services (invoice, email)
│   │   │   ├── invoice.service.spec.ts
│   │   │   └── email.service.spec.ts
│   │   ├── usecase/               # Use cases
│   │   │   ├── generate-invoices.spec.ts
│   │   │   └── send-invoice-email.spec.ts
│   │   └── gateway/               # HTTP gateways
│   ├── domain/
│   │   ├── entity/                # Domain entities
│   │   │   ├── contract.spec.ts
│   │   │   ├── invoice.spec.ts
│   │   │   └── payment.spec.ts
│   │   ├── service/               # Domain services (heuristics)
│   │   ├── repository/            # In-memory repositories
│   │   └── strategy/              # Accrual/cash strategies
│   ├── infra/
│   │   ├── router/                # HTTP routers
│   │   └── validator/             # Zod validators
│   ├── @decorator/                # Custom decorators
│   │   └── validate.spec.ts
│   ├── @lib/                      # Shared libraries
│   │   └── registry.spec.ts
│   └── utils/                     # Mediator (event emitter)
│ ├── integration/                 # Integration tests
│   ├── invoice-service.integration.spec.ts
│   └── contract-strategy.integration.spec.ts
├── E2E/                           # End-to-end tests (5 suites)
│   ├── server.spec.ts             # Server bootstrap
│   ├── http.spec.ts               # HTTP layer
│   ├── invoice.spec.ts            # POST /invoice (input=1 & input=2)
│   ├── strategy.spec.ts           # Strategy endpoint behavior
│   └── email.spec.ts              # Email flow via mediator / MailHog
└── @mocks/mock-contract-generator.ts  # Mock factories
```

**Total: 34 spec files / 226 test cases**

---

## 🔍 Specific Types of Tests

### Test a specific file

```bash
npx jest path/to/file.spec.ts
```

### Test by name pattern

```bash
npx jest -t "should generate invoices"
```

### Test in a specific folder

```bash
nwpx jest test/unit/domain
```

### With verbose output (more details)

```bash
npx jest --verbose
```

### Silent mode (less output)

```bash
npx jest --silent
```

---

## 🐛 Common Problems and Solutions

### Error: "Cannot connect to database"

```bash
# Check if PostgreSQL is running
pg_isready -h localhost -p 5432

# If using Docker:
docker ps | grep postgres
```

**Solution:** Start the database or temporarily disable integration tests:

```bash
npm test -- --testPathIgnorePatterns="integration|E2E"
```

---

### Error: "relation 'contract' does not exist" (or: relation "sam.contract" does not exist)

**Cause:** The migrations were not run / the `sam` schema is missing.

**Solution:**

```bash
psql $DATABASE_URL -f migration/create.sql
# ⚠️ destructive — drops and recreates the sam schema with seed data (this is intentional for the study environment)
```

---

### Error: "Module not found"

```bash
rm -rf node_modules package-lock.json
npm install
```

---

### Error: "punycode deprecated" (warning, not an error)

This is a warning from Node.js 21+ about an old dependency. It **does not affect** the tests.

---

## 📈 Expected Coverage

The project aims for the following minimum coverage (the Jest config uses the `v8` provider and always collects coverage):

| Category      | Target |
| ------------- | ------ |
| **Global**    | 80%+   |
| **Services**  | 85%+   |
| **Use Cases** | 80%+   |
| **Entities**  | 90%+   |

**Current result (reported):** ~85–90% of critical statements — statements 58%, branches 69%, functions 54%, lines 58% in the latest run across 34 suites.

---

## 🎯 Daily Workflow

### During development (TDD)

```bash
# 1. Write the test
vim test/unit/application/usecase/my-feature.spec.ts

# 2. Run in watch mode
npm run test:dev

# 3. Implement the code
# 4. Tests pass ✅
```

### Before committing

```bash
npm run code:ci    # format + lint + tests (the real CI script)
```

---

## 📚 Additional Documentation

- [docs/analysis/DEEP-ANALYSIS.md](../docs/analysis/DEEP-ANALYSIS.md) - Deep technical analysis
- [docs/analysis/TESTING.md](../docs/analysis/TESTING.md) - Test suite guide
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution guide
- [README.md](../README.md) - Project overview

---

## 🆘 Still Having Issues?

1. **Check the Node.js version:** `node --version` (must be >= 18)
2. **Clean and reinstall:** `rm -rf node_modules package-lock.json && npm install`
3. **Check environment variables:** Does the `.env` exist? Is `DATABASE_URL` correct?
4. **Check connectivity:** `psql $DATABASE_URL -c "SELECT 1"`

---

## ✅ Validation Checklist

Before running the tests for the first time:

- [ ] Node.js >= 18 installed
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file present (or rely on `test/setup-env.ts` defaults)
- [ ] `DATABASE_URL` configured in the environment (optional for unit tests)
- [ ] PostgreSQL running (only for integration/E2E tests)
- [ ] Migrations executed: `psql $DATABASE_URL -f migration/create.sql`

**All set?** Run `npm test` and enjoy! 🎉

---

## 🚀 Useful Commands

```bash
# Complete setup from scratch
npm install && cp .env.example .env && npm test

# Run only fast tests (TDD)
npm run test:dev

# Full report before a PR
npm run test:coverage

# Clean everything and start over (nuclear option)
rm -rf node_modules dist coverage && npm install
```

---

**Last updated:** 2026-09-02
**Version:** 1.1.0 (revised: real script names, 34 suites / 226 tests, 5 E2E suites, Prisma clarified)
