import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import {
  IconChevronRight,
  IconBook,
  IconBrain,
  IconChartBar,
  IconUsers,
  IconRocket,
  IconCheck,
  IconDeviceDesktop,
  IconWifi,
  IconTools,
  IconMail,
  IconCalendar,
} from '@tabler/icons-react';
import { getSession } from '@/lib/auth/server';

export default async function HomePage() {
  const session = await getSession();
  if (session) {
    redirect(`/${session.user.role.toLowerCase()}`);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-white dark:bg-gray-900">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-bold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Science Advantage
            </span>
          </div>
          <nav className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <ModeToggle />
              <Link href="/signin">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-rose-300 text-rose-800 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300 dark:hover:bg-rose-950"
                >
                  Sign in
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="bg-gradient-to-b from-white to-rose-50 dark:from-gray-900 dark:to-gray-800 py-20">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
                Empowering Teachers,
                <br />
                <span className="text-primary">Engaging Students</span>
              </h1>
              <p className="mb-10 text-lg text-gray-600 dark:text-gray-300">
                The AI-powered science learning platform built for Thai educators and students.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signin?role=teacher">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
                    <IconUsers className="mr-2 h-5 w-5" />
                    I&apos;m a Teacher
                  </Button>
                </Link>
                <Link href="/signin?role=student">
                  <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10">
                    <IconRocket className="mr-2 h-5 w-5" />
                    I&apos;m a Student
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="rounded-lg border bg-white p-6 text-center dark:bg-gray-800">
                <IconBook className="mx-auto mb-4 h-12 w-12 text-primary" />
                <h3 className="mb-2 text-lg font-semibold">Rich Content</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Curriculum-aligned lessons and activities for Grade 3 science.
                </p>
              </div>
              <div className="rounded-lg border bg-white p-6 text-center dark:bg-gray-800">
                <IconBrain className="mx-auto mb-4 h-12 w-12 text-primary" />
                <h3 className="mb-2 text-lg font-semibold">AI-Powered</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Personalized recommendations and intelligent tutoring.
                </p>
              </div>
              <div className="rounded-lg border bg-white p-6 text-center dark:bg-gray-800">
                <IconChartBar className="mx-auto mb-4 h-12 w-12 text-primary" />
                <h3 className="mb-2 text-lg font-semibold">Track Progress</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Real-time insights into student mastery and engagement.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-16 dark:bg-gray-800">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                Features for Teachers
              </h2>
              <div className="grid gap-4 text-left md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <IconCheck className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Class and student management</span>
                </div>
                <div className="flex items-start gap-3">
                  <IconCheck className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Assignment and progress tracking</span>
                </div>
                <div className="flex items-start gap-3">
                  <IconCheck className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Intervention alerts</span>
                </div>
                <div className="flex items-start gap-3">
                  <IconCheck className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Curriculum overview</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                Features for Students
              </h2>
              <div className="grid gap-4 text-left md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <IconRocket className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Interactive lessons and labs</span>
                </div>
                <div className="flex items-start gap-3">
                  <IconRocket className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Quizzes and review activities</span>
                </div>
                <div className="flex items-start gap-3">
                  <IconRocket className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Personalized recommendations</span>
                </div>
                <div className="flex items-start gap-3">
                  <IconRocket className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Progress tracking</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-primary/5 py-16">
          <div className="container text-center">
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              Ready to get started?
            </h2>
            <p className="mb-8 text-gray-600 dark:text-gray-300">
              Sign in with your Google account to access the platform.
            </p>
            <Link href="/signin">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
                Sign In Now
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t bg-white py-8 dark:bg-gray-900">
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Science Advantage - Thai Science Education Platform
            </p>
            <div className="flex items-center gap-6">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Built with Next.js and love for Thai education.
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}