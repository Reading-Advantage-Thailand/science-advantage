# Science Advantage

A comprehensive K-12 science curriculum platform designed for classroom use, featuring adaptive learning paths and multi-standards alignment (NGSS, UK National Curriculum, Thai Basic Education Core Curriculum).

## Overview

Science Advantage provides 180 days of structured science instruction per school year, combining reading comprehension, hands-on experimentation, and adaptive assessments. The platform serves as a complete science curriculum solution for teachers and students across different educational standards frameworks.

## Features

- **Multi-Standards Support**: NGSS, UK National Curriculum, and Thai Basic Education Core Curriculum
- **Adaptive Learning**: Three difficulty tracks with automatic adjustment based on performance
- **Experiment Integration**: Digital lab guides with data collection and analysis tools
- **AI-Powered Content**: Automated content generation and personalized feedback
- **Comprehensive Assessment**: Multiple assessment types with automated grading
- **Teacher Tools**: Class management, progress tracking, and lesson customization
- **Current Science Integration**: Real-time science news and recent discoveries

## Tech Stack

- **Frontend**: Next.js with App Router, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API routes, Prisma ORM
- **Database**: PostgreSQL on Google Cloud SQL (Production), Dockerized PostgreSQL (Local)
- **Authentication**: Auth.js (NextAuth.js)
- **Infrastructure**: Google Cloud Platform (Cloud Run, Cloud SQL, Cloud Storage)
- **AI Integration**: OpenAI API for content generation and feedback

## Prerequisites

- Node.js 18+
- npm or yarn
- Docker (for local database)
- Google Cloud account & gcloud CLI

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-org/science-advantage.git
cd science-advantage
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the environment template and fill in your values:

```bash
cp .env.example .env.local
```

For detailed environment setup instructions, including required variables and service configuration, see the [Environment Setup Guide](docs/onboarding/environment.md).

Your local `DATABASE_URL` should point to the Dockerized Postgres instance (e.g., `postgresql://postgres:postgres@localhost:5433/science_advantage`).

### 4. Database Setup

Start the local database using Docker:

```bash
docker-compose up -d
```

Then, set up the schema and seed data:

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Seed the database with initial data
npx prisma db seed
```

### 5. Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Quality Checks

Run these commands before opening a pull request:

```bash
npm run lint      # ESLint (zero warnings allowed)
npm run format    # Prettier dry run
npm run test      # Vitest unit tests
```

## Project Structure

```
science-advantage/
├── app/                    # Next.js App Router (Pages + API Routes)
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Main application pages
│   └── api/               # API routes
├── components/            # Reusable React components
│   ├── ui/               # shadcn/ui components
│   └── features/         # Feature-specific components
├── docs/                  # Project documentation
├── lib/                   # Shared utilities and configurations
│   ├── auth.ts           # Auth.js configuration
│   ├── prisma.ts         # Prisma client configuration
│   └── utils.ts          # Helper functions
├── prisma/                # Database schema and migrations
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed script
├── public/                # Static assets
├── tests/                 # Integration and E2E tests
└── ...                    # Config files (package.json, etc.)
```

## Database Schema

### Core Entities

- **Users**: Teachers, students, and administrators
- **Schools/Classes**: Organizational structure
- **Lessons**: Core curriculum content
- **Standards**: Multi-framework standards mapping
- **Experiments**: Lab activities and procedures
- **Assessments**: Questions, quizzes, and projects
- **Progress**: Student learning analytics

### Standards Framework

The platform supports multiple educational standards through a flexible mapping system:

```sql
standards_frameworks → standards_hierarchy → lesson_standards_mapping
```

## API Documentation

See `docs/architecture/api-spec.md` for the full OpenAPI specification.

## Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Use meaningful component and variable names
- Write JSDoc comments for complex functions

### Database

- Use Prisma schema for all database changes
- Create migrations for schema updates
- Follow naming conventions (camelCase for fields, PascalCase for models)

### Testing

```bash
# Run unit tests
npm run test

# Run integration tests
npm run test:integration

# Run end-to-end tests
npm run test:e2e
```

### Deployment

Deployments are handled automatically via the GitHub Actions workflow defined in `.github/workflows/deploy.yml`.

- **Staging**: Deployed automatically from a `develop` or `staging` branch (if configured).
- **Production**: Deployed automatically upon a push or merge to the `main` branch.

## Standards Implementation

### NGSS (Next Generation Science Standards)

- Performance expectations organized by grade bands
- Three-dimensional learning framework
- Engineering design integration

### UK National Curriculum

- Key Stages 1-4 progression
- Subject-specific requirements
- Working scientifically skills

### Thai Basic Education Core Curriculum

- Primary and secondary level organization
- Science inquiry emphasis
- Technology integration focus

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

Use conventional commits:

- `feat:` new features
- `fix:` bug fixes
- `docs:` documentation changes
- `style:` code style changes
- `refactor:` code refactoring
- `test:` test additions or modifications

## License

This project is licensed under the AGPL License - see the [LICENSE](LICENSE) file for details.

## Support

- Documentation: [docs/](./docs/)
- BMAD Agent Assignments: [BMAD Agent Assignments](docs/bmad-agent-assignments.md)
- Issues: [GitHub Issues](https://github.com/Reading-Advantage-Thailand/science-advantage/issues)
- Email: support@reading-advantage.com

## 🤖 BMAD Development Process

This project uses BMAD-METHOD for AI-assisted development with specialized agent roles:

- **dev (James)**: Full-stack implementation
- **architect (Winston)**: System design and architecture
- **qa (Quinn)**: Quality assurance and testing
- **ux-expert (Sally)**: UI/UX design
- **po (Sarah)**: Product ownership
- **sm (Bob)**: Scrum process management

See [BMAD Agent Assignments](docs/bmad-agent-assignments.md) for detailed role assignments and workflows.

## Roadmap

- [ ] Next.js app development
- [ ] Advanced AI tutoring features
- [ ] Virtual lab simulations
- [ ] Parent portal
- [ ] Additional standards frameworks
- [ ] Offline experiment support

---

**Science Advantage** - Empowering the next generation of scientists through adaptive, standards-aligned curriculum.
