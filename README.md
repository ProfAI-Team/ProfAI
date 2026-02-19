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

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    User      │       │  Professor   │       │    Course     │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id           │       │ id           │──1:N──│ id            │
│ email        │       │ name         │       │ name          │
│ password     │       │ department   │       │ code          │
│ name         │       │ university   │       │ professorId   │
│ university   │       │ createdAt    │       │ createdAt     │
│ department   │       └──────────────┘       └──────┬───────┘
│ createdAt    │              │                       │
└──────┬───────┘              │ 1:N                   │ 1:N
       │                      │                       │
       │ 1:N          ┌──────────────────┐    ┌──────────────┐
       │              │ ProfessorRating  │    │    Exam      │
       │              ├──────────────────┤    ├──────────────┤
       └──────────────│ id               │    │ id           │
              1:N     │ professorId      │    │ courseId      │
                      │ userId           │    │ examType     │
                      │ difficultyScore  │    │ year         │
                      │ fairnessScore    │    │ semester     │
                      │ comment          │    │ fileUrl      │
                      │ createdAt        │    │ uploadedById │
                      └──────────────────┘    │ createdAt    │
                                              └──────┬───────┘
                                                     │ 1:1
                                              ┌──────────────────┐
                                              │  ExamAnalysis    │
                                              ├──────────────────┤
                                              │ id               │
                                              │ examId           │
                                              │ questionCount    │
                                              │ questionTypes    │
                                              │ topicDistribution│
                                              │ difficultyScore  │
                                              │ summary          │
                                              │ createdAt        │
                                              └──────────────────┘
```

---

## UML Diagrams

The UML diagrams for this project are available in the [`ProfAI_UML_Diagrams.drawio`](./ProfAI_UML_Diagrams.drawio) file. You can open it at [app.diagrams.net](https://app.diagrams.net/).

### Class Diagram

The class diagram shows the system's models (User, Professor, Course, Exam, ExamAnalysis, ProfessorRating), controllers (Auth, Professor, Course, Exam, Rating), and services (AnalysisService, FileUploadService) along with their attributes, methods, and relationships.

### Use Case Diagram

The use case diagram defines two actors:

- **Visitor** — Can register, login, search/list professors, and view professor details
- **Student (Registered)** — Can additionally upload exams, rate professors, add new professors, and view their dashboard

Key relationships include `<<include>>` (professor detail includes analysis view) and `<<extend>>` (exam upload triggers analysis).

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
