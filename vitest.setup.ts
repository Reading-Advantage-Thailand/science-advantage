import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const primaryDatabaseUrl =
  process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5433/science_advantage';

if (!primaryDatabaseUrl.endsWith('_test')) {
    const testDatabaseUrl =
      process.env.TEST_DATABASE_URL ??
      (() => {
        try {
          const url = new URL(primaryDatabaseUrl);
          const pathname = url.pathname.replace(/\/$/, '');
          url.pathname = `${pathname}_test`;
          return url.toString();
        } catch {
          // Fallback for malformed URLs
          return `${primaryDatabaseUrl}_test`;
        }
      })();
    process.env.DATABASE_URL = testDatabaseUrl;
}

execSync('npx prisma db push --force-reset');