import { PrismaClient } from '@prisma/client';

// Set up test database
process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5433/science_advantage";