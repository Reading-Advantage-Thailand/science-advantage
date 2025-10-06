import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";

interface QuizPageProps {
  params: Promise<{
    classId: string;
    slug: string;
  }>;
}

export default async function QuizPage({ params }: QuizPageProps) {
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
      select: {
        id: true,
        title: true,
        type: true,
        content: true,
        quizQuestions: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            order: true,
            prompt: true,
            options: true,
            answer: true,
            rationale: true,
          },
        },
      },
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

  // Check if lesson has quiz questions
  if (!lesson.quizQuestions || lesson.quizQuestions.length === 0) {
    return notFound();
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{lesson.title}</h1>
        <p className="text-gray-600">Class: {classData.name}</p>
      </div>

      <div className="border rounded-lg p-6 bg-white shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Quiz</h2>

        <div className="prose max-w-none mb-6">
          <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">
            Quiz Questions ({lesson.quizQuestions.length})
          </h3>

          <div className="space-y-6">
            {lesson.quizQuestions.map((question, index) => (
              <div key={question.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium mb-2">{question.prompt}</p>

                    <div className="space-y-2 mb-3">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className={`p-2 rounded border ${
                            option === question.answer
                              ? "bg-green-50 border-green-200 text-green-800"
                              : "bg-white border-gray-200"
                          }`}
                        >
                          {option}
                          {option === question.answer && (
                            <span className="ml-2 text-xs font-medium">(Correct Answer)</span>
                          )}
                        </div>
                      ))}
                    </div>

                    {question.rationale && (
                      <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                        <strong>Rationale:</strong> {question.rationale}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800 mb-4">
              Quiz interface for students will be implemented here. This will include interactive
              questions, timer functionality, and submission forms.
            </p>
            <Button disabled>Start Quiz for Students (Coming Soon)</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
