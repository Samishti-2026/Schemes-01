# Samishti Schemes — NestJS Backend Documentation

A **beginner-friendly, step-by-step** guide explaining how this NestJS backend works, from project structure to every line of code.

---

## Table of Contents

1. [What is NestJS?](#1-what-is-nestjs)
2. [Project Structure](#2-project-structure)
3. [Entry Point — `main.ts`](#3-entry-point--maints)
4. [Root Module — `app.module.ts`](#4-root-module--appmodulets)
5. [How Modules Work](#5-how-modules-work)
6. [Entities (Database Tables)](#6-entities-database-tables)
7. [DTOs (Data Transfer Objects)](#7-dtos-data-transfer-objects)
8. [Services (Business Logic)](#8-services-business-logic)
9. [Controllers (API Endpoints)](#9-controllers-api-endpoints)
10. [Module Wiring](#10-module-wiring)
11. [All 5 Modules Explained](#11-all-5-modules-explained)
12. [Database Seeding](#12-database-seeding)
13. [Frontend Connection](#13-frontend-connection)
14. [API Reference](#14-api-reference)
15. [How a Request Flows](#15-how-a-request-flows)

---

## 1. What is NestJS?

NestJS is a **TypeScript-first** Node.js framework for building server-side applications. It uses **decorators** (the `@` symbols) to define how code behaves.

### Key Concepts

| Concept | What it is | Analogy |
|---------|-----------|---------|
| **Module** | A group of related features | A department in a company |
| **Controller** | Handles incoming HTTP requests | A receptionist who takes requests |
| **Service** | Contains business logic | The employee who actually does the work |
| **Entity** | Defines a database table structure | A blueprint for a spreadsheet |
| **DTO** | Validates incoming data | A checklist to verify a form is filled correctly |
| **Decorator** | `@Get()`, `@Post()`, etc. | Labels/tags that tell NestJS what to do |

---

## 2. Project Structure

```
backend/
├── .env                          ← Database credentials (secret config)
├── package.json                  ← Dependencies and scripts
├── tsconfig.json                 ← TypeScript settings
│
└── src/
    ├── main.ts                   ← 🚀 App starts here
    ├── app.module.ts             ← 🏠 Root module (connects everything)
    ├── app.controller.ts         ← Default health-check endpoint
    ├── app.service.ts            ← Default service
    ├── seed.ts                   ← 🌱 Populates database with sample data
    │
    ├── schemes/                  ← 📋 Schemes feature module
    │   ├── scheme.entity.ts      ←   Database table definition
    │   ├── schemes.module.ts     ←   Module registration
    │   ├── schemes.service.ts    ←   Business logic (CRUD)
    │   ├── schemes.controller.ts ←   API endpoints
    │   └── dto/
    │       ├── create-scheme.dto.ts  ← Validation for creating
    │       └── update-scheme.dto.ts  ← Validation for updating
    │
    ├── recipients/               ← 👥 Recipients feature module
    │   ├── recipient.entity.ts
    │   ├── recipients.module.ts
    │   ├── recipients.service.ts
    │   └── recipients.controller.ts
    │
    ├── analytics/                ← 📊 Analytics feature module
    │   ├── analytics.module.ts
    │   ├── analytics.service.ts
    │   └── analytics.controller.ts
    │
    ├── settings/                 ← ⚙️ Settings feature module
    │   ├── setting.entity.ts
    │   ├── settings.module.ts
    │   ├── settings.service.ts
    │   └── settings.controller.ts
    │
    └── dashboard/                ← 🏠 Dashboard feature module
        ├── dashboard.module.ts
        ├── dashboard.service.ts
        └── dashboard.controller.ts
```

### How files relate to each other:

```
Controller  ──→  Service  ──→  Entity (via TypeORM Repository)  ──→  PostgreSQL Database
   │                │                    │
 @Get()          findAll()          @Entity('schemes')
 @Post()         create()           @Column()
 @Put()          update()           @PrimaryGeneratedColumn()
 @Delete()       remove()
```

---

## 3. Entry Point — `main.ts`

This is where the entire application **starts**. Think of it as the "ignition key."

```typescript
import { NestFactory } from '@nestjs/core';          // NestJS app builder
import { ValidationPipe } from '@nestjs/common';      // Auto-validates incoming data
import { AppModule } from './app.module';              // The root module

async function bootstrap() {
  // Step 1: Create the NestJS application from AppModule
  const app = await NestFactory.create(AppModule);

  // Step 2: Enable CORS (so the React frontend on port 5173 can talk to this API on port 3000)
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],  // Allowed frontend URLs
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',                  // Allowed HTTP methods
    credentials: true,                                           // Allow cookies
  });

  // Step 3: Enable automatic request validation
  // If someone sends bad data, NestJS will reject it before it reaches your code
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // Strip unknown properties from request body
      transform: true,            // Auto-convert strings to numbers, etc.
      forbidNonWhitelisted: false, // Don't throw error for extra fields
    }),
  );

  // Step 4: Start listening on the configured port
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Samishti Schemes API running on http://localhost:${port}`);
}

bootstrap();  // Call the function to start everything
```

**What happens when you run `npm run start:dev`:**
1. TypeScript compiles all `.ts` files
2. `main.ts` runs `bootstrap()`
3. `NestFactory.create()` reads `AppModule` and loads all modules
4. CORS and validation are configured
5. Server starts listening on port 3000

---

## 4. Root Module — `app.module.ts`

The **root module** is the "master plan" that connects all feature modules together.

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';          // Reads .env file
import { TypeOrmModule } from '@nestjs/typeorm';         // Database connection
import { Scheme } from './schemes/scheme.entity';        // Table definitions
import { Recipient } from './recipients/recipient.entity';
import { Setting } from './settings/setting.entity';

// Feature modules
import { SchemesModule } from './schemes/schemes.module';
import { RecipientsModule } from './recipients/recipients.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { SettingsModule } from './settings/settings.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    // 1. Load .env file so process.env.DATABASE_HOST works everywhere
    ConfigModule.forRoot({ isGlobal: true }),

    // 2. Connect to PostgreSQL database
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',     // From .env
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
      database: process.env.DATABASE_NAME || 'samishti_schemes',
      entities: [Scheme, Recipient, Setting],             // All table definitions
      synchronize: true,     // ⚠️ Auto-creates tables (only for development!)
    }),

    // 3. Register all feature modules
    SchemesModule,
    RecipientsModule,
    AnalyticsModule,
    SettingsModule,
    DashboardModule,
  ],
})
export class AppModule {}
```

> **`synchronize: true`** means TypeORM automatically creates/updates database tables to match your entities. In production, you'd use **migrations** instead.

---

## 5. How Modules Work

Every NestJS feature follows this pattern:

```
┌──────────────────────────────────────────────┐
│                 MODULE                        │
│                                              │
│  ┌─────────────┐      ┌─────────────┐       │
│  │ Controller   │ ───→ │  Service     │      │
│  │ (HTTP layer) │      │ (Logic)      │      │
│  └─────────────┘      └──────┬──────┘       │
│                               │              │
│                        ┌──────▼──────┐       │
│                        │  Repository  │      │
│                        │ (Database)   │      │
│                        └─────────────┘       │
│                                              │
│  imports: [TypeOrmModule.forFeature([Entity])]│
│  controllers: [Controller]                    │
│  providers: [Service]                         │
└──────────────────────────────────────────────┘
```

- **Module** = Registers the controller + service + database entity
- **Controller** = Receives HTTP requests, calls the service
- **Service** = Contains actual logic, queries the database via Repository
- **Repository** = TypeORM's way to interact with a specific database table

---

## 6. Entities (Database Tables)

An **entity** defines the structure of a database table. Each property becomes a **column**.

### `scheme.entity.ts` — The Schemes Table

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('schemes')              // ← Creates a table named "schemes" in PostgreSQL
export class Scheme {

  @PrimaryGeneratedColumn()     // ← Auto-incrementing ID: 1, 2, 3, ...
  id: number;

  @Column()                     // ← Required text column
  name: string;

  @Column({ nullable: true })   // ← Optional column (can be empty/null)
  description: string;

  @Column({ type: 'date', nullable: true })   // ← Date column
  startDate: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  totalBudget: number;
  // precision: 12 = max 12 digits total
  // scale: 2    = 2 digits after decimal point
  // Example: 1234567890.12

  @Column({ default: 'upcoming' })   // ← If not provided, defaults to 'upcoming'
  status: string;

  @Column('simple-array', { nullable: true })  // ← Stores arrays as comma-separated text
  products: string[];

  @CreateDateColumn()     // ← Automatically set when row is created
  createdAt: Date;

  @UpdateDateColumn()     // ← Automatically updated whenever row is modified
  updatedAt: Date;
}
```

### What this creates in PostgreSQL:

```sql
CREATE TABLE schemes (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR NOT NULL,
    description     VARCHAR,
    "startDate"     DATE,
    "totalBudget"   NUMERIC(12,2),
    status          VARCHAR DEFAULT 'upcoming',
    "createdAt"     TIMESTAMP DEFAULT NOW(),
    "updatedAt"     TIMESTAMP DEFAULT NOW()
);
```

### `recipient.entity.ts` — The Recipients Table

```typescript
@Entity('recipients')
export class Recipient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;                     // "Rajesh Agro Traders"

  @Column({ type: 'decimal', ... })
  currentTO: number;                // Current turnover: 62000

  @Column({ type: 'decimal', ... })
  avgDaily: number;                 // Average daily: 2100

  @Column({ nullable: true })
  category: string;                 // "Insecticides", "Fertilizers"

  @Column({ nullable: true })
  type: string;                     // "Dealer", "Retailer"

  @Column({ nullable: true })
  region: string;                   // "North", "South", "East", "West"

  @Column({ nullable: true })
  paymentStatus: string;            // "Completed", "Pending", "Failed"

  @Column('simple-array', { nullable: true })
  products: string[];               // ["XYZ Insecticide 1L", "DAP 50kg"]

  @Column({ default: 'customer' })
  recipientType: string;            // "customer", "distributor", "sales executive"
}
```

---

## 7. DTOs (Data Transfer Objects)

DTOs **validate** incoming request data before it reaches your service.

### `create-scheme.dto.ts`

```typescript
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateSchemeDto {
  @IsString()              // ← MUST be a string, REQUIRED
  schemeName: string;

  @IsOptional()            // ← Can be missing from the request
  @IsString()
  description?: string;    // The "?" means optional in TypeScript

  @IsOptional()
  @IsNumber()
  totalBudget?: number;    // If provided, MUST be a number
}
```

**What happens if someone sends bad data:**

```json
// ❌ This request would be REJECTED:
POST /api/schemes
{ "totalBudget": "not-a-number" }  // totalBudget must be a number!

// ✅ This request would be ACCEPTED:
POST /api/schemes
{ "schemeName": "My Scheme", "totalBudget": 50000 }
```

### `update-scheme.dto.ts`

```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateSchemeDto } from './create-scheme.dto';

// PartialType makes ALL fields from CreateSchemeDto optional
// So you can update just one field without sending everything
export class UpdateSchemeDto extends PartialType(CreateSchemeDto) {}
```

This means for **updates**, you can send just `{ "totalBudget": 75000 }` without needing to include `schemeName`.

---

## 8. Services (Business Logic)

Services contain the **actual logic** — querying the database, processing data, applying business rules.

### `schemes.service.ts` — Key Methods Explained

```typescript
@Injectable()                          // ← Makes this injectable (NestJS can manage it)
export class SchemesService {
  constructor(
    @InjectRepository(Scheme)          // ← Inject the Scheme database repository
    private readonly schemeRepo: Repository<Scheme>,
  ) {}
  // "schemeRepo" is now your tool to read/write the "schemes" table
```

#### `findAll()` — List schemes with optional filters

```typescript
  async findAll(query: { region?: string; type?: string; search?: string }) {
    const where: any = {};

    // Build the WHERE clause dynamically based on what filters were provided
    if (query.region && query.region !== 'all') {
      where.region = ILike(`%${query.region}%`);
      // ILike = case-insensitive LIKE
      // %north% matches "North", "north", "NORTH"
    }

    if (query.search) {
      where.name = ILike(`%${query.search}%`);
      // Searching "diwali" would match "Diwali Bonanza 2026"
    }

    return this.schemeRepo.find({
      where,                           // Apply the filters
      order: { createdAt: 'DESC' },    // Newest first
    });
  }
```

**SQL equivalent:**
```sql
SELECT * FROM schemes
WHERE region ILIKE '%north%'
  AND name ILIKE '%diwali%'
ORDER BY "createdAt" DESC;
```

#### `create()` — Create a new scheme

```typescript
  async create(dto: CreateSchemeDto) {
    // Apply business logic before saving
    const status = dto.startDate && new Date(dto.startDate) > new Date()
      ? 'upcoming'    // Future date → upcoming
      : 'active';     // Today or past → active

    // Create a Scheme object (not yet saved to DB)
    const scheme = this.schemeRepo.create({
      name: dto.schemeName,
      status,
      totalBudget: dto.totalBudget,
      // ... more fields
    });

    // Actually save to the database and return the saved row
    return this.schemeRepo.save(scheme);
  }
```

#### `update()` — Update an existing scheme

```typescript
  async update(id: number, dto: UpdateSchemeDto) {
    const scheme = await this.findOne(id);   // Find or throw 404
    Object.assign(scheme, dto);              // Merge new data onto existing
    return this.schemeRepo.save(scheme);      // Save changes
  }
```

#### `remove()` — Delete a scheme

```typescript
  async remove(id: number) {
    const scheme = await this.findOne(id);   // Find or throw 404
    await this.schemeRepo.remove(scheme);     // Delete from DB
  }
```

### `recipients.service.ts` — Query Builder Approach

For more complex queries, TypeORM offers a **Query Builder**:

```typescript
  async findAll(query: { recipientType?: string; region?: string }) {
    // Start building a SELECT query on the 'recipients' table, aliased as 'r'
    const qb = this.recipientRepo.createQueryBuilder('r');

    if (query.recipientType) {
      // Add a WHERE clause:  WHERE LOWER(r.recipientType) = LOWER('customer')
      qb.andWhere('LOWER(r.recipientType) = LOWER(:recipientType)', {
        recipientType: query.recipientType,
      });
    }

    if (query.region) {
      // Chain another WHERE:  AND LOWER(r.region) = LOWER('north')
      qb.andWhere('LOWER(r.region) = LOWER(:region)', {
        region: query.region,
      });
    }

    // Execute: ORDER BY currentTO DESC
    return qb.orderBy('r.currentTO', 'DESC').getMany();
  }
```

**Generated SQL:**
```sql
SELECT * FROM recipients r
WHERE LOWER(r."recipientType") = LOWER('customer')
  AND LOWER(r.region) = LOWER('north')
ORDER BY r."currentTO" DESC;
```

---

## 9. Controllers (API Endpoints)

Controllers map **HTTP requests → service methods**.

### `schemes.controller.ts`

```typescript
@Controller('api/schemes')              // ← Base URL: /api/schemes
export class SchemesController {
  constructor(
    private readonly schemesService: SchemesService,
    // NestJS automatically injects the SchemesService here
  ) {}

  // GET /api/schemes?region=north&search=diwali
  @Get()
  findAll(
    @Query('region') region?: string,   // ← Extracts ?region= from URL
    @Query('type') type?: string,       // ← Extracts ?type= from URL
    @Query('search') search?: string,   // ← Extracts ?search= from URL
  ) {
    return this.schemesService.findAll({ region, type, search });
  }

  // GET /api/schemes/upcoming
  @Get('upcoming')
  getUpcoming() {
    return this.schemesService.getUpcoming();
  }

  // GET /api/schemes/5  (get scheme with id=5)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    // ParseIntPipe converts the string "5" from URL to the number 5
    return this.schemesService.findOne(id);
  }

  // POST /api/schemes  (create new scheme)
  @Post()
  create(@Body() dto: CreateSchemeDto) {
    // @Body() extracts the JSON body from the request
    // CreateSchemeDto automatically validates it
    return this.schemesService.create(dto);
  }

  // PUT /api/schemes/5  (update scheme id=5)
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSchemeDto,
  ) {
    return this.schemesService.update(id, dto);
  }

  // DELETE /api/schemes/5  (delete scheme id=5)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.schemesService.remove(id);
  }
}
```

### Decorator Reference

| Decorator | Purpose | Example |
|-----------|---------|---------|
| `@Controller('api/schemes')` | Base URL path | All endpoints start with `/api/schemes` |
| `@Get()` | Handle GET requests | `GET /api/schemes` |
| `@Get(':id')` | GET with URL parameter | `GET /api/schemes/5` |
| `@Post()` | Handle POST requests | `POST /api/schemes` |
| `@Put(':id')` | Handle PUT requests | `PUT /api/schemes/5` |
| `@Delete(':id')` | Handle DELETE requests | `DELETE /api/schemes/5` |
| `@Query('name')` | Extract query parameter | `?name=value` from URL |
| `@Param('id')` | Extract URL parameter | `:id` from path |
| `@Body()` | Extract request body | JSON payload |
| `ParseIntPipe` | Convert string to number | `"5"` → `5` |

---

## 10. Module Wiring

Each module file **ties everything together**:

```typescript
// schemes.module.ts
@Module({
  imports: [
    TypeOrmModule.forFeature([Scheme]),
    // ↑ Register the Scheme entity so this module can use its Repository
  ],
  controllers: [SchemesController],    // ← HTTP endpoints
  providers: [SchemesService],         // ← Business logic
  exports: [SchemesService],           // ← Allow other modules to use this service
})
export class SchemesModule {}
```

**Why `exports`?** The Analytics and Dashboard modules need access to the Schemes data, so they import the entity directly via `TypeOrmModule.forFeature()`.

---

## 11. All 5 Modules Explained

### Module 1: Schemes (Full CRUD)
- **Purpose**: Create, read, update, delete schemes
- **Entity**: `scheme.entity.ts` → `schemes` table
- **Endpoints**: 6 routes (list, get, create, update, delete, upcoming)
- **Used by**: `SchemesTab.tsx` and `CreateSchemeForm.tsx` in frontend

### Module 2: Recipients (Read + Filter)
- **Purpose**: List and filter recipients (customers/distributors/sales execs)
- **Entity**: `recipient.entity.ts` → `recipients` table
- **Endpoints**: 2 routes (list with filters, filter-options)
- **Used by**: `CustomersTab.tsx` in frontend

### Module 3: Analytics (Computed KPIs)
- **Purpose**: Calculate dashboard KPIs from scheme + recipient data
- **Entity**: None own — reads from `schemes` and `recipients` tables
- **Endpoints**: 2 routes (kpis, chart data)
- **Used by**: `AnalyticsTab.tsx` in frontend

### Module 4: Settings (Single-Row CRUD)
- **Purpose**: Store/retrieve user settings (profile, notifications)
- **Entity**: `setting.entity.ts` → `settings` table
- **Endpoints**: 2 routes (get, update)
- **Used by**: `SettingsTab.tsx` in frontend

### Module 5: Dashboard (Aggregated Data)
- **Purpose**: Provide summary stats for the main dashboard
- **Entity**: None own — reads from `schemes` and `recipients` tables
- **Endpoints**: 2 routes (summary, upcoming-schemes)
- **Used by**: `TotalSales.tsx` and `UpcomingSchemes.tsx` in frontend

---

## 12. Database Seeding

`seed.ts` populates the database with sample data for development:

```typescript
// 1. Create a standalone database connection (not using NestJS)
const AppDataSource = new DataSource({ ...config });

async function seed() {
  await AppDataSource.initialize();               // Connect to DB

  const schemeRepo = AppDataSource.getRepository(Scheme);  // Get table access

  await schemeRepo.query('DELETE FROM schemes');   // Clear old data

  const schemes = schemeRepo.create([              // Create objects
    { name: 'Diwali Bonanza', ... },
    { name: 'Summer Sale', ... },
  ]);

  await schemeRepo.save(schemes);                  // Insert into DB

  await AppDataSource.destroy();                   // Disconnect
}
```

**Run with:** `npm run seed`

**Current seed data:**
- 10 schemes (3 active, 3 expired, 4 upcoming)
- 43 recipients (30 customers, 8 distributors, 5 sales executives)
- 1 settings row with default values

---

## 13. Frontend Connection

The React frontend uses `api.ts` to call the backend:

```
React Component  →  api.ts function  →  fetch()  →  NestJS Controller  →  Service  →  Database
```

### Example: How SchemesTab loads data

```typescript
// 1. frontend/src/api.ts
export async function fetchSchemes(filters?) {
  const res = await fetch('http://localhost:3000/api/schemes?region=north');
  return res.json();
}

// 2. frontend/src/components/SchemesTab.tsx
useEffect(() => {
  const data = await fetchSchemes({ region: 'north' });
  setSchemes(data);     // Store in React state → table renders
}, []);
```

### Which component calls which API:

| Frontend Component | API Endpoint | Module |
|--------------------|-------------|--------|
| `SchemesTab.tsx` | `GET/POST/PUT/DELETE /api/schemes` | Schemes |
| `CustomersTab.tsx` | `GET /api/recipients` | Recipients |
| `UpcomingSchemes.tsx` | `GET /api/dashboard/upcoming-schemes` | Dashboard |
| `TotalSales.tsx` | `GET /api/dashboard/summary` | Dashboard |
| `AnalyticsTab.tsx` | `GET /api/analytics/kpis` | Analytics |
| `SettingsTab.tsx` | `GET/PUT /api/settings` | Settings |

---

## 14. API Reference

### Schemes (`/api/schemes`)

| Method | URL | Description | Example Body |
|--------|-----|-------------|-------------|
| `GET` | `/api/schemes` | List all (filters: region, type, search, status) | — |
| `GET` | `/api/schemes/upcoming` | List upcoming schemes | — |
| `GET` | `/api/schemes/:id` | Get one by ID | — |
| `POST` | `/api/schemes` | Create new | `{ "schemeName": "Test", "totalBudget": 50000 }` |
| `PUT` | `/api/schemes/:id` | Update by ID | `{ "totalBudget": 75000 }` |
| `DELETE` | `/api/schemes/:id` | Delete by ID | — |

### Recipients (`/api/recipients`)

| Method | URL | Description |
|--------|-----|-------------|
| `GET` | `/api/recipients?recipientType=customer&region=north` | Filtered list |
| `GET` | `/api/recipients/filter-options` | Available filter values |

### Analytics (`/api/analytics`)

| Method | URL | Description |
|--------|-----|-------------|
| `GET` | `/api/analytics/kpis` | KPI cards data |
| `GET` | `/api/analytics/chart?period=weekly` | Chart data points |

### Dashboard (`/api/dashboard`)

| Method | URL | Description |
|--------|-----|-------------|
| `GET` | `/api/dashboard/summary` | Total sales, progress, etc. |
| `GET` | `/api/dashboard/upcoming-schemes` | Next 5 upcoming schemes |

### Settings (`/api/settings`)

| Method | URL | Description |
|--------|-----|-------------|
| `GET` | `/api/settings` | Get current settings |
| `PUT` | `/api/settings` | Update settings |

---

## 15. How a Request Flows

**Example:** User creates a new scheme from the frontend.

```
Step 1: User fills CreateSchemeForm and clicks "Save"
         ↓
Step 2: SchemesTab calls → api.ts → createScheme({ schemeName: "Test", ... })
         ↓
Step 3: fetch() sends HTTP request:
         POST http://localhost:3000/api/schemes
         Body: { "schemeName": "Test", "totalBudget": 50000 }
         ↓
Step 4: NestJS routes to SchemesController.create()
         @Post() → @Body() extracts and validates via CreateSchemeDto
         ↓
Step 5: Controller calls SchemesService.create(dto)
         ↓
Step 6: Service applies business logic:
         - Determines status (upcoming/active) from startDate
         - Maps form fields to entity fields
         ↓
Step 7: Service calls schemeRepo.create() → schemeRepo.save()
         ↓
Step 8: TypeORM generates SQL:
         INSERT INTO schemes (name, status, "totalBudget", ...)
         VALUES ('Test', 'active', 50000, ...)
         RETURNING *;
         ↓
Step 9: PostgreSQL inserts the row and returns it
         ↓
Step 10: Response flows back:
          DB → Service → Controller → HTTP Response → fetch() → React state → UI updates
```

---

## Quick Reference Commands

```bash
# Start the server (with hot-reload)
npm run start:dev

# Seed/reset the database
npm run seed

# Build for production
npm run build

# Start production server
npm run start:prod
```

---

> **💡 Tip:** When you change any `.ts` file while `npm run start:dev` is running, the server automatically restarts with your changes!
