# ProfAI - Professor Exam Style Analysis Platform

<div align="center">

**A web application that analyzes professors' exam question styles using past exam papers.**

[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.x-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-24.x-2496ED?logo=docker)](https://www.docker.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.x-2D3748?logo=prisma)](https://www.prisma.io/)

</div>

---

## Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [UML Diagrams](#uml-diagrams)
- [API Endpoints](#api-endpoints)
- [Installation](#installation)
- [Team Members](#team-members)

---

## About

ProfAI is a web application that allows university students to upload past exam papers and analyze the professor's question style. The system extracts question patterns from uploaded exam data and answers the question: **"How does this professor ask questions?"**

Students can:
- Upload past exam files (PDF, JPG, PNG)
- View question type distribution (multiple choice, classic, true/false)
- See topic-based distribution analysis
- Check difficulty scores
- Rate professors on difficulty and fairness

---

## Features

| Feature | Description |
|---------|-------------|
| **Exam Upload** | Upload past exam files with course and exam type selection |
| **Question Style Analysis** | Automatic analysis of question types, topics, and difficulty |
| **Professor Profiles** | Detailed professor pages with analysis cards and ratings |
| **Interactive Charts** | Pie charts for question types, bar charts for topic distribution |
| **Rating System** | Rate professors on difficulty (1-5) and fairness (1-5) |
| **Search & Filter** | Search professors by name, filter by department and university |
| **Dashboard** | Personal dashboard showing uploads and contribution statistics |
| **Responsive Design** | Mobile-friendly design with Tailwind CSS |

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React.js + TypeScript | User interface |
| Styling | Tailwind CSS | Responsive design |
| Backend | Node.js + Express.js | REST API server |
| Database | PostgreSQL | Relational data storage |
| ORM | Prisma | Database management |
| File Upload | Multer | Exam file handling |
| Containerization | Docker + Docker Compose | Development environment |

---

## Project Structure

```
profai/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service functions
│   │   ├── types/          # TypeScript type definitions
│   │   └── App.tsx         # Root component
│   ├── package.json
│   └── tailwind.config.js
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── routes/         # Express routes
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Auth & validation middleware
│   │   └── index.ts        # Server entry point
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── package.json
├── docker-compose.yml      # Docker services configuration
├── .gitignore
└── README.md
```

---

## Database Schema

> See the full interactive ER diagram in the [UML Diagrams](#entity-relationship-diagram) section below.

---

## UML Diagrams

> Full editable diagrams are also available in [`ProfAI_UML_Diagrams.drawio`](./ProfAI_UML_Diagrams.drawio) — open with [app.diagrams.net](https://app.diagrams.net/)

### Class Diagram

```mermaid
classDiagram
    class User {
        +Int id
        +String email
        +String password
        +String name
        +String university
        +String department
        +DateTime createdAt
        +register() void
        +login() Token
        +getProfile() User
    }

    class Professor {
        +Int id
        +String name
        +String department
        +String university
        +DateTime createdAt
        +getCourses() Course[]
        +getAnalysisSummary() AnalysisSummary
        +getAverageRating() Float
    }

    class Course {
        +Int id
        +String name
        +String code
        +Int professorId
        +DateTime createdAt
        +getExams() Exam[]
        +getProfessor() Professor
    }

    class Exam {
        +Int id
        +Int courseId
        +ExamType examType
        +Int year
        +String semester
        +String fileUrl
        +Int uploadedById
        +DateTime createdAt
        +upload(file) void
        +getAnalysis() ExamAnalysis
    }

    class ExamAnalysis {
        +Int id
        +Int examId
        +Int questionCount
        +JSON questionTypes
        +JSON topicDistribution
        +Float difficultyScore
        +String summary
        +DateTime createdAt
        +analyze() void
        +generateSummary() String
    }

    class ProfessorRating {
        +Int id
        +Int professorId
        +Int userId
        +Int difficultyScore
        +Int fairnessScore
        +String comment
        +DateTime createdAt
        +create() void
        +update() void
    }

    class ExamType {
        <<enumeration>>
        MIDTERM
        FINAL
        MAKEUP
    }

    Professor "1" --> "*" Course : has
    Course "1" --> "*" Exam : contains
    Exam "1" --> "1" ExamAnalysis : analyzed by
    Professor "1" --> "*" ProfessorRating : rated by
    User "1" --> "*" ProfessorRating : gives
    User "1" --> "*" Exam : uploads
    Exam --> ExamType : uses
```

### Use Case Diagram

```mermaid
flowchart LR
    subgraph Actors
        V["🧑 Visitor"]
        S["🎓 Student (Registered)"]
    end

    subgraph ProfAI System
        subgraph Authentication
            UC1(Register)
            UC2(Login)
        end

        subgraph Professor Management
            UC3(Search Professor)
            UC4(List Professors)
            UC5(View Professor Details)
            UC6(Add New Professor)
        end

        subgraph Exam Management
            UC7(Upload Exam File)
            UC8(View Exams)
        end

        subgraph Analysis
            UC9(View Question Style Analysis)
            UC10(View Question Type Distribution)
            UC11(View Topic Distribution)
            UC12(View Difficulty Score)
        end

        subgraph Rating
            UC13(Rate Professor)
            UC14(View Professor Ratings)
        end

        UC15(View Dashboard)
    end

    V --- UC1
    V --- UC2
    V --- UC3
    V --- UC4
    V --- UC5

    S --- UC6
    S --- UC7
    S --- UC8
    S --- UC13
    S --- UC14
    S --- UC15

    S -.->|inherits| V

    UC5 -.->|include| UC9
    UC5 -.->|include| UC14
    UC9 -.->|include| UC10
    UC9 -.->|include| UC11
    UC9 -.->|include| UC12
    UC7 -.->|extend| UC9
```

### Entity Relationship Diagram

```mermaid
erDiagram
    USER {
        int id PK
        varchar email UK
        varchar password
        varchar name
        varchar university
        varchar department
        timestamp createdAt
    }

    PROFESSOR {
        int id PK
        varchar name
        varchar department
        varchar university
        timestamp createdAt
    }

    COURSE {
        int id PK
        varchar name
        varchar code
        int professorId FK
        timestamp createdAt
    }

    EXAM {
        int id PK
        int courseId FK
        enum examType
        int year
        varchar semester
        varchar fileUrl
        int uploadedById FK
        timestamp createdAt
    }

    EXAM_ANALYSIS {
        int id PK
        int examId FK
        int questionCount
        json questionTypes
        json topicDistribution
        decimal difficultyScore
        text summary
        timestamp createdAt
    }

    PROFESSOR_RATING {
        int id PK
        int professorId FK
        int userId FK
        int difficultyScore
        int fairnessScore
        text comment
        timestamp createdAt
    }

    PROFESSOR ||--o{ COURSE : "has"
    COURSE ||--o{ EXAM : "contains"
    EXAM ||--o| EXAM_ANALYSIS : "analyzed by"
    PROFESSOR ||--o{ PROFESSOR_RATING : "rated by"
    USER ||--o{ PROFESSOR_RATING : "gives"
    USER ||--o{ EXAM : "uploads"
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT token |

### Professors
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/professors` | List all professors |
| GET | `/api/professors/:id` | Get professor details |
| POST | `/api/professors` | Add a new professor |
| GET | `/api/professors/:id/analysis` | Get professor's question style analysis |

### Courses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/courses` | List all courses |
| POST | `/api/courses` | Add a new course |
| GET | `/api/courses/:id` | Get course details |

### Exams
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/exams/upload` | Upload an exam file |
| GET | `/api/exams/course/:courseId` | List exams for a course |

### Ratings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ratings` | Rate a professor |
| GET | `/api/ratings/professor/:professorId` | Get professor's ratings |

---

## Installation

### Prerequisites

- [Docker](https://www.docker.com/get-started) & Docker Compose
- [Node.js](https://nodejs.org/) v20.x (for local development)

### Using Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/ProfAI-Team/ProfAI.git
cd ProfAI

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend:  http://localhost:5000
# Database: localhost:5432
```

### Local Development

```bash
# Clone the repository
git clone https://github.com/ProfAI-Team/ProfAI.git
cd ProfAI

# Backend setup
cd server
npm install
npx prisma migrate dev
npm run dev

# Frontend setup (in a new terminal)
cd client
npm install
npm run dev
```

---

## Team Members

| Name | Role | Responsibilities |
|------|------|-----------------|
| **Erdem Acar** | Full-Stack Developer | Auth, Professor/Course API, Dashboard page |
| **Enes Albas** | Full-Stack Developer | Exam upload, Analysis engine, Exam upload page |
| **Ali Emir Erten** | Full-Stack Developer | DB design, Docker, Rating system, Professor detail page |

---

## Project Documents

| Document | Description |
|----------|-------------|
| [`ProfAI_Project_Plan.xlsx`](./ProfAI_Project_Plan.xlsx) | Project plan with timeline, budget, risk & SWOT analysis |
| [`ProfAI_UML_Diagrams.drawio`](./ProfAI_UML_Diagrams.drawio) | Class Diagram and Use Case Diagram |
| [`JIRA_TASK_STRUCTURE.md`](./JIRA_TASK_STRUCTURE.md) | Jira board task structure with 30 tasks across 4 sprints |

---

## License

This project is developed as a university assignment for **UYG338 - Software Project Management** course.
