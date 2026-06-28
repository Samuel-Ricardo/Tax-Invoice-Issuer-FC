# Simple End-to-End Example - Zod

## 1️⃣ Simplest Possible Example

```typescript
import { z } from "zod";

// 1. Define the schema
const userSchema = z.object({
  name: z.string(),
  age: z.number(),
});

// 2. Validate data
const validData = { name: "John", age: 25 };
const result = userSchema.parse(validData); // ✅ Success!
console.log(result); // { name: "John", age: 25 }

// 3. Invalid data throws error
try {
  userSchema.parse({ name: "Maria", age: "25" }); // ❌ age is string
} catch (error) {
  console.error(error.errors); // Shows validation errors
}
```

---

## 2️⃣ Example with SafeParse (Without Throwing Error)

```typescript
import { z } from "zod";

const userSchema = z.object({
  name: z.string(),
  age: z.number(),
});

// safeParse returns object with success/error
const result = userSchema.safeParse({ name: "Pedro", age: "30" });

if (result.success) {
  console.log("Valid data:", result.data);
} else {
  console.log("Errors:", result.error.errors);
}
```

---

## 3️⃣ End-to-End Example - REST API

### Validation Schema

```typescript
// schemas/user.schema.ts
import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(3, "Name must have at least 3 characters"),
  email: z.string().email("Invalid email"),
  age: z.number().min(18, "Minimum age is 18 years").max(120),
  cpf: z.string().regex(/^\d{11}$/, "CPF must have 11 digits"),
});

export type CreateUserDTO = z.infer<typeof createUserSchema>;
```

### Controller

```typescript
// controller/user.controller.ts
import { Request, Response } from "express";
import { createUserSchema } from "../schemas/user.schema";

export class UserController {
  async create(req: Request, res: Response) {
    try {
      // Validates request data
      const validatedData = createUserSchema.parse(req.body);

      // Here you're sure that data is valid
      // validatedData is automatically typed!
      const user = await this.userService.create(validatedData);

      return res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Invalid data",
          errors: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }

      return res.status(500).json({ message: "Internal error" });
    }
  }
}
```

### Service

```typescript
// service/user.service.ts
import { CreateUserDTO } from "../schemas/user.schema";

export class UserService {
  async create(data: CreateUserDTO) {
    // data is already validated and typed
    // TypeScript knows exactly which fields exist

    return {
      id: Math.random().toString(),
      name: data.name,
      email: data.email,
      age: data.age,
      cpf: data.cpf,
      createdAt: new Date(),
    };
  }
}
```

### Test

```typescript
// user.spec.ts
import { createUserSchema } from "../schemas/user.schema";

describe("User Schema Validation", () => {
  it("should validate correct data", () => {
    const validData = {
      name: "John Silva",
      email: "john@example.com",
      age: 25,
      cpf: "12345678901",
    };

    const result = createUserSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject invalid email", () => {
    const invalidData = {
      name: "Maria",
      email: "invalid-email",
      age: 30,
      cpf: "12345678901",
    };

    const result = createUserSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain("Invalid email");
    }
  });
});
```

---

## 4️⃣ Common Validations

```typescript
import { z } from "zod";

const schema = z.object({
  // String
  name: z.string(),
  email: z.string().email(),
  url: z.string().url(),

  // Number
  age: z.number().min(0).max(150),
  price: z.number().positive(),

  // Boolean
  active: z.boolean(),

  // Date
  birthDate: z.date(),

  // Optional
  phone: z.string().optional(),

  // With default value
  role: z.string().default("user"),

  // Array
  tags: z.array(z.string()),

  // Enum
  status: z.enum(["active", "inactive", "pending"]),

  // Nested object
  address: z.object({
    street: z.string(),
    number: z.number(),
    city: z.string(),
  }),
});
```

---

## 5️⃣ Complete End-to-End Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ POST /users
       │ { "name": "John", "email": "john@example.com", "age": 25, "cpf": "12345678901" }
       ▼
┌─────────────────┐
│   Controller    │ ◄─── Validates with Zod Schema
└────────┬────────┘
         │ Validated data ✅
         ▼
┌─────────────────┐
│    Service      │ ◄─── Receives typed data
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Repository    │ ◄─── Saves to database
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Response      │ ◄─── Returns created user
└─────────────────┘
```

---

## 📝 Summary

1. **Define the schema** with `z.object()` and its validations
2. **Validate with `.parse()`** (throws error) or `.safeParse()` (returns object)
3. **Extract the type** with `z.infer<typeof schema>`
4. **Handle validation** errors with `ZodError`
5. **Use throughout the application** to guarantee type-safety

### Advantages

✅ Runtime validation  
✅ Tipagem automática do TypeScript  
✅ Mensagens de erro customizáveis  
✅ Performance excelente  
✅ Fácil de testar
