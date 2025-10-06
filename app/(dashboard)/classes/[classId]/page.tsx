import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ClassPageProps {
  params: Promise<{
    classId: string;
  }>;
}

export default async function ClassPage({ params }: ClassPageProps) {
  const { classId } = await params;
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

  // Get class with enrollments and stats
  const classData = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      teacher: {
        select: { id: true, name: true, email: true },
      },
      enrollments: {
        include: {
          student: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: {
          enrollments: true,
          lessonCompletions: true,
          experimentSubmissions: true,
        },
      },
    },
  });

  if (!classData) {
    return notFound();
  }

  // Check authorization
  const isTeacher = user.role === "TEACHER" || user.role === "ADMIN";
  const isOwner = classData.teacherId === user.id;

  if (!isTeacher && !isOwner) {
    return notFound();
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{classData.name}</h1>
        <p className="text-gray-600">Teacher: {classData.teacher.name}</p>
        {classData.description && <p className="text-gray-700 mt-2">{classData.description}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Students</h3>
          <p className="text-3xl font-bold text-blue-600">{classData._count.enrollments}</p>
          <p className="text-sm text-gray-600">Enrolled students</p>
        </div>

        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Lesson Completions</h3>
          <p className="text-3xl font-bold text-green-600">{classData._count.lessonCompletions}</p>
          <p className="text-sm text-gray-600">Completed lessons</p>
        </div>

        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Experiment Submissions</h3>
          <p className="text-3xl font-bold text-purple-600">
            {classData._count.experimentSubmissions}
          </p>
          <p className="text-sm text-gray-600">Submitted experiments</p>
        </div>
      </div>

      <div className="border rounded-lg p-6 bg-white shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Class Management</h2>
          <div className="space-x-2">
            <Button variant="outline" asChild>
              <Link href={`/dashboard/classes/${classId}/students`}>Manage Students</Link>
            </Button>
            <Button asChild>
              <Link href={`/dashboard/classes/${classId}/lessons`}>View Lessons</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-2">Join Code</h3>
            <p className="text-2xl font-mono bg-gray-100 p-2 rounded text-center">
              {classData.joinCode}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Share this code with students to join your class
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2">Recent Students</h3>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {classData.enrollments.length > 0 ? (
                classData.enrollments.slice(0, 3).map((enrollment) => (
                  <div key={enrollment.id} className="text-sm">
                    {enrollment.student.name || enrollment.student.email}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No students enrolled yet</p>
              )}
              {classData.enrollments.length > 3 && (
                <p className="text-sm text-gray-500">
                  +{classData.enrollments.length - 3} more students
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
