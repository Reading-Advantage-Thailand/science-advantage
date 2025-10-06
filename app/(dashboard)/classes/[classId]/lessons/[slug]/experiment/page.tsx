import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";

interface ExperimentPageProps {
  params: Promise<{
    classId: string;
    slug: string;
  }>;
}

export default async function ExperimentPage({ params }: ExperimentPageProps) {
  const { classId, slug } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return notFound();
  }

  // Get user and verify access
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });

  if (!user) {
    return notFound();
  }

  // Get class and lesson
  const [classData, lesson] = await Promise.all([
    prisma.class.findUnique({
      where: { id: classId },
      select: { id: true, name: true, teacherId: true },
    }),
    prisma.lesson.findUnique({
      where: { slug },
      select: { id: true, title: true, type: true, content: true },
    }),
  ]);

  if (!classData || !lesson) {
    return notFound();
  }

  // Check authorization
  const isTeacher = user.role === "TEACHER" || user.role === "ADMIN";
  const isOwner = classData.teacherId === user.id;

  if (!isTeacher && !isOwner) {
    return notFound();
  }

  // Check if lesson is an experiment
  if (lesson.type !== "EXPERIMENT") {
    return notFound();
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{lesson.title}</h1>
        <p className="text-gray-600">Class: {classData.name}</p>
      </div>

      <div className="border rounded-lg p-6 bg-white shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Virtual Experiment</h2>

        <div className="prose max-w-none mb-6">
          <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-4">
            Experiment interface will be implemented here. This will include interactive
            simulations, data collection tools, and submission forms.
          </p>
          <Button disabled>Launch Experiment (Coming Soon)</Button>
        </div>
      </div>
    </div>
  );
}
