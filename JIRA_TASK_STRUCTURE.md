# ProfAI - Jira Board Task Structure

## Board Type: Scrum Board
## Project Key: PROF

---

## Epics

| Epic | Color | Description |
|------|-------|-------------|
| EPIC 1: Project Setup & Infrastructure | Blue | Git, Docker, project skeleton |
| EPIC 2: Backend API Development | Green | Express, Prisma, all endpoints |
| EPIC 3: Frontend Development | Purple | React pages and components |
| EPIC 4: Analysis Engine | Orange | Exam analysis algorithm |
| EPIC 5: Testing & Documentation | Red | Testing, README, UML, delivery |

---

## Sprint 1 (Week 1-2): Setup & Backend Foundation

| Task ID | Task | Assignee | SP | Acceptance Criteria |
|---------|------|----------|----|---------------------|
| PROF-1 | Create Git repo and set up monorepo structure | ERDEM | 2 | Repo created, .gitignore added, client/ and server/ folders exist |
| PROF-2 | Configure Docker Compose (client, server, db) | ALI EMIR | 3 | `docker-compose up` starts all 3 services |
| PROF-3 | Set up backend project structure (Express + TS) | ENES | 3 | Express server running on port 5000, TypeScript compiling |
| PROF-4 | Design Prisma schema and write migrations | ALI EMIR | 5 | 6 models defined, migration successful, DB tables created |
| PROF-5 | Auth API - Register endpoint | ERDEM | 3 | POST /api/auth/register works, password hashed, validation present |
| PROF-6 | Auth API - Login endpoint (JWT) | ERDEM | 3 | POST /api/auth/login returns JWT token, wrong password returns error |
| PROF-7 | Jira board setup and task assignments | EVERYONE | 1 | Board created, professor added as watcher |
| PROF-8 | Prepare project plan Excel file | EVERYONE | 2 | Excel has 7 sheets, all information filled |

**Sprint 1 Total: 22 SP**

## Sprint 2 (Week 3-4): Backend API & Analysis

| Task ID | Task | Assignee | SP | Acceptance Criteria |
|---------|------|----------|----|---------------------|
| PROF-9 | Professor CRUD API endpoints | ERDEM | 5 | GET/POST /api/professors works, search and filtering available |
| PROF-10 | Course CRUD API endpoints | ALI EMIR | 3 | GET/POST /api/courses works, professor relationship correct |
| PROF-11 | Exam upload API (Multer integration) | ENES | 5 | File uploads, size/type validation present, fileUrl saved to DB |
| PROF-12 | Exam listing API endpoints | ENES | 3 | GET /api/exams/course/:id lists exams for the course |
| PROF-13 | Rating API endpoints | ALI EMIR | 3 | POST/GET rating works, 1-5 range validation present |
| PROF-14 | Develop exam analysis algorithm | ENES | 8 | Question type, topic distribution, difficulty score calculated |
| PROF-15 | Professor analysis summary endpoint | ERDEM | 5 | GET /api/professors/:id/analysis returns summary card data |
| PROF-16 | React project setup (TypeScript + Tailwind) | ERDEM | 3 | React app running on port 3000, Tailwind configured, routing set up |

**Sprint 2 Total: 35 SP**

## Sprint 3 (Week 5-6): Frontend Pages

| Task ID | Task | Assignee | SP | Acceptance Criteria |
|---------|------|----------|----|---------------------|
| PROF-17 | Home page design (search + popular professors) | ERDEM | 5 | Search works, professor cards displayed, responsive |
| PROF-18 | Registration page (/register) | ERDEM | 3 | Form validation present, successful registration redirects to login |
| PROF-19 | Login page (/login) | ERDEM | 3 | JWT token saved to localStorage, successful login redirects to home |
| PROF-20 | Professor list page - filters | ENES | 5 | Department/university filter works, pagination present |
| PROF-21 | Professor detail page (/professors/:id) | ALI EMIR | 8 | Profile info, courses, analysis card, rating displayed |
| PROF-22 | Analysis card component (pie chart, bar chart) | ALI EMIR | 5 | Pie chart shows question types, bar chart shows topic distribution |
| PROF-23 | Exam upload page (/upload) | ENES | 5 | Course selection, exam type selection, file upload works |
| PROF-24 | Dashboard page (/dashboard) | ERDEM | 5 | User's uploads and contribution statistics displayed |

**Sprint 3 Total: 39 SP**

## Sprint 4 (Week 7-8): Integration & Delivery

| Task ID | Task | Assignee | SP | Acceptance Criteria |
|---------|------|----------|----|---------------------|
| PROF-25 | Frontend-Backend API integration | EVERYONE | 8 | All pages fetch data from API, CRUD operations work |
| PROF-26 | Responsive design check and fixes | ENES | 3 | Looks correct on mobile and tablet (320px - 1920px) |
| PROF-27 | Bug fixes and edge case testing | EVERYONE | 5 | Known bugs fixed, empty states handled |
| PROF-28 | Write README.md | ALI EMIR | 3 | Setup steps, team, project description, screenshots present |
| PROF-29 | Finalize UML diagrams | ALI EMIR | 2 | Class diagram and use case diagram up to date and in repo |
| PROF-30 | Final push to GitHub and share link on UBIS | ERDEM | 1 | Repo public, all files uploaded, link shared on UBIS |

**Sprint 4 Total: 22 SP**

---

## Board Columns

1. **BACKLOG** - Tasks not yet planned
2. **TO DO** - Tasks added to sprint, not started
3. **IN PROGRESS** - Tasks currently being worked on
4. **CODE REVIEW** - Tasks awaiting code review
5. **DONE** - Completed tasks

## Labels

- `backend` - Backend related tasks
- `frontend` - Frontend related tasks
- `database` - Database related tasks
- `devops` - Docker/CI-CD related tasks
- `docs` - Documentation tasks
- `bug` - Bug fixes
- `urgent` - Urgent tasks

## Priority Levels

- **Highest** - Blocker, prevents other tasks
- **High** - Must be completed within sprint
- **Medium** - Expected to be completed within sprint
- **Low** - Nice to have, if time permits

---

## Adding Your Professor as Watcher

1. Go to your Jira project
2. Navigate to Project Settings > People
3. Add your professor's email address
4. On each task, add your professor under "Watchers" in the right panel
