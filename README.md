# Science Advantage

Science Advantage is the K-12 science learning experience for the Advantage
ecosystem. This repository houses the Next.js application, Prisma schema, and the
spec-first documentation that guides product development.

## Quick Links

- Product Brief: `docs/project-brief.md`
- Product Requirements (PRD): `docs/prd.md`
- Capability Specs: `docs/specs/`
- Sprint Plans: `docs/sprint/`
- Migration Status: `docs/MIGRATION-REPORT.md`
- Workflow Guide: `CLAUDE.md`

## Getting Started

```bash
git clone https://github.com/your-org/science-advantage.git
cd science-advantage
npm install

# Environment setup
cp .env.example .env.local
# populate Google OAuth, Postgres, Redis, OpenAI credentials

# Database
npx prisma generate
npx prisma db push
npx prisma db seed

# Development server
npm run dev
```

### Recommended Tooling

- Node 18.x (see `.nvmrc` if present)
- Docker (optional for local Postgres via `docker-compose.yml`)
- GitHub CLI (`gh`) for issue and PR workflow

## Development Workflow

1. Start with the relevant spec under `docs/specs/`; update it before coding.
2. Create a GitHub issue (see templates in `.github/ISSUE_TEMPLATE/`) and branch
   following `feat/<issue>-<slug>` naming.
3. Implement changes with 2-space TypeScript style, keeping components focused.
4. Run validation commands prior to PR:

```bash
npm run lint
npm run test
npm run test:integration   # when touching API/Prisma
npm run test:e2e           # before deploys
```

5. Use the PR template to document spec deltas, implementation notes, and tests.
6. Enable squash-and-merge once checks pass and review is approved.

Additional workflow details live in `CLAUDE.md`.

## Repository Layout

- `app/` – Next.js App Router routes and API handlers
- `components/` – Shared UI primitives and feature components
- `lib/` – Cross-cutting utilities (auth, DB, helpers)
- `prisma/` – Database schema, migrations, and seeds
- `docs/` – Product brief, PRD, specs, sprints, and archive of legacy docs
- `tests/` – Vitest unit/integration specs
- `public/` – Static assets

## Contributing

- Follow Conventional Commits (`feat:`, `fix:`, `chore:`, etc.).
- Keep branches short-lived and tied to a single GitHub issue.
- Update specs and documentation as part of each change; specs are the source of
  truth for requirements.
- Do not commit secrets—use `.env.local` for development configuration.

For additional context on strategic goals, market positioning, and historical
artifacts, consult the archived documentation under `docs/archive/`.

## 📞 Contact & Information

- **Website**: [science-advantage.com](https://science-advantage.com)
- **Email**: info@science-advantage.com
- **Phone**: (555) 123-4567
- **Address**: 123 Education Boulevard, Learning City, LC 12345

## 📄 Resources

- [Sample Lesson Plans](docs/sample-lessons.md)
- [Implementation Guide](docs/implementation-guide.md)
- [Research & Validation](docs/research.md)
- [Case Studies](docs/case-studies.md)
- [API Documentation](docs/api.md)

## 🛣️ Roadmap

### Coming Soon

- [ ] Mobile applications for iOS and Android
- [ ] Advanced analytics dashboard
- [ ] Parent portal for progress tracking
- [ ] Integration with popular LMS platforms
- [ ] Multilingual support

### Future Enhancements

- [ ] Virtual reality laboratory experiences
- [ ] AI-powered tutoring system
- [ ] Advanced collaboration features
- [ ] Custom curriculum creation tools

---

**© 2025 Science Advantage. All rights reserved.**

Made with ❤️ for the future of education by the Science Advantage Team
