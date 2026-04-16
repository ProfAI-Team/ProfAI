# ProfAI — Risk Analysis, Security & Implementation Roadmap

<div align="center">

**Professor Exam Style Analysis Platform**

Version 2.0 | March 2026

Prepared by: Erdem Acar, Enes Albas, Ali Emir Erten

UYG338 — Software Project Management

</div>

---

## Table of Contents

1. [Risk Identification](#1-risk-identification)
   - 1.1 [Risk Assessment and Management](#11-risk-assessment-and-management)
   - 1.2 [Mitigation / Preventive Actions](#12-mitigation--preventive-actions)
   - 1.3 [Risk Matrix](#13-risk-matrix)
2. [Code Security and Data Privacy](#2-code-security-and-data-privacy)
3. [Implementation Roadmap](#3-implementation-roadmap)
4. [Risk Update Log](#4-risk-update-log)

---

## 1. Risk Identification

### Overview

Risk identification is the process of determining potential events that could negatively impact the ProfAI project. We categorize risks into five domains: **Technical**, **Operational**, **Security**, **Schedule**, and **External**.

This is **Version 2.0** of the risk analysis, updated to reflect the current project status as of late March 2026. Risks have been re-evaluated, new risks discovered during development have been added, and mitigation statuses have been updated.

### 1.0 Identified Risks

| Risk ID | Risk Description | Category | Source | Status |
|---------|-----------------|----------|--------|--------|
| R01 | Team member becomes unavailable (illness, dropout) | Operational | Internal | Mitigated |
| R02 | Technology learning curve longer than expected | Technical | Internal | Mitigated |
| R03 | Database schema design proves insufficient as features grow | Technical | Internal | Mitigated |
| R04 | Docker environment compatibility issues across different OS | Technical | Internal | Mitigated |
| R05 | File upload security vulnerabilities (malicious files) | Security | External | Active |
| R06 | API performance degradation under load | Technical | Internal | Active |
| R07 | Failure to meet project timeline / deadline | Schedule | Internal | Active |
| R08 | Git merge conflicts and code integration issues | Operational | Internal | Mitigated |
| R09 | SQL injection or XSS attacks on the platform | Security | External | Mitigated |
| R10 | Sensitive user data exposure (passwords, emails) | Security | External | Mitigated |
| R11 | Copyright issues from uploaded exam content | External | External | Active |
| R12 | Insufficient test coverage leading to undetected bugs | Technical | Internal | Active |
| R13 | Third-party dependency vulnerability (npm packages) | Security | External | Active |
| R14 | Data loss due to lack of backup strategy | Operational | Internal | Active |
| R15 | Scope creep — adding features beyond MVP | Schedule | Internal | Mitigated |
| R16 | JWT token theft or session hijacking | Security | External | Mitigated |
| R17 | Cross-browser compatibility issues | Technical | Internal | Mitigated |
| R18 | Poor UX causing low user adoption | Operational | Internal | Active |
| R19 | PostgreSQL database crashes or data corruption | Technical | Internal | Mitigated |
| R20 | CORS misconfiguration exposing API to unauthorized origins | Security | Internal | Mitigated |
| R21 | Docker build fails in CI/CD pipeline | Technical | Internal | **NEW** |
| R22 | Seed data inconsistency | Operational | Internal | **NEW** |
| R23 | Environment variable misconfiguration in deployment | Operational | Internal | **NEW** |

---

### 1.1 Risk Assessment and Management

Each risk is assessed using two dimensions:
- **Probability**: How likely the risk is to occur (1-5 scale)
- **Impact**: How severe the consequences would be (1-5 scale)
- **Risk Score** = Probability x Impact (1-25)

| Risk ID | Risk Description | Probability (1-5) | Impact (1-5) | Risk Score | Risk Level | Status |
|---------|-----------------|-------------------|--------------|------------|------------|--------|
| R01 | Team member unavailability | 2 | 5 | 10 | **HIGH** | Mitigated |
| R02 | Technology learning curve | 3 | 3 | 9 | **MEDIUM** | Mitigated |
| R03 | Insufficient database schema | 2 | 4 | 8 | **MEDIUM** | Mitigated |
| R04 | Docker compatibility issues | 3 | 2 | 6 | **MEDIUM** | Mitigated |
| R05 | File upload vulnerabilities | 3 | 5 | 15 | **CRITICAL** | Active |
| R06 | API performance degradation | 2 | 3 | 6 | **MEDIUM** | Active |
| R07 | Failure to meet timeline | 3 | 5 | 15 | **CRITICAL** | Active |
| R08 | Git merge conflicts | 4 | 2 | 8 | **MEDIUM** | Mitigated |
| R09 | SQL injection / XSS attacks | 2 | 5 | 10 | **HIGH** | Mitigated |
| R10 | Sensitive data exposure | 2 | 5 | 10 | **HIGH** | Mitigated |
| R11 | Copyright issues (exam content) | 3 | 4 | 12 | **HIGH** | Active |
| R12 | Insufficient test coverage | 3 | 3 | 9 | **MEDIUM** | Active |
| R13 | Dependency vulnerabilities | 2 | 4 | 8 | **MEDIUM** | Active |
| R14 | Data loss (no backup) | 2 | 5 | 10 | **HIGH** | Active |
| R15 | Scope creep | 3 | 4 | 12 | **HIGH** | Mitigated |
| R16 | JWT token theft | 2 | 4 | 8 | **MEDIUM** | Mitigated |
| R17 | Cross-browser issues | 2 | 2 | 4 | **LOW** | Mitigated |
| R18 | Poor UX / low adoption | 2 | 3 | 6 | **MEDIUM** | Active |
| R19 | Database crash / corruption | 1 | 5 | 5 | **MEDIUM** | Mitigated |
| R20 | CORS misconfiguration | 2 | 4 | 8 | **MEDIUM** | Mitigated |
| R21 | Docker build fails in CI/CD | 3 | 4 | 12 | **HIGH** | Active |
| R22 | Seed data inconsistency | 2 | 3 | 6 | **MEDIUM** | Active |
| R23 | Env variable misconfiguration | 3 | 5 | 15 | **CRITICAL** | Active |

#### Risk Level Classification

| Risk Score | Level | Color | Action Required |
|-----------|-------|-------|----------------|
| 1 - 4 | **LOW** | Green | Monitor, no immediate action |
| 5 - 9 | **MEDIUM** | Yellow | Plan mitigation, monitor regularly |
| 10 - 14 | **HIGH** | Orange | Implement mitigation immediately |
| 15 - 25 | **CRITICAL** | Red | Top priority, immediate action required |

---

### 1.2 Mitigation / Preventive Actions

#### CRITICAL Risks

| Risk ID | Risk | Mitigation Strategy | Preventive Action | Owner | Status |
|---------|------|---------------------|-------------------|-------|--------|
| R05 | File upload vulnerabilities | Implement strict file validation (type, size, content), store files outside public directory, scan for malicious content | Configure Multer with whitelist (PDF, JPG, PNG only), set 10MB max size, rename files with UUID | ENES | In Progress |
| R07 | Failure to meet timeline | Weekly sprint reviews on Jira, prioritize MVP features, cut non-essential features if behind schedule | Create detailed sprint plan with buffer time, daily stand-ups, track burndown chart | ALL TEAM | Active |
| R23 | Env variable misconfiguration | Provide `.env.example` with all required variables documented, validate env vars on server startup | Create startup validation script that checks all required env vars exist before server boots, document all variables in README | ALI EMIR | Active |

#### HIGH Risks

| Risk ID | Risk | Mitigation Strategy | Preventive Action | Owner | Status |
|---------|------|---------------------|-------------------|-------|--------|
| R01 | Team member unavailability | Cross-training: each member knows at least one other member's codebase area | Document all code, pair programming sessions, shared knowledge base | ALL TEAM | Mitigated — all members active, cross-training completed |
| R09 | SQL injection / XSS attacks | Use Prisma ORM (parameterized queries), React auto-escaping, input sanitization | Security review checklist before each sprint, use helmet.js for HTTP headers | ALI EMIR | Mitigated — Prisma ORM implemented, input validation active |
| R10 | Sensitive data exposure | Hash passwords with bcrypt, store secrets in environment variables, never log sensitive data | Security audit of .env files, add .env to .gitignore, review API responses for data leaks | ERDEM | Mitigated — bcrypt hashing implemented, .env in .gitignore |
| R11 | Copyright issues | Add disclaimer for uploaded content, implement takedown request process | Terms of service requiring users confirm they have right to upload, DMCA-style process | ERDEM | Active — disclaimer planned for final sprint |
| R14 | Data loss | Implement automated database backup strategy | Schedule daily pg_dump, store backups in separate location, test restore process | ALI EMIR | Active — Docker volumes configured, automated backup pending |
| R15 | Scope creep | Strict MVP definition, any new feature requires team consensus and timeline impact assessment | Feature freeze after Week 6, all new ideas go to "Future" backlog in Jira | ALL TEAM | Mitigated — feature freeze enforced, MVP scope maintained |
| R21 | Docker build fails in CI/CD | Multi-stage Docker builds with explicit base images, pin dependency versions, cache Docker layers in CI | Test Docker builds locally before pushing, use `.dockerignore` to exclude unnecessary files, add Docker build step to CI pipeline | ALI EMIR | Active |

#### MEDIUM Risks

| Risk ID | Risk | Mitigation Strategy | Preventive Action | Owner |
|---------|------|---------------------|-------------------|-------|
| R02 | Technology learning curve | Dedicate Week 1 to tutorials and prototyping, use simpler alternatives if stuck | Share learning resources, weekly knowledge-sharing sessions | ALL TEAM |
| R03 | Insufficient DB schema | Use Prisma migrations for easy schema evolution | Design review in Week 2, document all schema decisions | ALI EMIR |
| R04 | Docker compatibility | Document alternative local setup, test on Windows/Mac/Linux | Docker Compose with explicit versions, README with troubleshooting guide | ALI EMIR |
| R06 | API performance issues | Implement pagination, database indexing, query optimization | Load testing with sample data, monitor query execution times | ERDEM |
| R08 | Git merge conflicts | Feature branch strategy, small frequent commits, mandatory code reviews | Branch naming convention (feature/bugfix/hotfix), PR template with checklist | ALL TEAM |
| R12 | Insufficient test coverage | Allocate Sprint 4 for testing, write tests alongside features | Minimum test requirements per PR, track coverage metrics | ENES |
| R13 | Dependency vulnerabilities | Run `npm audit` weekly, update dependencies regularly | Use `npm audit` in CI pipeline, pin dependency versions | ENES |
| R16 | JWT token theft | Short token expiration, implement refresh token rotation | HTTPS only, secure token storage guidelines, logout clears tokens | ERDEM |
| R18 | Poor UX | User feedback collection, iterative UI improvements | Follow Tailwind UI patterns, responsive design testing, peer review UI changes | ERDEM |
| R19 | Database crash | PostgreSQL with Docker volume persistence, regular backups | Monitor database health, configure connection pooling | ALI EMIR |
| R20 | CORS misconfiguration | Whitelist only specific origins in production | Review CORS config before deployment, test with different origins | ERDEM |
| R22 | Seed data inconsistency | Validate seed data against Prisma schema constraints, use transactional seeding | Create idempotent seed script with data validation, test seed on clean database before demo | ENES |

#### LOW Risks

| Risk ID | Risk | Mitigation Strategy | Preventive Action | Owner |
|---------|------|---------------------|-------------------|-------|
| R17 | Cross-browser issues | Test on Chrome, Firefox, Edge, Safari before each release | Use Tailwind CSS (cross-browser compatible), avoid browser-specific APIs | ENES |

---

### 1.3 Risk Matrix

#### Visual Risk Matrix (Probability vs Impact)

```
                        IMPACT
                 1        2        3        4        5
              (Very    (Low)  (Medium)  (High)  (Very
               Low)                              High)
         +--------+--------+--------+--------+--------+
    5    |        |        |        |        |        |
 (Very   |  MED   |  MED   |  HIGH  |  CRIT  |  CRIT  |
  High)  |        |        |        |        |        |
         +--------+--------+--------+--------+--------+
    4    |        |  R08   |        |        |        |
 (High)  |  LOW   |  MED   |  HIGH  |  CRIT  |  CRIT  |
P        |        |        |        |        |        |
R        +--------+--------+--------+--------+--------+
O   3    |        |  R04   | R02    |R11,R15 | R05    |
B (Med)  |  LOW   |  MED   |R12     |  R21   |  R07   |
A        |        |        |  MED   |  HIGH  |R23 CRIT|
B        +--------+--------+--------+--------+--------+
I   2    |        |  R17   |R06,R18 |R03,R13 |R01,R09 |
L (Low)  |  LOW   |  LOW   |  R22   |R16,R20 |R10,R14 |
I        |        |        |  MED   |  MED   |  HIGH  |
T        +--------+--------+--------+--------+--------+
Y   1    |        |        |        |        |  R19   |
 (Very   |  LOW   |  LOW   |  LOW   |  MED   |  MED   |
  Low)   |        |        |        |        |        |
         +--------+--------+--------+--------+--------+
```

#### Risk Distribution Summary

```mermaid
pie title Risk Distribution by Level (v2.0)
    "CRITICAL (3)" : 3
    "HIGH (7)" : 7
    "MEDIUM (12)" : 12
    "LOW (1)" : 1
```

#### Risk by Category

```mermaid
pie title Risks by Category (v2.0)
    "Security (6)" : 6
    "Technical (7)" : 7
    "Operational (5)" : 5
    "Schedule (2)" : 2
    "External (3)" : 3
```

#### Risk Monitoring Schedule

| Risk Level | Review Frequency | Escalation Path |
|-----------|-----------------|-----------------|
| CRITICAL | Daily stand-up | Immediate team discussion, re-plan sprint if needed |
| HIGH | Weekly sprint review | Discuss in sprint planning, assign mitigation tasks |
| MEDIUM | Bi-weekly | Monitor in Jira, address if score increases |
| LOW | Monthly | Review in sprint retrospective |

#### Risk Response Strategy Summary

| Strategy | Description | Applied To |
|----------|-------------|-----------|
| **Avoid** | Eliminate the risk entirely by changing approach | R15 (feature freeze) |
| **Mitigate** | Reduce probability or impact | R05, R07, R09, R10, R14, R21, R23 |
| **Transfer** | Shift risk to third party | R13 (use maintained libraries) |
| **Accept** | Acknowledge and monitor | R17, R04 |

---

## 2. Code Security and Data Privacy

### 2.1 Security Architecture Overview

```mermaid
flowchart TB
    subgraph External["External Threats"]
        XSS["XSS Attacks"]
        SQLI["SQL Injection"]
        CSRF["CSRF Attacks"]
        BF["Brute Force"]
        FU["Malicious File Upload"]
    end

    subgraph Defense["Defense Layers"]
        L1["Layer 1: HTTPS/TLS Encryption"]
        L2["Layer 2: CORS Policy"]
        L3["Layer 3: Rate Limiting"]
        L4["Layer 4: Input Validation"]
        L5["Layer 5: Authentication (JWT)"]
        L6["Layer 6: Authorization (Role-based)"]
        L7["Layer 7: Parameterized Queries (Prisma)"]
        L8["Layer 8: Output Encoding (React)"]
    end

    subgraph Protected["Protected Assets"]
        DB["Database"]
        Files["Uploaded Files"]
        UserData["User Data"]
    end

    External --> L1 --> L2 --> L3 --> L4 --> L5 --> L6 --> L7 --> L8 --> Protected
```

### 2.2 Code Security Measures

#### 2.2.1 Authentication Security

| Measure | Implementation | Purpose |
|---------|---------------|---------|
| Password Hashing | bcrypt with 10+ salt rounds | Prevent plain-text password storage |
| JWT Tokens | Signed with HS256, 24h expiration | Stateless session management |
| Token Validation | Middleware on every protected route | Ensure only authenticated access |
| Login Throttling | Max 5 failed attempts per 15 min | Prevent brute force attacks |

#### 2.2.2 Input Validation

| Input Type | Validation Rules | Library |
|-----------|-----------------|---------|
| Email | RFC 5322 format, max 255 chars | express-validator |
| Password | Min 8 chars, uppercase, lowercase, number | express-validator |
| Professor Name | Max 100 chars, alphanumeric + spaces | express-validator |
| Course Code | Max 20 chars, alphanumeric | express-validator |
| Rating Score | Integer, range 1-5 | express-validator |
| Comment | Max 1000 chars, HTML stripped | express-validator + sanitize-html |
| File Upload | PDF/JPG/PNG only, max 10MB | Multer file filter |

#### 2.2.3 API Security

| Threat | Protection | Implementation |
|--------|-----------|---------------|
| **SQL Injection** | Parameterized queries | Prisma ORM — never writes raw SQL |
| **XSS (Cross-Site Scripting)** | Output encoding + input sanitization | React auto-escaping + sanitize-html |
| **CSRF** | Token-based auth (no cookies) | JWT in Authorization header |
| **CORS Abuse** | Origin whitelist | Express CORS middleware with allowed origins |
| **DDoS / Brute Force** | Rate limiting | express-rate-limit (100 req/min per IP) |
| **HTTP Header Attacks** | Security headers | helmet.js (X-Frame-Options, CSP, etc.) |
| **Man-in-the-Middle** | Encryption in transit | HTTPS/TLS enforcement |

#### 2.2.4 File Upload Security

```mermaid
flowchart TD
    Upload["User Uploads File"] --> TypeCheck{"File Type Check\n(PDF/JPG/PNG?)"}
    TypeCheck -->|Invalid| Reject1["Reject: Invalid file type"]
    TypeCheck -->|Valid| SizeCheck{"File Size Check\n(< 10MB?)"}
    SizeCheck -->|Too Large| Reject2["Reject: File too large"]
    SizeCheck -->|OK| Rename["Rename to UUID\n(remove original name)"]
    Rename --> Store["Store in /uploads/\n(outside public dir)"]
    Store --> SaveDB["Save file URL to database"]
    SaveDB --> Success["Upload successful"]
```

#### 2.2.5 Dependency Security

| Practice | Frequency | Tool |
|----------|-----------|------|
| Audit npm packages | Weekly | `npm audit` |
| Check for known vulnerabilities | Every PR | `npm audit --production` |
| Update dependencies | Bi-weekly | `npm update` |
| Pin dependency versions | Always | `package-lock.json` |
| Review new dependencies | Before adding | Manual review + npmjs.com |

### 2.3 Data Privacy

#### 2.3.1 Data Classification

| Data Type | Classification | Storage | Access Level |
|-----------|---------------|---------|-------------|
| User passwords | **Confidential** | Hashed (bcrypt), never plain-text | System only |
| User emails | **Private** | Encrypted in DB | Owner + Admin |
| JWT secrets | **Confidential** | Environment variable only | System only |
| DB credentials | **Confidential** | Environment variable only | System only |
| Professor names | **Public** | Database | Everyone |
| Course information | **Public** | Database | Everyone |
| Exam files | **Internal** | Server filesystem | Authenticated users |
| Analysis results | **Public** | Database | Everyone |
| User ratings | **Public** | Database (anonymized aggregates) | Everyone |
| User comments | **Public** | Database | Everyone |

#### 2.3.2 Data Protection Measures

| Principle | Implementation |
|-----------|---------------|
| **Data Minimization** | Collect only necessary data (name, email, university, department) |
| **Purpose Limitation** | Data used only for platform functionality |
| **Storage Limitation** | Inactive accounts flagged after 12 months |
| **Integrity** | Input validation, database constraints |
| **Confidentiality** | Encryption at rest (DB) and in transit (HTTPS) |
| **User Rights** | Users can view, edit, and delete their own data |

#### 2.3.3 Privacy-by-Design Principles

| Principle | How We Apply It |
|-----------|----------------|
| **Proactive not Reactive** | Security measures built into architecture from Day 1 |
| **Privacy as Default** | Ratings aggregated by default, individual votes not exposed |
| **Full Functionality** | Security doesn't compromise usability |
| **End-to-End Security** | Data protected from upload to storage to retrieval |
| **Transparency** | Privacy policy explains data collection and usage |
| **User-Centric** | Users control their own data (edit/delete profile, uploads) |

#### 2.3.4 KVKK (Turkish Data Protection) Compliance Plan

| Requirement | Status | Action |
|-------------|--------|--------|
| Inform users about data collection | Planned | Privacy policy page |
| Obtain explicit consent | Planned | Registration consent checkbox |
| Right to access personal data | Planned | Dashboard shows all user data |
| Right to delete personal data | Planned | Account deletion feature |
| Data breach notification | Planned | Notification process documented |
| Data processor agreements | N/A | No third-party data sharing |

#### 2.3.5 Environment Variable Security

```
# .env (NEVER committed to Git)
DATABASE_URL=postgresql://user:password@localhost:5432/profai
JWT_SECRET=<random-64-char-string>
JWT_EXPIRATION=24h
UPLOAD_MAX_SIZE=10485760
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development

# .gitignore MUST include:
# .env
# .env.local
# .env.production
# uploads/
# node_modules/
```

---

## 3. Implementation Roadmap

### 3.1 Roadmap Overview

```mermaid
gantt
    title ProfAI Implementation Roadmap
    dateFormat  YYYY-MM-DD
    axisFormat  %b %d

    section Planning
    Project Setup & Planning       :done, p1, 2026-02-19, 7d
    Jira Board & Task Assignment   :done, p2, 2026-02-19, 7d

    section Backend
    Database Design (Prisma)       :done, b1, 2026-02-26, 7d
    Auth API (Register/Login)      :done, b2, 2026-02-26, 7d
    Professor & Course APIs        :done, b3, 2026-03-05, 7d
    Exam Upload & Rating APIs      :done, b4, 2026-03-05, 7d
    Analysis Engine                :done, b5, 2026-03-12, 7d

    section Frontend
    React Project Setup            :done, f1, 2026-03-05, 4d
    Auth Pages (Login/Register)    :done, f2, 2026-03-19, 7d
    Home & Professor List Pages    :done, f3, 2026-03-19, 7d
    Professor Detail & Analysis    :active, f4, 2026-03-26, 7d
    Upload & Dashboard Pages       :active, f5, 2026-03-26, 7d

    section Infrastructure
    Docker Compose Setup           :done, inf1, 2026-03-20, 3d
    CI/CD Pipeline (GitHub Actions):done, inf2, 2026-03-23, 3d
    Environment Configuration      :done, inf3, 2026-03-24, 2d

    section Integration
    Frontend-Backend Integration   :i1, 2026-04-02, 7d
    Bug Fixes & Testing            :i2, 2026-04-02, 7d

    section Delivery
    Documentation & README         :d1, 2026-04-09, 5d
    Final Push & UBIS Submission   :d2, 2026-04-14, 2d
```

### 3.2 Sprint-by-Sprint Roadmap

#### Sprint 0: Planning & Setup (Feb 19 -- Mar 5)

| Task | Assignee | Status | Deliverable |
|------|----------|--------|-------------|
| Create Git repo and monorepo structure | ERDEM | Done | GitHub repo |
| Configure Docker Compose | ALI EMIR | Done | docker-compose.yml |
| Set up backend project (Express + TS) | ENES | Done | Running server |
| Design Prisma schema and migrations | ALI EMIR | Done | Database schema |
| Auth API - Register | ERDEM | Done | POST /api/auth/register |
| Auth API - Login (JWT) | ERDEM | Done | POST /api/auth/login |
| Jira board setup | ERDEM | Done | Jira board with 30 tasks |
| Project plan Excel | ENES | Done | ProfAI_Project_Plan.xlsx |

#### Sprint 1: Backend API & Analysis (Mar 5 -- Mar 19)

| Task | Assignee | Status | Deliverable |
|------|----------|--------|-------------|
| Professor CRUD API | ERDEM | Done | Full professor endpoints |
| Course CRUD API | ALI EMIR | Done | Full course endpoints |
| Exam upload API (Multer) | ENES | Done | File upload working |
| Exam listing API | ENES | Done | Exam query endpoints |
| Rating API | ALI EMIR | Done | Rating CRUD endpoints |
| Analysis algorithm | ENES | Done | Analysis engine |
| Professor analysis summary | ERDEM | Done | Analysis summary endpoint |
| React project setup | ERDEM | Done | Frontend skeleton |

#### Sprint 2: Frontend Pages (Mar 19 -- Apr 2)

| Task | Assignee | Status | Deliverable |
|------|----------|--------|-------------|
| Home page design | ERDEM | Done | Search + popular professors |
| Registration page | ERDEM | Done | Working registration form |
| Login page | ERDEM | Done | JWT-based login |
| Professor list page | ENES | Done | Filtered professor listing |
| Professor detail page | ALI EMIR | In Progress | Full professor profile |
| Analysis card (charts) | ALI EMIR | In Progress | Pie + bar charts |
| Exam upload page | ENES | Done | File upload UI |
| Dashboard page | ERDEM | In Progress | User statistics |
| CI/CD Pipeline setup | ALI EMIR | Done | GitHub Actions workflow |
| Docker infrastructure | ALI EMIR | Done | docker-compose.yml |

#### Sprint 3: Integration & Delivery (Apr 2 -- Apr 16)

| Task | Assignee | Status | Deliverable |
|------|----------|--------|-------------|
| Frontend-Backend integration | ERDEM | Planned | All pages connected to API |
| Responsive design fixes | ENES | Planned | Mobile/tablet compatible |
| Bug fixes and edge cases | ALI EMIR | Planned | Stable application |
| README.md | ALI EMIR | In Progress | Complete documentation |
| Finalize UML diagrams | ALI EMIR | Done | Updated diagrams |
| Final push + UBIS link | ERDEM | Planned | Submitted project |

### 3.3 Milestone Tracker

```mermaid
flowchart LR
    M1["M1\nProject Setup\nFeb 19\nDONE"]
    M2["M2\nBackend APIs\nMar 19\nDONE"]
    M3["M3\nFrontend Complete\nApr 2\nIN PROGRESS"]
    M4["M4\nIntegration Done\nApr 9"]
    M5["M5\nFinal Delivery\nApr 16"]

    M1 --> M2 --> M3 --> M4 --> M5

    style M1 fill:#27AE6022,stroke:#27AE60
    style M2 fill:#27AE6022,stroke:#27AE60
    style M3 fill:#F39C1222,stroke:#F39C12
    style M4 fill:#3498DB22,stroke:#3498DB
    style M5 fill:#E74C3C22,stroke:#E74C3C
```

### 3.4 Critical Path

The following tasks are on the critical path -- any delay in these directly delays the project:

```mermaid
flowchart LR
    CP1["Prisma Schema\nDesign\nDONE"] --> CP2["Auth API\nDONE"] --> CP3["Professor &\nCourse APIs\nDONE"] --> CP4["Analysis\nEngine\nDONE"] --> CP5["React Setup\n+ Pages\nIN PROGRESS"] --> CP6["Frontend-Backend\nIntegration"] --> CP7["Testing &\nBug Fixes"] --> CP8["Final\nDelivery"]

    style CP1 fill:#27AE6022,stroke:#27AE60
    style CP2 fill:#27AE6022,stroke:#27AE60
    style CP3 fill:#27AE6022,stroke:#27AE60
    style CP4 fill:#27AE6022,stroke:#27AE60
    style CP5 fill:#F39C1222,stroke:#F39C12
    style CP6 fill:#E74C3C22,stroke:#E74C3C
    style CP7 fill:#E74C3C22,stroke:#E74C3C
    style CP8 fill:#E74C3C22,stroke:#E74C3C
```

---

## 4. Risk Update Log

This section tracks all changes made to the risk analysis document over time.

### Version 2.0 Updates (March 26, 2026)

| Date | Risk ID | Change | Reason | Author |
|------|---------|--------|--------|--------|
| Mar 26, 2026 | R01 | Status: Active -> Mitigated | All team members active throughout project, cross-training completed | ProfAI Team |
| Mar 26, 2026 | R02 | Status: Active -> Mitigated | Team completed learning phase, all members proficient in tech stack | ProfAI Team |
| Mar 26, 2026 | R03 | Status: Active -> Mitigated | Prisma schema finalized and tested with migrations, no schema issues encountered | ALI EMIR |
| Mar 26, 2026 | R04 | Status: Active -> Mitigated | Docker Compose tested on Windows and Linux, documented workarounds for common issues | ALI EMIR |
| Mar 26, 2026 | R08 | Status: Active -> Mitigated | Feature branch strategy working well, no major merge conflicts encountered | ALL TEAM |
| Mar 26, 2026 | R09 | Status: Planned -> Mitigated | Prisma ORM prevents SQL injection, React auto-escaping prevents XSS, input validation middleware added | ALI EMIR |
| Mar 26, 2026 | R10 | Status: Planned -> Mitigated | Bcrypt password hashing implemented, .env files excluded from Git, API responses filtered | ERDEM |
| Mar 26, 2026 | R15 | Status: Active -> Mitigated | Feature freeze enforced since Week 6, team focused on MVP features only | ALL TEAM |
| Mar 26, 2026 | R16 | Status: Planned -> Mitigated | JWT with 24h expiration implemented, tokens stored in memory (not localStorage) | ERDEM |
| Mar 26, 2026 | R17 | Status: Active -> Mitigated | Tailwind CSS ensures cross-browser compatibility, tested on Chrome, Firefox, Edge | ENES |
| Mar 26, 2026 | R19 | Status: Active -> Mitigated | Docker volume persistence configured, PostgreSQL running stable in container | ALI EMIR |
| Mar 26, 2026 | R20 | Status: Active -> Mitigated | CORS configured to allow only localhost:3000, tested with different origins | ERDEM |
| Mar 26, 2026 | R21 | NEW | Added risk: Docker build failures in CI/CD pipeline — discovered during pipeline setup | ALI EMIR |
| Mar 26, 2026 | R22 | NEW | Added risk: Seed data inconsistency — discovered when seed data violated foreign key constraints | ENES |
| Mar 26, 2026 | R23 | NEW | Added risk: Environment variable misconfiguration — discovered when deploying to different environments | ALI EMIR |

### Version 1.0 (March 2026)

| Date | Risk ID | Change | Author |
|------|---------|--------|--------|
| Mar 2026 | All | Initial risk identification and assessment | ProfAI Team |

---

## Appendix

### A. Risk Register Change Log

| Date | Risk ID | Change | Author |
|------|---------|--------|--------|
| Mar 2026 | All | Initial risk identification and assessment | ProfAI Team |
| Mar 26, 2026 | R01-R20 | Status updates based on development progress | ProfAI Team |
| Mar 26, 2026 | R21-R23 | New risks added from development experience | ProfAI Team |

### B. References

| Document | Location |
|----------|----------|
| Project Plan | [`ProfAI_Project_Plan.xlsx`](./ProfAI_Project_Plan.xlsx) |
| Product Documentation | [`ProfAI_Product_Documentation.md`](./ProfAI_Product_Documentation.md) |
| Jira Task Structure | [`JIRA_TASK_STRUCTURE.md`](./JIRA_TASK_STRUCTURE.md) |
| UML Diagrams | [`ProfAI_UML_Diagrams.drawio`](./ProfAI_UML_Diagrams.drawio) |
| Demo Plan | [`ProfAI_Demo_Plan.md`](./ProfAI_Demo_Plan.md) |
| Risk Analysis v1 | [`ProfAI_Risk_Analysis.md`](./ProfAI_Risk_Analysis.md) |
