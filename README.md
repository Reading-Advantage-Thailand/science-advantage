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

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API routes, Prisma ORM
- **Database**: PostgreSQL on Google Cloud SQL
- **Authentication**: Auth.js (NextAuth.js)
- **Infrastructure**: Google Cloud Platform
- **AI Integration**: OpenAI API for content generation and feedback

## Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL database
- Google Cloud account

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

Required environment variables:

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Google OAuth (for authentication)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# OpenAI API
OPENAI_API_KEY="your-openai-api-key"

# Google Cloud (for file storage)
GOOGLE_CLOUD_PROJECT_ID="your-project-id"
GOOGLE_CLOUD_STORAGE_BUCKET="your-storage-bucket"

# Redis (for caching)
REDIS_URL="redis://localhost:6379"
```

### 4. Database Setup

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

## Project Structure

```
science-advantage/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Main application pages
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # Reusable React components
│   ├── ui/               # shadcn/ui components
│   └── features/         # Feature-specific components
├── lib/                  # Utility functions and configurations
│   ├── auth.ts           # Auth.js configuration
│   ├── db.ts             # Database client
│   └── utils.ts          # Helper functions
├── prisma/               # Database schema and migrations
│   ├── schema.prisma     # Database schema
│   └── seeds/            # Seed data
├── public/               # Static assets
└── docs/                 # Documentation
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

### Authentication Endpoints

- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout
- `GET /api/auth/session` - Current session

### Curriculum Endpoints

- `GET /api/lessons` - Fetch lessons with standards filtering
- `GET /api/experiments` - Lab activities
- `POST /api/progress` - Update student progress
- `GET /api/assessments` - Fetch assessments

### Standards Endpoints

- `GET /api/standards` - Available standards frameworks
- `GET /api/standards/[framework]` - Specific framework standards
- `POST /api/lessons/[id]/standards` - Map lesson to standards

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

The application is deployed on Google Cloud Platform:

```bash
# Build for production
npm run build

# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production
```

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
- Issues: [GitHub Issues](https://github.com/Reading-Advantage-Thailand/science-advantage/issues)
- Email: support@reading-advantage.com

## Roadmap

- [ ] Next.js app development
- [ ] Advanced AI tutoring features
- [ ] Virtual lab simulations
- [ ] Parent portal
- [ ] Additional standards frameworks
- [ ] Offline experiment support

---

**Science Advantage** - Empowering the next generation of scientists through adaptive, standards-aligned curriculum.