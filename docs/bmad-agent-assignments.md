# BMAD Developer Agent Assignments

This document outlines the assignment of BMAD developer agents to specific tasks and steps within the Science Advantage platform development.

## 🚨 **CRITICAL: Phase 0 Infrastructure Compliance (COMPLETED ✅)**

_Note: This phase is already complete, but shows how it would have been assigned_

### **Agent: Full Stack Developer (dev) - James**

- **Why**: Core infrastructure implementation requires hands-on coding
- **Tasks**:
  - Create `lib/types.ts` - Centralized shared type definitions
  - Create `lib/api.ts` - Centralized API client
  - Create `lib/errors.ts` - Standardized error handling
  - Refactor `lib/env.ts` - Type-safe environment variables

---

## **Phase 1: Foundation & Core Curriculum (Epics 1 & 2)**

### **Epic 1: Foundation & Ecosystem Integration**

#### **Agent: Architect (Winston)**

- **Why**: System design, architecture decisions, technology selection
- **Tasks**:
  - Design monorepo structure and CI/CD pipeline architecture
  - Plan API gateway and microservices architecture
  - Design real-time data synchronization patterns

#### **Agent: Full Stack Developer (dev) - James**

- **Why**: Implementation of core infrastructure
- **Tasks**:
  - Set up monorepo and CI/CD pipeline
  - Implement SSO with Advantage authentication system
  - Build core API gateway
  - Implement real-time data synchronization

#### **Agent: Test Architect (qa) - Quinn**

- **Why**: Quality gates for critical infrastructure
- **Tasks**:
  - Create test strategy for authentication flows
  - Design integration tests for API gateway
  - Set up security testing for SSO

### **Epic 2: Core Science Curriculum & Content Management**

#### **Agent: UX Expert (Sally)**

- **Why**: UI/UX design for lesson player and content management
- **Tasks**:
  - Design interactive lesson player UI/UX
  - Create bilingual content management interface design
  - Design virtual laboratory user experience

#### **Agent: Full Stack Developer (dev) - James**

- **Why**: Implementation of curriculum features
- **Tasks**:
  - Build curriculum framework aligned with Thai standards
  - Develop interactive lesson player
  - Implement Virtual Laboratory system
  - Create bilingual CMS
  - Build assessment and quizzing engine

#### **Agent: Product Owner (Sarah)**

- **Why**: Backlog management and story refinement
- **Tasks**:
  - Refine curriculum framework stories
  - Prioritize lesson player features
  - Define acceptance criteria for assessments

---

## **Sprint S0 - Current Stories (Detailed Agent Assignments)**

### **1. App Skeleton (Next.js + TS + Tailwind + shadcn)**

- **Primary Agent**: **Full Stack Developer (dev) - James**
  - Implement Next.js skeleton with Tailwind and shadcn/ui
  - Set up placeholder dashboard route
  - Configure ESLint and Prettier

- **Supporting Agent**: **Test Architect (qa) - Quinn**
  - Review test plan for component rendering
  - Validate Tailwind class application testing

### **2. Env + Secrets Baseline**

- **Primary Agent**: **Full Stack Developer (dev) - James**
  - Create complete `.env.example`
  - Implement runtime validation with clear errors

- **Supporting Agent**: **Architect (Winston)**
  - Review environment variable architecture
  - Validate security approach for secrets management

### **3. Database + Prisma Init**

- **Primary Agent**: **Full Stack Developer (dev) - James**
  - Create base schema for users, classes, lessons, questions, attempts
  - Implement seed data for NGSS Grade 6 Unit 1

- **Supporting Agent**: **Architect (Winston)**
  - Review database schema design
  - Validate data relationships and constraints

- **Quality Agent**: **Test Architect (qa) - Quinn**
  - Review integration test strategy
  - Validate referential integrity testing

### **4. Auth (Google OAuth) + Protected Routes**

- **Primary Agent**: **Full Stack Developer (dev) - James**
  - Implement Google OAuth sign-in/out
  - Create protected routes for `/dashboard`
  - Display user session information

- **Security Agent**: **Test Architect (qa) - Quinn**
  - Review authentication security
  - Design OAuth flow testing
  - Validate session management

- **Architecture Agent**: **Architect (Winston)**
  - Review authentication architecture
  - Validate integration with Advantage system

### **5. Lesson Viewer (Static Content, Completion Toggle)**

- **Primary Agent**: **Full Stack Developer (dev) - James**
  - Build lesson viewer component
  - Implement completion toggle functionality
  - Create teacher completion list view

- **UX Agent**: **UX Expert (Sally)**
  - Design lesson viewer interface
  - Create completion interaction patterns
  - Design teacher dashboard view

- **Backend Agent**: **Full Stack Developer (dev) - James**
  - Implement completion API endpoints
  - Create teacher list aggregation

- **Quality Agent**: **Test Architect (qa) - Quinn**
  - Review E2E test flow
  - Validate API testing strategy

### **6. MCQ Quiz (Auto-score)**

- **Primary Agent**: **Full Stack Developer (dev) - James**
  - Implement question and attempt models
  - Build quiz submission and auto-scoring
  - Create teacher scores table

- **Logic Agent**: **Full Stack Developer (dev) - James**
  - Implement scoring function with edge cases
  - Handle skips and duplicates

- **Quality Agent**: **Test Architect (qa) - Quinn**
  - Review scoring algorithm testing
  - Validate pagination for scores

### **7. Experiment Guide + Data Entry (Basic)**

- **Primary Agent**: **Full Stack Developer (dev) - James**
  - Build experiment page with steps and safety notes
  - Implement data submission form
  - Create CSV export functionality

- **UX Agent**: **UX Expert (Sally)**
  - Design experiment interface
  - Create data entry forms
  - Design export interface

- **Quality Agent**: **Test Architect (qa) - Quinn**
  - Review CSV export testing
  - Validate data form validation

### **8. Class Admin Lite (Class + Join Code + Assignment)**

- **Primary Agent**: **Full Stack Developer (dev) - James**
  - Implement class creation and join code generation
  - Build assignment creation with due dates
  - Create student "My Work" view

- **Business Logic Agent**: **Full Stack Developer (dev) - James**
  - Implement join code constraints and uniqueness
  - Create assignment workflow

- **Quality Agent**: **Test Architect (qa) - Quinn**
  - Review join code testing strategy
  - Validate assignment workflow testing

---

## **Cross-Cutting Responsibilities**

### **Product Owner (Sarah) - Overall Sprint Management**

- Sprint planning and backlog refinement
- Story acceptance criteria validation
- Priority decisions and trade-off management
- Stakeholder communication

### **Scrum Master (Bob) - Process Management**

- Story creation and task breakdown
- Sprint facilitation and impediment removal
- Team coordination and workflow optimization
- Definition of Done enforcement

### **Test Architect (Quinn) - Quality Gates**

- Test strategy across all stories
- Quality gate decisions
- Test coverage validation
- Security and performance testing

### **Architect (Winston) - Technical Governance**

- Architecture compliance validation
- Technical decision documentation
- Integration pattern review
- Performance and scalability guidance

---

## **Implementation Priority Order**

1. **Immediate (P1)**: App Skeleton → Env + Secrets → Database → Auth
2. **Core Features (P1)**: Lesson Viewer → MCQ Quiz
3. **Secondary Features (P2)**: Experiment Guide → Class Admin Lite

Each story follows the pattern: **UX Design → Architecture Review → Implementation → Quality Assurance → Product Owner Acceptance**

---

## **Agent Command Patterns**

### **Full Stack Developer (dev) - James**

```bash
# Implementation commands
*develop-story
*run-tests
*explain
```

### **Architect (Winston)**

```bash
# Architecture commands
*create-full-stack-architecture
*create-backend-architecture
*execute-checklist architect-checklist
```

### **UX Expert (Sally)**

```bash
# Design commands
*create-front-end-spec
*generate-ui-prompt
```

### **Test Architect (Quinn)**

```bash
# Quality commands
*review {story}
*gate {story}
*test-design {story}
```

### **Product Owner (Sarah)**

```bash
# Product commands
*validate-story-draft {story}
*execute-checklist-po
```

### **Scrum Master (Bob)**

```bash
# Process commands
*draft
*story-checklist
*correct-course
```

---

## **Workflow Integration**

This assignment document integrates with the existing BMAD workflow:

1. **Story Creation**: Scrum Master creates stories with agent assignments
2. **Design Phase**: UX Expert and Architect contribute to design
3. **Implementation**: Full Stack Developer implements with QA oversight
4. **Quality Gates**: Test Architect reviews and creates quality gates
5. **Acceptance**: Product Owner validates completion

Each agent knows their responsibilities and can be invoked using their specific commands when their expertise is needed.
