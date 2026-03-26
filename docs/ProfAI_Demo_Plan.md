# ProfAI Demo Plan

<div align="center">

**Professor Exam Style Analysis Platform**

Version 1.0 | March 2026

Prepared by: Erdem Acar, Enes Albas, Ali Emir Erten

UYG338 — Software Project Management

</div>

---

## Table of Contents

1. [Demo Overview](#1-demo-overview)
2. [Pre-Demo Checklist](#2-pre-demo-checklist)
3. [Demo Script](#3-demo-script)
4. [Backup Plan](#4-backup-plan)
5. [Q&A Preparation](#5-qa-preparation)

---

## 1. Demo Overview

| Item | Details |
|------|---------|
| **Purpose** | Demonstrate the ProfAI platform — a web application that analyzes professors' exam question styles using past exam papers. Showcase the full-stack application, CI/CD pipeline, and project management workflow. |
| **Duration** | 15 minutes (including Q&A) |
| **Audience** | Professor and class (UYG338 — Software Project Management) |
| **Presenters** | Erdem Acar, Enes Albas, Ali Emir Erten |
| **Format** | Live demo with browser, terminal, and project management tools |

---

## 2. Pre-Demo Checklist

Before starting the demo, verify the following:

- [ ] Docker Desktop is running and all containers are healthy (`docker compose up -d`)
- [ ] Database is seeded with sample data (professors, courses, exams, analyses, ratings)
- [ ] All three services are accessible:
  - [ ] Frontend: http://localhost:3000
  - [ ] Backend API: http://localhost:5000
  - [ ] Database: localhost:5432
- [ ] Browser is open with the application loaded (Chrome recommended)
- [ ] GitHub repository is open in a separate browser tab: https://github.com/ProfAI-Team/ProfAI
- [ ] Jira board is open in a separate browser tab: https://devmeet-app.atlassian.net/jira/software/projects/SCRUM/boards/1
- [ ] Terminal is open with the project directory ready
- [ ] Screen sharing / projector is tested and working
- [ ] Backup screenshots and recorded video are prepared (see Section 4)

---

## 3. Demo Script

### Part 1: Project Overview (3 minutes)

**Presenter: Erdem Acar**

| Step | Action | Talking Points |
|------|--------|---------------|
| 1.1 | Open GitHub repository in browser | "ProfAI is a web application that analyzes professors' exam question styles. Students upload past exam papers, and the system provides analysis on question types, topic distribution, and difficulty." |
| 1.2 | Show README.md on GitHub | "Our README includes the tech stack, project structure, database schema with ER diagrams, API endpoint documentation, and installation instructions." |
| 1.3 | Show the file/folder structure | "We use a monorepo structure: client (React + TypeScript), server (Node.js + Express + Prisma), and Docker Compose for orchestration." |
| 1.4 | Scroll through UML diagrams in README | "We designed class diagrams, use case diagrams, and ER diagrams to plan the architecture before coding." |

### Part 2: CI/CD Pipeline (2 minutes)

**Presenter: Ali Emir Erten**

| Step | Action | Talking Points |
|------|--------|---------------|
| 2.1 | Navigate to GitHub Actions tab | "We set up a CI/CD pipeline using GitHub Actions that runs automatically on every push to main and on pull requests." |
| 2.2 | Show the workflow file (ci.yml) | "The pipeline has three stages: backend lint and build check, frontend lint and build check, and Docker image build verification." |
| 2.3 | Show a successful workflow run | "Each stage runs independently — backend and frontend checks run in parallel, and Docker build runs after both pass." |
| 2.4 | Explain the benefit | "This ensures no broken code reaches the main branch. If any stage fails, the PR cannot be merged." |

### Part 3: Jira Board (2 minutes)

**Presenter: Enes Albas**

| Step | Action | Talking Points |
|------|--------|---------------|
| 3.1 | Open Jira board | "We managed our project using Jira with Scrum methodology across 4 sprints." |
| 3.2 | Show sprint overview | "Sprint 0 was planning, Sprint 1 was backend APIs, Sprint 2 was frontend pages, and Sprint 3 was integration and delivery." |
| 3.3 | Show task assignments | "Each task was assigned to a team member with story points, priority, and acceptance criteria." |
| 3.4 | Show completed vs remaining tasks | "We tracked progress using the Jira board columns: To Do, In Progress, In Review, and Done." |

### Part 4: Live Application Demo (8 minutes)

**Presenter: All team members (rotating)**

| Step | Action | Presenter | Talking Points |
|------|--------|-----------|---------------|
| 4.1 | Show home page | Erdem | "The home page features a search bar and displays popular professors. Users can search by professor name." |
| 4.2 | Search for a professor | Erdem | "Typing a professor's name filters results in real-time. Let's search for one of our sample professors." |
| 4.3 | Register a new user | Erdem | "New users can register with their email, name, university, and department. Passwords are hashed with bcrypt." |
| 4.4 | Login with the new user | Erdem | "After registration, users log in and receive a JWT token stored securely. This token authenticates all subsequent requests." |
| 4.5 | Browse professor list with filters | Enes | "The professor list page supports filtering by department and university. Results are paginated for performance." |
| 4.6 | View professor detail page | Ali Emir | "Each professor has a detail page showing their courses, exam analysis with interactive charts, and student ratings." |
| 4.7 | Show analysis charts | Ali Emir | "The pie chart shows question type distribution (multiple choice, classic, true/false). The bar chart shows topic distribution across exams." |
| 4.8 | Upload an exam file | Enes | "Authenticated users can upload exam files (PDF, JPG, PNG). The system validates file type and size, then processes the analysis." |
| 4.9 | Rate a professor | Ali Emir | "Users can rate professors on difficulty (1-5) and fairness (1-5), and leave an optional comment." |
| 4.10 | View dashboard | Erdem | "The dashboard shows the user's upload history, contribution statistics, and recent activity." |

### Part 5: Technical Architecture (2 minutes)

**Presenter: Ali Emir Erten**

| Step | Action | Talking Points |
|------|--------|---------------|
| 5.1 | Show docker-compose.yml | "We use Docker Compose with three services: React frontend (Nginx), Node.js backend, and PostgreSQL database." |
| 5.2 | Show Prisma schema | "Our database schema is managed with Prisma ORM, which provides type-safe database access and automatic migrations." |
| 5.3 | Show API structure in code | "The backend follows a clean architecture: routes, controllers, services, and middleware layers." |
| 5.4 | Show security measures | "We implement JWT authentication, input validation, file upload security, CORS configuration, and password hashing." |

---

## 4. Backup Plan

In case of technical issues during the live demo, the following backup measures are in place:

| Issue | Backup Action |
|-------|--------------|
| **Docker containers fail to start** | Use locally running services (npm run dev for both client and server) |
| **Database connection fails** | Switch to pre-seeded SQLite database as fallback, or show screenshots of working application |
| **Network/Internet issues** | All services run locally; GitHub and Jira pages are pre-loaded in browser tabs |
| **Frontend build fails** | Show pre-recorded video of the application walkthrough |
| **API errors during demo** | Use Postman collection with pre-configured requests to demonstrate API functionality |
| **Complete system failure** | Present using the pre-recorded demo video (5 minutes) and screenshots |

### Backup Materials Prepared

- **Screenshots**: Full set of screenshots for every page and feature (stored in `/docs/screenshots/`)
- **Recorded Video**: 5-minute screen recording of the full application demo
- **Postman Collection**: Exported API collection with sample requests and responses
- **Slide Deck**: Backup PowerPoint with architecture diagrams and feature screenshots

---

## 5. Q&A Preparation

### Common Questions and Answers

| Question | Answer |
|----------|--------|
| **Why did you choose this tech stack?** | React for its component-based architecture and large ecosystem, Node.js for JavaScript full-stack consistency, PostgreSQL for relational data integrity, and Prisma for type-safe database access. Docker ensures consistent environments across all team members. |
| **How does the analysis engine work?** | The analysis engine processes uploaded exam files by extracting question metadata (type, topic, difficulty). It categorizes questions into types (multiple choice, classic, true/false) and calculates distribution percentages and an overall difficulty score. |
| **How do you handle file security?** | We validate file type (PDF, JPG, PNG only), enforce a 10MB size limit, rename files with UUIDs to prevent path traversal, and store files outside the public directory. Multer middleware handles the upload pipeline. |
| **What happens if a user uploads copyrighted content?** | Our terms of service require users to confirm they have the right to upload content. We have a takedown request process in place for copyright holders. |
| **How is the project managed?** | We use Scrum with 2-week sprints managed on Jira. We have daily stand-ups, sprint planning, and retrospectives. Tasks are tracked with story points and assigned to specific team members. |
| **What would you do differently next time?** | Start with more comprehensive testing from Sprint 1, implement CI/CD earlier in the project, and consider adding real-time notifications for new analyses. |
| **Is this deployed anywhere?** | Currently, the application runs locally via Docker Compose. For production deployment, we would use a cloud provider (AWS/Azure) with a managed PostgreSQL database and container orchestration. |
| **How do you ensure data privacy?** | Passwords are hashed with bcrypt, sensitive data is stored in environment variables, API responses are filtered to exclude private fields, and we follow KVKK (Turkish Data Protection) compliance guidelines. |

---

*Document prepared for UYG338 — Software Project Management, Spring 2026*
