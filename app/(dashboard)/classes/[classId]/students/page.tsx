import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";

interface StudentsPageProps {
  params: Promise<{
    classId: string;
  }>;
}

export default async function StudentsPage({ params }: StudentsPageProps) {
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

  // Get class with enrollments
  const classData = await prisma.class.findUnique({
    where: { id: classId },
    select: {
      id: true,
      name: true,
      teacherId: true,
      enrollments: {
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!classData) {
    return notFound();
  }

  // Check authorization (only teachers/admins can view students)
  const isTeacher = user.role === "TEACHER" || user.role === "ADMIN";
  const isOwner = classData.teacherId === user.id;

  if (!isTeacher && !isOwner) {
    return notFound();
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Students</h1>
        <p className="text-gray-600">Class: {classData.name}</p>
      </div>

      <div className="border rounded-lg p-6 bg-white shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            Enrolled Students ({classData.enrollments.length})
          </h2>
          <Button disabled>Add Student (Coming Soon)</Button>
        </div>

        {classData.enrollments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No students enrolled yet</p>
            <p className="text-sm text-gray-400">Students can join using the class join code</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Name</th>
                  <th className="text-left py-3 px-4 font-medium">Email</th>
                  <th className="text-left py-3 px-4 font-medium">Enrolled</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {classData.enrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{enrollment.student.name || "No name"}</td>
                    <td className="py-3 px-4">{enrollment.student.email}</td>
                    <td className="py-3 px-4">
                      {new Date(enrollment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="outline" size="sm" disabled>
                        View Progress
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-2">Class Join Code</h3>
          <p className="text-sm text-gray-600 mb-2">
            Share this code with students who need to join the class:
          </p>
          <code className="bg-white px-3 py-1 rounded border text-sm">
            {classData.id.slice(-6).toUpperCase()}
          </code>
        </div>
      </div>
    </div>
  );
}
