# 📘 Using the Zod Library (v4)

This document demonstrates how to use **Zod 4** for real-time data
validation in TypeScript. It covers the fundamentals of schema creation,
the difference between throwing and non-throwing validation, and how to
read error `issues`.

> **Version note:** this project uses Zod 4.3.6. Zod 4 changed some APIs —
> `z.email()` is a top-level function (not `z.string().email()`), and
> validation errors are exposed as `error.issues` (not `error.errors`).
> All examples below follow the Zod 4 API actually used in `src/`.

---

## 📋 Table of contents

- [What is Zod?](#-what-is-zod)
- [Creating the user schema](#-creating-the-user-schema)
- [Throwing validation with `.parse()`](#-throwing-validation-with-parse)
- [Safe validation with `.safeParse()`](#-safe-validation-with-safeparse)
- [Error `issues` structure](#-error-issues-structure)
- [Handling validation results](#-handling-validation-results)
- [Type inference](#-type-inference)
- [Running the example](#-running-the-example)
- [Best practices](#-best-practices)

---

## 🧩 What is Zod?

**Zod** is a TypeScript-first validation library that lets you:

- ✅ Define **schemas** declaratively
- ✅ Validate data at runtime
- ✅ Infer static types automatically
- ✅ Customize error messages

---

## 🏗️ Creating the user schema

```typescript
import { z } from "zod";

/**
 * User validation schema
 * Demonstrates different types of Zod 4 validation
 */
export const userSchema = z.object({
  name: z.string().min(2, "Name must have at least 2 characters"),
  email: z.email("Invalid email format"), // Zod 4: top-level z.email()
  age: z.number().positive("Age must be a positive number"),
});
```

**Breakdown:**

| Method         | Description                            |
| -------------- | -------------------------------------- |
| `z.string()`   | Validates that the value is a string   |
| `.min(2)`      | Minimum length of 2 characters         |
| `z.email()`    | Email validation (Zod 4 top-level API) |
| `z.number()`   | Validates that the value is a number   |
| `.positive()`  | Only positive numbers                  |
| Custom strings | Custom error messages (2nd argument)   |

---

## ⚠️ Throwing validation with `.parse()`

```typescript
const user1 = { name: "John", email: "john@email.com", age: 30 };

console.log("Testing with valid data...");
try {
  const result1 = userSchema.parse(user1);
  console.log("✓ Successful validation:", result1);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.log("✗ Validation error (parse):", error.issues);
  }
}
```

**Behavior:**

- ✅ **Valid data** → returns typed data
- ❌ **Invalid data** → **throws a `ZodError` exception**

---

## 🛡️ Safe validation with `.safeParse()`

```typescript
const user2 = { name: "J", email: "invalid-email", age: -5 };

console.log("Testing with invalid data...");
const result2 = userSchema.safeParse(user2);

if (!result2.success) {
  console.log("✗ Validation errors (safeParse):");
  result2.error.issues.forEach((issue) => {
    console.log(`- Field [${issue.path.join(".")}]: ${issue.message}`);
  });
} else {
  console.log("✓ Valid data:", result2.data);
}
```

**Behavior:**

- ✅ **Does not throw** exceptions
- ✅ Returns an object with the result
- ✅ Ideal for form handling

---

## 🔍 Error `issues` structure

When validation fails, each issue contains:

```typescript
{
  code: string;        // Error type, e.g. "too_small", "invalid_format"
  path: string[];      // Path to the field, e.g. ["email"]
  message: string;     // Descriptive error message
  minimum?: number;    // For numeric/size validations
  // ...additional fields depending on the failed check
}
```

**Practical example:**

```typescript
const invalidData = { email: "invalid", age: -5 };
const result = userSchema.safeParse(invalidData);

if (!result.success) {
  result.error.issues.forEach((issue) => {
    console.log(`Path: ${issue.path.join(".")}`);
    console.log(`Code: ${issue.code}`);
    console.log(`Message: ${issue.message}`);
    console.log("---");
  });
}
```

---

## ✅ Handling validation results

```typescript
// Pattern 1: with safeParse (recommended for UIs)
const result = userSchema.safeParse(data);

if (result.success) {
  // Typed data available
  console.log("Validated user:", result.data);
} else {
  // Treat errors
  const errors = result.error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
  console.log("Errors:", errors);
}

// Pattern 2: with try/catch (parse)
try {
  const user = userSchema.parse(data);
  console.log("Validated user:", user);
} catch (error) {
  if (error instanceof z.ZodError) {
    error.issues.forEach((issue) => {
      console.error(`${issue.path.join(".")}: ${issue.message}`);
    });
  }
}
```

---

## 🎯 Type inference

Zod allows automatic TypeScript type inference:

```typescript
import { z } from "zod";

const userSchema = z.object({
  name: z.string(),
  email: z.email(),
  age: z.number(),
});

// Automatic type inference
type User = z.infer<typeof userSchema>;

// Equivalent to:
// type User = {
//   name: string;
//   email: string;
//   age: number;
// }

function processUser(user: User) {
  // TypeScript knows the types!
  console.log(user.name.toUpperCase());
  console.log(user.email.toLowerCase());
  console.log(user.age.toFixed(0));
}
```

---

## 🚀 Running the example

### Compile and run

```bash
# Using ts-node (installed as a dependency)
npx ts-node docs/zod-example.md.ts
```

> **Note:** this documentation page is a narrative example; the canonical
> runnable specs live under `test/` (`npm test`).

### Expected output (success)

```text
Testing with valid data...
✓ Successful validation: { name: 'John', email: 'john@email.com', age: 30 }
```

**Expected output (failures):**

```text
Testing with invalid data...
✗ Validation errors (safeParse):
- Field [name]: Name must have at least 2 characters
- Field [email]: Invalid email format
- Field [age]: Age must be a positive number
```

---

## 📚 Best practices

### ✅ DO

- Use `.safeParse()` when you need controlled error handling
- Use `.parse()` when invalid data should stop execution
- Provide custom, clear error messages
- Combine validations: `.min()`, `.max()`, `.email()` (via `z.email()` in v4)
- Use `z.infer<>` for automatic typing
- Compose schemas with `.extend()`, `.merge()`, `.pick()`

### ❌ DON'T

- Skip validation assuming data is correct
- Use `any` or type assertions without validation
- Leave generic messages like "invalid data"
- Validate the same data repeatedly in different places
- Rely on Zod 3 APIs (`z.string().email()`, `error.errors`) — removed/deprecated in Zod 4

---

## 🔗 Useful resources

- [Official Zod documentation](https://zod.dev/)
- [Zod on GitHub](https://github.com/colinhacks/zod)
- [Zod 4 migration guide](https://zod.dev/v4/changelog)
- [TypeScript documentation](https://www.typescriptlang.org/)
- [Zod playground](../test/types-sandbox/zod-validator.sandbox.ts) — runnable sandbox in this repo

---

**Author:** Samuel Ricardo
**Project:** Tax Invoice Issuer - Full Cycle
**Date:** 2025 · **Reviewed:** 2026-09-02 (Zod 4 update + English translation)

> 💡 **Tip:** Zod integrates perfectly with Express middleware, REST APIs,
> and form validation. See the applied decorator
> [`@Validate()`](../src/@modules/application/decorators/validate.decorator.ts)
> and [ARCHITECTURE.md](./analysis/ARCHITECTURE.md).
