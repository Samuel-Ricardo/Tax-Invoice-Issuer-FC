# Exemplo Simples de Ponta a Ponta - Zod

## 1️⃣ Exemplo Mais Simples Possível

```typescript
import { z } from "zod";

// 1. Definir o schema
const userSchema = z.object({
  name: z.string(),
  age: z.number(),
});

// 2. Validar dados
const validData = { name: "João", age: 25 };
const result = userSchema.parse(validData); // ✅ Sucesso!
console.log(result); // { name: "João", age: 25 }

// 3. Dados inválidos lançam erro
try {
  userSchema.parse({ name: "Maria", age: "25" }); // ❌ age é string
} catch (error) {
  console.error(error.errors); // Mostra os erros de validação
}
```

---

## 2️⃣ Exemplo com SafeParse (Sem Lançar Erro)

```typescript
import { z } from "zod";

const userSchema = z.object({
  name: z.string(),
  age: z.number(),
});

// safeParse retorna um objeto com success/error
const result = userSchema.safeParse({ name: "Pedro", age: "30" });

if (result.success) {
  console.log("Dados válidos:", result.data);
} else {
  console.log("Erros:", result.error.errors);
}
```

---

## 3️⃣ Exemplo de Ponta a Ponta - API REST

### Schema de Validação

```typescript
// schemas/user.schema.ts
import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  age: z.number().min(18, "Idade mínima é 18 anos").max(120),
  cpf: z.string().regex(/^\d{11}$/, "CPF deve ter 11 dígitos"),
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
      // Valida os dados da requisição
      const validatedData = createUserSchema.parse(req.body);

      // Aqui você tem certeza que os dados estão válidos
      // validatedData é tipado automaticamente!
      const user = await this.userService.create(validatedData);

      return res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Dados inválidos",
          errors: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }

      return res.status(500).json({ message: "Erro interno" });
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
    // data já está validado e tipado
    // TypeScript sabe exatamente quais campos existem

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

### Teste

```typescript
// user.spec.ts
import { createUserSchema } from "../schemas/user.schema";

describe("User Schema Validation", () => {
  it("deve validar dados corretos", () => {
    const validData = {
      name: "João Silva",
      email: "joao@example.com",
      age: 25,
      cpf: "12345678901",
    };

    const result = createUserSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("deve rejeitar email inválido", () => {
    const invalidData = {
      name: "Maria",
      email: "email-invalido",
      age: 30,
      cpf: "12345678901",
    };

    const result = createUserSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain("Email inválido");
    }
  });
});
```

---

## 4️⃣ Validações Comuns

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

  // Opcional
  phone: z.string().optional(),

  // Com valor padrão
  role: z.string().default("user"),

  // Array
  tags: z.array(z.string()),

  // Enum
  status: z.enum(["active", "inactive", "pending"]),

  // Objeto aninhado
  address: z.object({
    street: z.string(),
    number: z.number(),
    city: z.string(),
  }),
});
```

---

## 5️⃣ Fluxo Completo de Ponta a Ponta

```
┌─────────────┐
│   Cliente   │
└──────┬──────┘
       │ POST /users
       │ { "name": "João", "email": "joao@example.com", "age": 25, "cpf": "12345678901" }
       ▼
┌─────────────────┐
│   Controller    │ ◄─── Valida com Zod Schema
└────────┬────────┘
         │ Dados validados ✅
         ▼
┌─────────────────┐
│    Service      │ ◄─── Recebe dados tipados
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Repository    │ ◄─── Salva no banco
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Response      │ ◄─── Retorna usuário criado
└─────────────────┘
```

---

## 📝 Resumo

1. **Defina o schema** com `z.object()` e suas validações
2. **Valide com `.parse()`** (lança erro) ou `.safeParse()` (retorna objeto)
3. **Extraia o tipo** com `z.infer<typeof schema>`
4. **Trate erros** de validação com `ZodError`
5. **Use em toda a aplicação** para garantir type-safety

### Vantagens

✅ Validação em runtime  
✅ Tipagem automática do TypeScript  
✅ Mensagens de erro customizáveis  
✅ Performance excelente  
✅ Fácil de testar
