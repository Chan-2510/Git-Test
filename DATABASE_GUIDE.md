# 🗄️ Database Guide for Next.js

## 📊 Database Options for Next.js

### Option 1: **Prisma + PostgreSQL** (Recommended - Professional)
- ✅ Best for production apps
- ✅ Type-safe database access
- ✅ Easy migrations
- ⚠️ Requires setup

### Option 2: **Prisma + SQLite** (Easiest - Local Testing)
- ✅ No server needed
- ✅ File-based database
- ✅ Perfect for learning
- ⚠️ Not for production

### Option 3: **MongoDB** (Modern)
- ✅ NoSQL (flexible schema)
- ✅ Cloud-hosted option
- ⚠️ Different query language

### Option 4: **Supabase** (Easiest Production)
- ✅ PostgreSQL in the cloud
- ✅ Free tier available
- ✅ No server management
- ✅ Built-in authentication

---

## 🚀 Quick Start: Prisma + SQLite (Let's Do This!)

### Step 1: Install Prisma
```bash
npm install @prisma/client
npm install -D prisma
```

### Step 2: Initialize Prisma
```bash
npx prisma init
```

This creates:
- `.env.local` - Database URL
- `prisma/schema.prisma` - Database schema

### Step 3: Set Up SQLite Database

**Edit `prisma/schema.prisma`:**

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Todo {
  id    Int     @id @default(autoincrement())
  title String
  completed Boolean @default(false)
  createdAt DateTime @default(now())
}
```

### Step 4: Update `.env.local`

```
DATABASE_URL="file:./dev.db"
```

### Step 5: Create Database
```bash
npx prisma migrate dev --name init
```

This creates:
- `prisma/dev.db` - Your actual database file
- `prisma/migrations/` - Track changes

---

## 💾 Example: Todo App with Database

### Step 1: Create API Route

**File: `app/api/todos/route.js`**

```javascript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET all todos
export async function GET() {
  try {
    const todos = await prisma.todo.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return Response.json(todos);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create new todo
export async function POST(request) {
  try {
    const data = await request.json();
    const todo = await prisma.todo.create({
      data: {
        title: data.title
      }
    });
    return Response.json(todo, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
```

### Step 2: Create Update Route

**File: `app/api/todos/[id]/route.js`**

```javascript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// UPDATE a todo
export async function PUT(request, { params }) {
  try {
    const id = parseInt(params.id);
    const data = await request.json();
    
    const todo = await prisma.todo.update({
      where: { id },
      data: {
        title: data.title || undefined,
        completed: data.completed || undefined
      }
    });
    
    return Response.json(todo);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// DELETE a todo
export async function DELETE(request, { params }) {
  try {
    const id = parseInt(params.id);
    const todo = await prisma.todo.delete({
      where: { id }
    });
    return Response.json(todo);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
```

### Step 3: Create Frontend Component

**File: `app/todos/page.tsx`**

```typescript
'use client';

import { useState, useEffect } from 'react';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
}

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch todos on page load
  useEffect(() => {
    fetchTodos();
  }, []);

  // GET todos from database
  const fetchTodos = async () => {
    try {
      const response = await fetch('/api/todos');
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.error('Error fetching todos:', error);
    }
  };

  // POST - Create new todo
  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: input })
      });
      const newTodo = await response.json();
      setTodos([newTodo, ...todos]);
      setInput('');
    } catch (error) {
      console.error('Error adding todo:', error);
    }
    setLoading(false);
  };

  // PUT - Toggle todo completion
  const toggleTodo = async (id: number, completed: boolean) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed })
      });
      const updated = await response.json();
      setTodos(todos.map(t => (t.id === id ? updated : t)));
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  // DELETE - Remove todo
  const deleteTodo = async (id: number) => {
    try {
      await fetch(`/api/todos/${id}`, { method: 'DELETE' });
      setTodos(todos.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8 text-black dark:text-white">
        My Todo List
      </h1>

      {/* Add Todo Form */}
      <form onSubmit={addTodo} className="flex gap-2 mb-6">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a new todo..."
          className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-800 dark:text-white"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
        >
          Add
        </button>
      </form>

      {/* Todo List */}
      <div className="space-y-2">
        {todos.length === 0 ? (
          <p className="text-gray-500">No todos yet. Add one above!</p>
        ) : (
          todos.map(todo => (
            <div
              key={todo.id}
              className="flex items-center gap-4 p-4 border rounded-lg bg-white dark:bg-gray-800"
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id, todo.completed)}
                className="w-5 h-5 cursor-pointer"
              />
              <span
                className={`flex-1 ${
                  todo.completed
                    ? 'line-through text-gray-500'
                    : 'text-black dark:text-white'
                }`}
              >
                {todo.title}
              </span>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
```

---

## 📚 Understanding CRUD Operations

| Operation | What It Does | Example |
|-----------|-------------|---------|
| **C**reate | Add new data | Add a todo |
| **R**ead | Get data | Show all todos |
| **U**pdate | Change data | Mark todo as done |
| **D**elete | Remove data | Delete a todo |

---

## 🔧 Useful Prisma Commands

```bash
# Create migration after schema changes
npx prisma migrate dev --name add_description

# Open Prisma Studio (visual database editor)
npx prisma studio

# Reset database (careful!)
npx prisma migrate reset

# Generate Prisma client
npx prisma generate
```

---

## 🛡️ API Route Structure

```
app/
├── api/
│   └── todos/
│       ├── route.ts        ← GET all, POST new
│       └── [id]/
│           └── route.ts    ← PUT update, DELETE
```

---

## ⚠️ Important Rules

### ✅ Always Use API Routes
- **Frontend** (React components) → calls → **API Routes** → → calls → **Database**
- **Never connect to database directly from components!**

### ❌ Wrong Way:
```typescript
// ❌ BAD - Direct database access in component
import { PrismaClient } from '@prisma/client';

export default function Page() {
  const prisma = new PrismaClient();
  const todos = prisma.todo.findMany(); // ❌ WRONG!
}
```

### ✅ Right Way:
```typescript
// ✅ GOOD - Use API route
const response = await fetch('/api/todos');
const todos = await response.json();
```

---

## 🚀 Next Steps After Setup

1. **Run migrations**: `npx prisma migrate dev --name init`
2. **Create API routes**: `app/api/todos/route.ts`
3. **Create frontend**: Component with fetch calls
4. **Test in browser**: Go to `/todos` page
5. **Check database**: Run `npx prisma studio`

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| Migration failed | Delete `prisma/dev.db` and run `npx prisma migrate dev --name init` |
| API not found | Check folder structure: `app/api/todos/route.ts` |
| Database not saving | Check if API response is 201 (created) or error |
| TypeScript errors | Run `npm install` and `npx prisma generate` |

---

## 📖 Resources

- Prisma Docs: https://www.prisma.io/docs
- Next.js API Routes: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- Database choice guide: https://www.prisma.io/docs/concepts/database-connectors

Happy coding! 🎉
