# ProfAI — Software Product Documentation

<div align="center">

**Professor Exam Style Analysis Platform**

Version 1.0 | March 2026

Prepared by: Erdem Acar, Enes Albas, Ali Emir Erten

UYG338 — Software Project Management

</div>

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Description and Vision](#2-product-description-and-vision)
3. [Core Features and Capabilities](#3-core-features-and-capabilities)
4. [Technical Architecture and Infrastructure](#4-technical-architecture-and-infrastructure)
5. [Technology Stack](#5-technology-stack)
6. [Security Architecture](#6-security-architecture)
7. [Role and Authorization Management Model](#7-role-and-authorization-management-model)
8. [Clearance Level System](#8-clearance-level-system)
9. [User Experience and Interface](#9-user-experience-and-interface)
10. [Installation and Deployment](#10-installation-and-deployment)
11. [Integration and Scalability](#11-integration-and-scalability)
12. [Competitive Analysis and Differentiation](#12-competitive-analysis-and-differentiation)
13. [Licensing and Commercial Model](#13-licensing-and-commercial-model)
14. [Technical Requirements](#14-technical-requirements)

---

## 1. Executive Summary

ProfAI is a web-based platform designed for university students to analyze professors' exam question styles by uploading past exam papers. The system processes uploaded exam data and extracts meaningful patterns such as question type distribution (multiple choice, classic, true/false), topic coverage, and difficulty levels. It answers the fundamental question: **"How does this professor ask questions?"**

### Problem Statement

University students often struggle to prepare for exams because they lack insight into their professors' question patterns and preferences. While past exam papers may circulate informally, there is no structured platform to analyze and present this data meaningfully.

### Proposed Solution

ProfAI provides a centralized, data-driven platform where students can:
- Upload past exam files and contribute to a growing knowledge base
- View statistical analysis of professors' exam styles through interactive charts
- Rate professors on difficulty and fairness
- Make informed study decisions based on data rather than rumors

### Key Metrics

| Metric | Target |
|--------|--------|
| Target Users | University students across all departments |
| Supported File Types | PDF, JPG, PNG |
| Analysis Dimensions | Question types, topic distribution, difficulty score |
| Rating Scale | 1-5 (difficulty and fairness) |
| Development Timeline | 8 weeks |
| Team Size | 3 Full-Stack Developers |

---

## 2. Product Description and Vision

### 2.1 Product Overview

ProfAI is a full-stack web application built with modern technologies (React.js, Node.js, PostgreSQL) that serves as an exam intelligence platform for university students. The platform transforms raw exam data into actionable insights through statistical analysis and data visualization.

### 2.2 Vision Statement

> *"To become the go-to platform for university students seeking data-driven insights into professors' exam styles, enabling smarter and more effective study preparation."*

### 2.3 Mission Statement

To provide a transparent, community-driven platform where students can share exam data and access analytical insights about professors' examination patterns, ultimately improving academic preparation and performance.

### 2.4 Target Audience

| Audience | Description | Primary Need |
|----------|-------------|-------------|
| **University Students** | Undergraduate and graduate students | Understanding exam patterns for better preparation |
| **Student Communities** | Study groups and student organizations | Sharing exam resources collectively |
| **Academic Advisors** | Faculty advisors and mentors | Understanding teaching assessment patterns |

### 2.5 Problem-Solution Mapping

| Problem | Solution |
|---------|----------|
| No structured access to past exam data | Centralized exam upload and storage system |
| Inability to identify question patterns | Automated statistical analysis engine |
| Subjective opinions about professors | Data-driven professor rating system |
| Scattered exam resources | Organized professor-course-exam hierarchy |
| No visual representation of exam trends | Interactive charts (pie, bar) for analysis |

### 2.6 Product Roadmap

| Phase | Timeline | Description |
|-------|----------|-------------|
| **MVP (Current)** | Weeks 1-8 | Core features: upload, analysis, ratings, basic UI |
| **Phase 2 (Future)** | Months 3-6 | AI/NLP integration for automated question extraction |
| **Phase 3 (Future)** | Months 6-12 | Mobile app, OCR support, multi-university expansion |

---

## 3. Core Features and Capabilities

### 3.1 Feature Overview

```mermaid
mindmap
  root((ProfAI))
    Authentication
      User Registration
      JWT Login
      Session Management
    Professor Management
      Professor Profiles
      Search & Filter
      Department Browsing
    Exam Management
      File Upload
      Exam Categorization
      File Storage
    Analysis Engine
      Question Type Analysis
      Topic Distribution
      Difficulty Scoring
      Summary Generation
    Rating System
      Difficulty Rating
      Fairness Rating
      Comment System
    Dashboard
      Upload History
      Contribution Stats
```

### 3.2 Detailed Feature Descriptions

#### 3.2.1 User Authentication
- **Registration**: Email-based registration with university and department information
- **Login**: JWT (JSON Web Token) based authentication
- **Session Management**: Token-based session with automatic expiration

#### 3.2.2 Professor Management
- **Professor Profiles**: Detailed pages showing professor information, courses, and analysis
- **Search**: Real-time search by professor name
- **Filtering**: Filter by department and university
- **Add Professor**: Registered users can add new professors to the system

#### 3.2.3 Exam Upload System
- **File Upload**: Support for PDF, JPG, and PNG formats via Multer
- **Categorization**: Exams tagged by course, exam type (Midterm/Final/Makeup), year, and semester
- **Validation**: File type and size validation before upload
- **Storage**: Uploaded files stored in dedicated server directory

#### 3.2.4 Question Style Analysis Engine
The core intelligence of ProfAI. When an exam is uploaded, the system generates:

| Analysis Type | Description | Visualization |
|---------------|-------------|---------------|
| **Question Type Distribution** | Percentage of multiple choice, classic, and true/false questions | Pie Chart |
| **Topic Distribution** | Which topics are covered most frequently | Bar Chart |
| **Difficulty Score** | Overall exam difficulty rating (1-10) | Badge/Score |
| **Question Count** | Average number of questions per exam | Number |
| **Summary** | Auto-generated text summary of professor's style | Text |

#### 3.2.5 Professor Rating System
- **Difficulty Score**: Rate professor's exam difficulty (1-5 scale)
- **Fairness Score**: Rate professor's grading fairness (1-5 scale)
- **Comments**: Text-based feedback about the professor
- **Aggregation**: Average scores displayed on professor profile

#### 3.2.6 User Dashboard
- **Upload History**: List of all exams uploaded by the user
- **Contribution Statistics**: Total uploads, ratings given, and activity metrics
- **Recent Activity**: Timeline of recent actions

### 3.3 Feature Priority Matrix

| Feature | Priority | Complexity | Status |
|---------|----------|------------|--------|
| User Authentication | High | Medium | Planned |
| Professor CRUD | High | Low | Planned |
| Exam Upload | High | Medium | Planned |
| Analysis Engine | High | High | Planned |
| Rating System | Medium | Low | Planned |
| Search & Filter | Medium | Medium | Planned |
| Dashboard | Medium | Medium | Planned |
| Responsive Design | Medium | Low | Planned |

---

## 4. Technical Architecture and Infrastructure

### 4.1 System Architecture Overview

```mermaid
flowchart TB
    subgraph Client["Client (Port 3000)"]
        React["React.js + TypeScript"]
        Tailwind["Tailwind CSS"]
        Router["React Router"]
        Axios["Axios HTTP Client"]
    end

    subgraph Server["Server (Port 5000)"]
        Express["Express.js"]
        MW["Middleware Layer"]
        Controllers["Controllers"]
        Services["Services"]
        Prisma["Prisma ORM"]
    end

    subgraph Database["Database (Port 5432)"]
        PG["PostgreSQL"]
    end

    subgraph Storage["File Storage"]
        Uploads["uploads/ directory"]
    end

    React --> Axios
    Axios -->|REST API| Express
    Express --> MW
    MW -->|Auth Check| Controllers
    Controllers --> Services
    Services --> Prisma
    Prisma -->|SQL Queries| PG
    Controllers -->|File Save| Uploads

    style Client fill:#61DAFB22,stroke:#61DAFB
    style Server fill:#33993322,stroke:#339933
    style Database fill:#4169E122,stroke:#4169E1
    style Storage fill:#E67E2222,stroke:#E67E22
```

### 4.2 Application Layers

```mermaid
flowchart LR
    subgraph Presentation["Presentation Layer"]
        Pages["Pages"]
        Components["Components"]
        Charts["Chart Components"]
    end

    subgraph API["API Layer"]
        Routes["Express Routes"]
        Middleware["Auth Middleware"]
        Validation["Input Validation"]
    end

    subgraph Business["Business Logic Layer"]
        AuthService["Auth Service"]
        AnalysisService["Analysis Service"]
        FileService["File Upload Service"]
    end

    subgraph Data["Data Access Layer"]
        PrismaClient["Prisma Client"]
        Models["Data Models"]
    end

    subgraph Persistence["Persistence Layer"]
        PostgreSQL["PostgreSQL"]
        FileSystem["File System"]
    end

    Presentation --> API
    API --> Business
    Business --> Data
    Data --> Persistence
```

### 4.3 Docker Infrastructure

```mermaid
flowchart LR
    subgraph Docker["Docker Compose"]
        subgraph C1["Container: client"]
            ReactApp["React App<br/>Port 3000"]
        end
        subgraph C2["Container: server"]
            NodeApp["Node.js API<br/>Port 5000"]
        end
        subgraph C3["Container: db"]
            PGDB["PostgreSQL<br/>Port 5432"]
        end
    end

    C1 -->|API Calls| C2
    C2 -->|SQL| C3

    User["User Browser"] -->|HTTP| C1

    style Docker fill:#2496ED11,stroke:#2496ED
```

### 4.4 API Request Flow

```mermaid
sequenceDiagram
    participant U as User Browser
    participant F as React Frontend
    participant A as Express API
    participant M as Auth Middleware
    participant C as Controller
    participant S as Service
    participant D as PostgreSQL

    U->>F: User Action (click, submit)
    F->>A: HTTP Request (with JWT)
    A->>M: Validate Token
    alt Token Valid
        M->>C: Route to Controller
        C->>S: Business Logic
        S->>D: Database Query
        D-->>S: Query Result
        S-->>C: Processed Data
        C-->>F: JSON Response (200)
        F-->>U: Update UI
    else Token Invalid
        M-->>F: 401 Unauthorized
        F-->>U: Redirect to Login
    end
```

### 4.5 Project Directory Structure

```
profai/
├── client/                         # React Frontend Application
│   ├── public/                     # Static assets
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   │   ├── Navbar.tsx          # Navigation bar
│   │   │   ├── ProfessorCard.tsx   # Professor card component
│   │   │   ├── AnalysisCard.tsx    # Analysis visualization card
│   │   │   ├── RatingForm.tsx      # Rating submission form
│   │   │   ├── SearchBar.tsx       # Search input component
│   │   │   └── FileUpload.tsx      # File upload component
│   │   ├── pages/                  # Page components
│   │   │   ├── HomePage.tsx        # Landing page
│   │   │   ├── LoginPage.tsx       # Login page
│   │   │   ├── RegisterPage.tsx    # Registration page
│   │   │   ├── ProfessorList.tsx   # Professor listing page
│   │   │   ├── ProfessorDetail.tsx # Professor detail page
│   │   │   ├── UploadPage.tsx      # Exam upload page
│   │   │   └── Dashboard.tsx       # User dashboard
│   │   ├── services/               # API service functions
│   │   │   ├── authService.ts      # Authentication API calls
│   │   │   ├── professorService.ts # Professor API calls
│   │   │   ├── examService.ts      # Exam API calls
│   │   │   └── ratingService.ts    # Rating API calls
│   │   ├── types/                  # TypeScript type definitions
│   │   │   └── index.ts            # Shared types and interfaces
│   │   ├── App.tsx                 # Root component with routing
│   │   └── main.tsx                # Application entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── tailwind.config.js
├── server/                         # Node.js Backend Application
│   ├── src/
│   │   ├── controllers/            # Route controllers
│   │   │   ├── authController.ts   # Auth endpoints logic
│   │   │   ├── professorController.ts
│   │   │   ├── courseController.ts
│   │   │   ├── examController.ts
│   │   │   └── ratingController.ts
│   │   ├── routes/                 # Express route definitions
│   │   │   ├── authRoutes.ts
│   │   │   ├── professorRoutes.ts
│   │   │   ├── courseRoutes.ts
│   │   │   ├── examRoutes.ts
│   │   │   └── ratingRoutes.ts
│   │   ├── services/               # Business logic services
│   │   │   ├── analysisService.ts  # Exam analysis algorithm
│   │   │   └── fileUploadService.ts
│   │   ├── middleware/             # Express middleware
│   │   │   ├── authMiddleware.ts   # JWT verification
│   │   │   └── uploadMiddleware.ts # Multer configuration
│   │   └── index.ts                # Server entry point
│   ├── prisma/
│   │   └── schema.prisma           # Database schema definition
│   ├── uploads/                    # Uploaded exam files
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml              # Docker services configuration
├── .gitignore
├── .env.example                    # Environment variables template
└── README.md
```

---

## 5. Technology Stack

### 5.1 Complete Technology Overview

```mermaid
flowchart TB
    subgraph Frontend
        React["React.js 18.x"]
        TS1["TypeScript 5.x"]
        TW["Tailwind CSS 3.x"]
        RR["React Router 6.x"]
        AX["Axios"]
        RCH["Recharts"]
    end

    subgraph Backend
        Node["Node.js 20.x"]
        Exp["Express.js 4.x"]
        TS2["TypeScript 5.x"]
        JWT["jsonwebtoken"]
        Multer["Multer"]
        Bcrypt["bcrypt"]
    end

    subgraph Database
        PG["PostgreSQL 15.x"]
        Prisma["Prisma 5.x"]
    end

    subgraph DevOps
        Docker["Docker 24.x"]
        DC["Docker Compose"]
        Git["Git + GitHub"]
    end

    Frontend --> Backend
    Backend --> Database
    DevOps -.->|containerizes| Frontend
    DevOps -.->|containerizes| Backend
    DevOps -.->|containerizes| Database
```

### 5.2 Technology Selection Justification

| Technology | Category | Why Selected |
|-----------|----------|-------------|
| **React.js** | Frontend Framework | Component-based architecture, large ecosystem, excellent for SPAs |
| **TypeScript** | Language | Type safety reduces bugs, better IDE support, improved maintainability |
| **Tailwind CSS** | CSS Framework | Utility-first approach enables rapid UI development, responsive by default |
| **Node.js** | Backend Runtime | JavaScript everywhere (frontend + backend), non-blocking I/O, npm ecosystem |
| **Express.js** | Backend Framework | Minimal, flexible, widely adopted, excellent middleware support |
| **PostgreSQL** | Database | Robust relational database, JSON support, excellent for complex queries |
| **Prisma** | ORM | Type-safe database access, auto-generated migrations, intuitive schema language |
| **Multer** | File Upload | De facto standard for handling multipart/form-data in Node.js |
| **Docker** | Containerization | Consistent development environment, easy deployment, isolation |
| **JWT** | Authentication | Stateless authentication, scalable, industry standard |
| **Recharts** | Charting | React-native charting library, responsive, composable |
| **bcrypt** | Security | Industry-standard password hashing algorithm |

### 5.3 Version Matrix

| Component | Version | License |
|-----------|---------|---------|
| React.js | 18.x | MIT |
| TypeScript | 5.x | Apache 2.0 |
| Tailwind CSS | 3.x | MIT |
| Node.js | 20.x LTS | MIT |
| Express.js | 4.x | MIT |
| PostgreSQL | 15.x | PostgreSQL License |
| Prisma | 5.x | Apache 2.0 |
| Docker | 24.x | Apache 2.0 |
| Multer | 1.x | MIT |

---

## 6. Security Architecture

### 6.1 Security Overview

```mermaid
flowchart TB
    User["User"] --> HTTPS["HTTPS / TLS"]
    HTTPS --> CORS["CORS Policy"]
    CORS --> RL["Rate Limiting"]
    RL --> IV["Input Validation"]
    IV --> AUTH["JWT Authentication"]
    AUTH --> AUTHZ["Authorization Check"]
    AUTHZ --> BL["Business Logic"]
    BL --> PARAM["Parameterized Queries (Prisma)"]
    PARAM --> DB["PostgreSQL"]

    style HTTPS fill:#27AE6022,stroke:#27AE60
    style AUTH fill:#2980B922,stroke:#2980B9
    style PARAM fill:#8E44AD22,stroke:#8E44AD
```

### 6.2 Authentication Security

| Mechanism | Implementation | Purpose |
|-----------|---------------|---------|
| **Password Hashing** | bcrypt with salt rounds (10+) | Passwords never stored in plain text |
| **JWT Tokens** | Signed with secret key, expiration set | Stateless session management |
| **Token Expiration** | Access token: 24 hours | Limits window of compromised tokens |
| **Token Storage** | localStorage (client-side) | Client-side session persistence |

### 6.3 API Security

| Layer | Mechanism | Description |
|-------|-----------|-------------|
| **CORS** | Whitelisted origins | Only allowed domains can make API requests |
| **Rate Limiting** | express-rate-limit | Prevents brute force and DDoS attacks |
| **Input Validation** | Express validator / custom | All user inputs validated before processing |
| **SQL Injection Prevention** | Prisma parameterized queries | ORM prevents raw SQL injection |
| **XSS Prevention** | React auto-escaping + sanitization | User-generated content sanitized |
| **CSRF Protection** | JWT-based (no cookies) | Token-based auth inherently prevents CSRF |

### 6.4 File Upload Security

| Risk | Mitigation |
|------|-----------|
| Malicious file upload | File type validation (only PDF, JPG, PNG allowed) |
| Oversized files | File size limit enforced (e.g., 10MB max) |
| Path traversal | Files stored with UUID names, original names discarded |
| Direct file access | Upload directory not publicly accessible |
| Storage exhaustion | Per-user upload limits |

### 6.5 Data Security

| Data Type | Protection Method |
|-----------|------------------|
| User passwords | bcrypt hashing (one-way) |
| JWT secret | Environment variable (not in code) |
| Database credentials | Environment variable (not in code) |
| User email addresses | Unique constraint, not publicly listed |
| Uploaded files | Stored outside public directory |

### 6.6 Environment Variable Management

```
# .env.example
DATABASE_URL=postgresql://user:password@localhost:5432/profai
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=24h
UPLOAD_MAX_SIZE=10485760
CORS_ORIGIN=http://localhost:3000
PORT=5000
```

---

## 7. Role and Authorization Management Model

### 7.1 Role Hierarchy

```mermaid
flowchart TD
    Admin["🔑 Admin"]
    Student["🎓 Registered Student"]
    Visitor["🧑 Visitor (Guest)"]

    Admin -->|inherits all| Student
    Student -->|inherits all| Visitor

    style Admin fill:#E74C3C22,stroke:#E74C3C
    style Student fill:#2980B922,stroke:#2980B9
    style Visitor fill:#27AE6022,stroke:#27AE60
```

### 7.2 Role Definitions

| Role | Description | Authentication Required |
|------|-------------|----------------------|
| **Visitor** | Unauthenticated user browsing the platform | No |
| **Registered Student** | Authenticated user with a verified account | Yes (JWT) |
| **Admin** | System administrator with full access (future) | Yes (JWT + Admin flag) |

### 7.3 Permission Matrix

| Action | Visitor | Student | Admin |
|--------|---------|---------|-------|
| View home page | Yes | Yes | Yes |
| Search professors | Yes | Yes | Yes |
| View professor list | Yes | Yes | Yes |
| View professor details | Yes | Yes | Yes |
| View analysis cards | Yes | Yes | Yes |
| Register an account | Yes | — | — |
| Login | Yes | — | — |
| Add new professor | No | Yes | Yes |
| Add new course | No | Yes | Yes |
| Upload exam file | No | Yes | Yes |
| Rate a professor | No | Yes | Yes |
| View dashboard | No | Yes | Yes |
| Delete own uploads | No | Yes | Yes |
| Delete any upload | No | No | Yes |
| Manage users | No | No | Yes |
| Moderate content | No | No | Yes |
| System configuration | No | No | Yes |

### 7.4 Authorization Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant MW as Auth Middleware
    participant C as Controller

    U->>F: Clicks "Upload Exam"
    F->>F: Check localStorage for JWT
    alt No Token
        F-->>U: Redirect to /login
    else Has Token
        F->>MW: API Request + Authorization Header
        MW->>MW: Verify JWT Signature
        MW->>MW: Check Token Expiration
        alt Valid Token
            MW->>C: Attach user to request
            C->>C: Check role permissions
            alt Authorized
                C-->>F: 200 OK + Data
            else Not Authorized
                C-->>F: 403 Forbidden
            end
        else Invalid Token
            MW-->>F: 401 Unauthorized
            F-->>U: Redirect to /login
        end
    end
```

---

## 8. Clearance Level System

### 8.1 Data Access Levels

The clearance system defines which data each role can access and at what level of detail.

```mermaid
flowchart LR
    subgraph Level0["Level 0: Public"]
        ProfList["Professor List"]
        ProfDetail["Professor Details"]
        Analysis["Analysis Cards"]
        CourseList["Course List"]
    end

    subgraph Level1["Level 1: Authenticated"]
        Upload["Upload Exams"]
        Rate["Rate Professors"]
        Dash["Dashboard"]
        AddProf["Add Professors"]
        AddCourse["Add Courses"]
    end

    subgraph Level2["Level 2: Owner"]
        OwnUploads["Manage Own Uploads"]
        OwnRatings["Edit Own Ratings"]
        OwnProfile["Edit Own Profile"]
    end

    subgraph Level3["Level 3: Admin"]
        AllUsers["Manage All Users"]
        AllContent["Moderate All Content"]
        SysConfig["System Configuration"]
        Analytics["Platform Analytics"]
    end

    style Level0 fill:#27AE6022,stroke:#27AE60
    style Level1 fill:#2980B922,stroke:#2980B9
    style Level2 fill:#E67E2222,stroke:#E67E22
    style Level3 fill:#E74C3C22,stroke:#E74C3C
```

### 8.2 Clearance Level Definitions

| Level | Name | Access Scope | Example Actions |
|-------|------|-------------|----------------|
| **Level 0** | Public | Read-only access to public data | Browse professors, view analysis, search |
| **Level 1** | Authenticated | Create and contribute data | Upload exams, rate professors, add entries |
| **Level 2** | Owner | Manage own contributed data | Edit/delete own uploads, edit own ratings |
| **Level 3** | Admin | Full system access | Delete any content, manage users, configure system |

### 8.3 Data Visibility Rules

| Data Entity | Level 0 (Public) | Level 1 (Auth) | Level 2 (Owner) | Level 3 (Admin) |
|-------------|-------------------|-----------------|------------------|------------------|
| Professor profiles | Read | Read | Read | Read/Write/Delete |
| Course information | Read | Read/Create | Read/Create | Full access |
| Exam files | Read metadata | Read + Upload | Read + Manage own | Full access |
| Analysis results | Read | Read | Read | Full access |
| Ratings | Read aggregated | Read + Create | Read + Edit own | Full access |
| User profiles | Not visible | Own profile only | Own profile | All profiles |
| Upload history | Not visible | Own history | Own history | All history |
| System logs | Not visible | Not visible | Not visible | Full access |

### 8.4 API Endpoint Clearance Mapping

| Endpoint | Method | Required Level |
|----------|--------|---------------|
| `/api/auth/register` | POST | Level 0 (Public) |
| `/api/auth/login` | POST | Level 0 (Public) |
| `/api/professors` | GET | Level 0 (Public) |
| `/api/professors/:id` | GET | Level 0 (Public) |
| `/api/professors/:id/analysis` | GET | Level 0 (Public) |
| `/api/courses` | GET | Level 0 (Public) |
| `/api/professors` | POST | Level 1 (Authenticated) |
| `/api/courses` | POST | Level 1 (Authenticated) |
| `/api/exams/upload` | POST | Level 1 (Authenticated) |
| `/api/ratings` | POST | Level 1 (Authenticated) |
| `/api/ratings/professor/:id` | GET | Level 0 (Public) |
| `/api/exams/course/:id` | GET | Level 0 (Public) |

---

## 9. User Experience and Interface

### 9.1 Page Map

```mermaid
flowchart TD
    Home["🏠 Home Page<br/>(/)"]
    Login["🔐 Login<br/>(/login)"]
    Register["📝 Register<br/>(/register)"]
    ProfList["👨‍🏫 Professor List<br/>(/professors)"]
    ProfDetail["📊 Professor Detail<br/>(/professors/:id)"]
    Upload["📤 Exam Upload<br/>(/upload)"]
    Dashboard["📋 Dashboard<br/>(/dashboard)"]

    Home -->|Search| ProfList
    Home -->|Login Button| Login
    Home -->|Register Button| Register
    Login -->|Success| Home
    Register -->|Success| Login
    ProfList -->|Click Professor| ProfDetail
    ProfDetail -->|Upload Exam| Upload
    Home -->|Dashboard Link| Dashboard

    style Home fill:#1A1A2E22,stroke:#1A1A2E
    style ProfDetail fill:#E67E2222,stroke:#E67E22
```

### 9.2 Page Descriptions

#### Home Page (/)
- Hero section with search bar prominently displayed
- "How does your professor ask questions?" tagline
- Popular professors grid (cards with name, department, average rating)
- Quick stats: total professors, total exams, total analyses

#### Login Page (/login)
- Email and password input fields
- Form validation with error messages
- "Don't have an account? Register" link
- JWT token stored on successful login

#### Register Page (/register)
- Fields: name, email, password, university, department
- Client-side and server-side validation
- Redirect to login on success

#### Professor List Page (/professors)
- Search bar at the top
- Filter sidebar: department, university
- Professor cards in a grid layout
- Each card: name, department, average difficulty, average fairness
- Pagination at the bottom

#### Professor Detail Page (/professors/:id)
- Professor profile header (name, department, university)
- **Analysis Card** section:
  - Pie chart: question type distribution
  - Bar chart: topic distribution
  - Difficulty score badge (1-10)
  - Average question count
  - Text summary
- Courses list
- Rating section with form (difficulty, fairness, comment)
- Existing ratings list

#### Exam Upload Page (/upload)
- Course selection dropdown
- Exam type selection (Midterm / Final / Makeup)
- Year and semester inputs
- Drag-and-drop file upload area
- File type and size validation messages
- Upload progress indicator

#### Dashboard Page (/dashboard)
- Welcome message with user name
- Statistics cards: total uploads, total ratings, contribution score
- Upload history table with exam details
- Recent activity timeline

### 9.3 Responsive Design Breakpoints

| Breakpoint | Width | Layout |
|-----------|-------|--------|
| Mobile | < 640px | Single column, hamburger menu |
| Tablet | 640px - 1024px | Two column grid, collapsible sidebar |
| Desktop | > 1024px | Full layout, sidebar visible |

### 9.4 UI Component Library

| Component | Description | Used On |
|-----------|-------------|---------|
| Navbar | Top navigation with links and auth buttons | All pages |
| ProfessorCard | Card showing professor summary info | Home, Professor List |
| AnalysisCard | Chart visualizations of exam analysis | Professor Detail |
| RatingForm | Star rating + comment form | Professor Detail |
| SearchBar | Real-time search input | Home, Professor List |
| FileUpload | Drag-and-drop file upload area | Upload Page |
| FilterSidebar | Department/university filter controls | Professor List |
| StatsCard | Numeric statistic with icon | Dashboard |
| Pagination | Page navigation controls | Professor List |

---

## 10. Installation and Deployment

### 10.1 Prerequisites

| Requirement | Version | Purpose |
|------------|---------|---------|
| Docker | 24.x+ | Container runtime |
| Docker Compose | 2.x+ | Multi-container orchestration |
| Node.js | 20.x LTS | Local development (optional) |
| npm | 10.x+ | Package management (optional) |
| Git | 2.x+ | Version control |

### 10.2 Quick Start with Docker (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/ProfAI-Team/ProfAI.git
cd ProfAI

# 2. Create environment file
cp .env.example .env

# 3. Start all services
docker-compose up -d

# 4. Run database migrations
docker-compose exec server npx prisma migrate deploy

# 5. Access the application
# Frontend: http://localhost:3000
# Backend:  http://localhost:5000
# Database: localhost:5432
```

### 10.3 Docker Compose Configuration

```yaml
version: '3.8'

services:
  client:
    build: ./client
    ports:
      - "3000:3000"
    depends_on:
      - server
    environment:
      - REACT_APP_API_URL=http://localhost:5000/api

  server:
    build: ./server
    ports:
      - "5000:5000"
    depends_on:
      - db
    environment:
      - DATABASE_URL=postgresql://profai:profai123@db:5432/profai
      - JWT_SECRET=${JWT_SECRET}
      - PORT=5000
    volumes:
      - uploads:/app/uploads

  db:
    image: postgres:15
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=profai
      - POSTGRES_PASSWORD=profai123
      - POSTGRES_DB=profai
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
  uploads:
```

### 10.4 Local Development Setup

```bash
# Backend
cd server
npm install
cp .env.example .env          # Configure environment variables
npx prisma migrate dev         # Run migrations
npx prisma db seed            # Seed sample data (optional)
npm run dev                    # Start dev server on port 5000

# Frontend (new terminal)
cd client
npm install
npm run dev                    # Start dev server on port 3000
```

### 10.5 Deployment Checklist

- [ ] Set strong JWT_SECRET in production
- [ ] Configure CORS for production domain
- [ ] Enable HTTPS/TLS
- [ ] Set NODE_ENV=production
- [ ] Configure rate limiting
- [ ] Set up database backups
- [ ] Configure file storage limits
- [ ] Enable logging and monitoring

---

## 11. Integration and Scalability

### 11.1 Current Integration Points

```mermaid
flowchart LR
    ProfAI["ProfAI Platform"]

    GitHub["GitHub<br/>(Code Repository)"]
    Jira["Jira<br/>(Project Management)"]
    Docker["Docker Hub<br/>(Container Registry)"]

    ProfAI --- GitHub
    ProfAI --- Jira
    ProfAI --- Docker
```

### 11.2 Future Integration Opportunities

| Integration | Purpose | Priority |
|-------------|---------|----------|
| **OpenAI / Claude API** | AI-powered question extraction from exam PDFs | High |
| **Tesseract OCR** | Automatic text extraction from scanned exams | High |
| **University SSO** | Single sign-on with university accounts (LDAP/SAML) | Medium |
| **Google Drive API** | Import exam files from cloud storage | Low |
| **Notification Service** | Email/push notifications for new analyses | Low |
| **Analytics Platform** | Usage analytics and reporting (e.g., Google Analytics) | Low |

### 11.3 Scalability Strategy

#### 11.3.1 Horizontal Scaling

```mermaid
flowchart TB
    LB["Load Balancer<br/>(nginx)"]

    subgraph App["Application Servers"]
        S1["Server 1"]
        S2["Server 2"]
        S3["Server N..."]
    end

    subgraph DB["Database"]
        Primary["Primary DB"]
        Replica["Read Replica"]
    end

    subgraph Cache["Cache Layer"]
        Redis["Redis Cache"]
    end

    LB --> S1
    LB --> S2
    LB --> S3
    S1 --> Redis
    S2 --> Redis
    S3 --> Redis
    Redis --> Primary
    Redis --> Replica
```

#### 11.3.2 Scaling Milestones

| Users | Infrastructure | Changes Needed |
|-------|---------------|----------------|
| 1 - 100 | Single Docker Compose | Current setup sufficient |
| 100 - 1,000 | Single server + managed DB | Move PostgreSQL to managed service (e.g., AWS RDS) |
| 1,000 - 10,000 | Load balancer + multiple servers | Add nginx, Redis cache, read replicas |
| 10,000+ | Cloud-native architecture | Kubernetes, CDN, microservices split |

### 11.4 Performance Optimization Strategies

| Strategy | Implementation | Expected Impact |
|----------|---------------|----------------|
| **Database Indexing** | Index on professorId, courseId, email | Faster queries (50-80% improvement) |
| **Pagination** | Limit API responses to 20 items/page | Reduced response payload |
| **Caching** | Redis for frequently accessed professor data | Reduced DB load |
| **Image Optimization** | Compress uploaded images on server | Reduced storage and bandwidth |
| **Lazy Loading** | Load chart components on demand | Faster initial page load |
| **CDN** | Serve static assets via CDN | Reduced latency for global users |

---

## 12. Competitive Analysis and Differentiation

### 12.1 Competitor Comparison

| Feature | **ProfAI** | Rate My Professors | Eksi Sozluk | University Forums |
|---------|-----------|-------------------|-------------|-------------------|
| Exam question analysis | **Yes** | No | No | No |
| Question type distribution | **Yes (Charts)** | No | No | No |
| Topic distribution | **Yes (Charts)** | No | No | No |
| Difficulty scoring | **Yes (1-10 data-driven)** | Yes (1-5 subjective) | No | No |
| Professor rating | **Yes** | Yes | Informal | Informal |
| Exam file upload | **Yes** | No | No | No |
| Data visualization | **Interactive charts** | Basic tags | None | None |
| Open source | **Yes** | No | No | No |
| Privacy focused | **Yes** | Moderate | Low | Low |
| University specific | **Yes** | Global | Turkish only | Per-university |

### 12.2 SWOT Summary

| | Positive | Negative |
|---|----------|----------|
| **Internal** | **Strengths**: Unique exam analysis feature, modern tech stack, data-driven insights, open source | **Weaknesses**: Small team, MVP-level AI, limited data at launch |
| **External** | **Opportunities**: AI integration, multi-university expansion, mobile app | **Threats**: Copyright concerns, competition, professor resistance |

### 12.3 Unique Selling Points (USPs)

1. **Data-Driven Analysis**: Unlike subjective rating platforms, ProfAI provides statistical analysis of actual exam data
2. **Visual Insights**: Interactive charts (pie, bar) make exam patterns immediately understandable
3. **Community-Powered**: Students collectively build the knowledge base through uploads
4. **Open Source**: Transparent, auditable, and extensible by the community
5. **Modern Architecture**: Built with current best practices for performance and maintainability

### 12.4 Market Positioning

```mermaid
quadrantChart
    title Competitive Positioning
    x-axis Low Data Analysis --> High Data Analysis
    y-axis Low User Engagement --> High User Engagement
    quadrant-1 Market Leaders
    quadrant-2 Community Platforms
    quadrant-3 Basic Tools
    quadrant-4 Data Platforms
    ProfAI: [0.8, 0.6]
    Rate My Professors: [0.2, 0.9]
    University Forums: [0.1, 0.5]
    Eksi Sozluk: [0.1, 0.7]
```

---

## 13. Licensing and Commercial Model

### 13.1 Software License

ProfAI is developed as a **university academic project** under the **MIT License**.

```
MIT License

Copyright (c) 2026 ProfAI Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

### 13.2 Third-Party License Compliance

| Dependency | License | Commercial Use | Modification |
|-----------|---------|---------------|-------------|
| React.js | MIT | Allowed | Allowed |
| Node.js | MIT | Allowed | Allowed |
| Express.js | MIT | Allowed | Allowed |
| PostgreSQL | PostgreSQL License | Allowed | Allowed |
| Prisma | Apache 2.0 | Allowed | Allowed |
| Tailwind CSS | MIT | Allowed | Allowed |
| Docker | Apache 2.0 | Allowed | Allowed |

All dependencies use permissive open-source licenses compatible with commercial use.

### 13.3 Potential Commercial Model (Future)

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | Basic search, view analyses, 5 uploads/month |
| **Student Pro** | $2.99/month | Unlimited uploads, advanced filters, export reports |
| **University** | Custom pricing | White-label deployment, SSO integration, analytics dashboard |

### 13.4 Revenue Streams (Future Potential)

| Stream | Description | Priority |
|--------|-------------|----------|
| Freemium subscriptions | Advanced features for paid users | Medium |
| University licensing | Institutional deployments | High |
| API access | Third-party integrations | Low |
| Advertising | Non-intrusive ads for free tier | Low |

### 13.5 Data Compliance

| Regulation | Status | Actions |
|-----------|--------|---------|
| **KVKK** (Turkish Data Protection) | Planned compliance | Privacy policy, data consent, right to deletion |
| **GDPR** | Planned compliance | Data minimization, user consent, data portability |
| **Copyright** | Awareness | Disclaimer for uploaded exam content, takedown process |

---

## 14. Technical Requirements

### 14.1 Minimum System Requirements

#### Server Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **CPU** | 2 cores | 4 cores |
| **RAM** | 4 GB | 8 GB |
| **Storage** | 20 GB SSD | 50 GB SSD |
| **OS** | Ubuntu 22.04 LTS / Windows Server 2022 | Ubuntu 22.04 LTS |
| **Network** | 10 Mbps | 100 Mbps |

#### Client Requirements (Browser)

| Browser | Minimum Version |
|---------|----------------|
| Google Chrome | 90+ |
| Mozilla Firefox | 88+ |
| Microsoft Edge | 90+ |
| Safari | 14+ |
| Opera | 76+ |

#### Mobile Browser Support

| Browser | Minimum Version |
|---------|----------------|
| Chrome Mobile | 90+ |
| Safari iOS | 14+ |
| Samsung Internet | 14+ |

### 14.2 Software Dependencies

| Dependency | Required Version | Purpose |
|-----------|-----------------|---------|
| Docker | 24.x+ | Container runtime |
| Docker Compose | 2.x+ | Container orchestration |
| Node.js | 20.x LTS | JavaScript runtime |
| npm | 10.x+ | Package manager |
| PostgreSQL | 15.x+ | Database server |
| Git | 2.x+ | Version control |

### 14.3 Performance Requirements

| Metric | Target | Measurement |
|--------|--------|-------------|
| Page load time | < 3 seconds | First Contentful Paint |
| API response time | < 500ms | Average response time |
| File upload | < 10 seconds (for 10MB file) | Upload completion time |
| Database query | < 100ms | Average query execution |
| Concurrent users | 100+ | Simultaneous connections |
| Uptime | 99% | Monthly availability |

### 14.4 Database Capacity

| Entity | Expected Volume (Year 1) | Growth Rate |
|--------|--------------------------|-------------|
| Users | 1,000 - 5,000 | 50%/month initially |
| Professors | 200 - 500 | 20%/month |
| Courses | 500 - 2,000 | 30%/month |
| Exams | 1,000 - 10,000 | 40%/month |
| Analyses | 1,000 - 10,000 | Matches exam uploads |
| Ratings | 2,000 - 20,000 | 50%/month |

### 14.5 Network Requirements

| Requirement | Specification |
|-------------|--------------|
| Protocol | HTTPS (TLS 1.2+) |
| API Format | RESTful JSON |
| Max Request Size | 10 MB (file uploads) |
| Max Response Size | 1 MB (paginated) |
| Timeout | 30 seconds |
| Rate Limit | 100 requests/minute per IP |

### 14.6 Accessibility Requirements

| Standard | Target Level | Description |
|----------|-------------|-------------|
| WCAG | 2.1 AA | Web Content Accessibility Guidelines |
| Keyboard Navigation | Full support | All features accessible via keyboard |
| Screen Reader | Compatible | Semantic HTML, ARIA labels |
| Color Contrast | 4.5:1 minimum | Text readability |
| Font Size | Scalable | rem-based sizing, user-adjustable |

---

## Appendix

### A. Document References

| Document | Location |
|----------|----------|
| Project Plan (Excel) | [`ProfAI_Project_Plan.xlsx`](./ProfAI_Project_Plan.xlsx) |
| UML Diagrams (draw.io) | [`ProfAI_UML_Diagrams.drawio`](./ProfAI_UML_Diagrams.drawio) |
| Jira Task Structure | [`JIRA_TASK_STRUCTURE.md`](./JIRA_TASK_STRUCTURE.md) |
| README | [`README.md`](./README.md) |
| GitHub Repository | [github.com/ProfAI-Team/ProfAI](https://github.com/ProfAI-Team/ProfAI) |

### B. Team Information

| Name | Role | Responsibilities |
|------|------|-----------------|
| Erdem Acar | Full-Stack Developer | Auth, Professor/Course API, Dashboard page |
| Enes Albas | Full-Stack Developer | Exam upload, Analysis engine, Exam upload page |
| Ali Emir Erten | Full-Stack Developer | DB design, Docker, Rating system, Professor detail page |

### C. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | March 2026 | ProfAI Team | Initial document creation |
