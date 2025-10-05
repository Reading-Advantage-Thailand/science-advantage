#!/usr/bin/env node

/**
 * Debug script to reproduce the completion status issue
 * This script simulates the student completion flow and teacher view
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Debugging completion status issue...\n");

  // Find or create test data
  const devStudent = await prisma.user.findFirst({
    where: { email: "student.a@example.com" },
  });

  const devTeacher = await prisma.user.findFirst({
    where: { email: "teacher.ngss@example.com" },
  });

  if (!devStudent || !devTeacher) {
    console.error("❌ Dev users not found. Please run seed script first.");
    return;
  }

  console.log(`👤 Student: ${devStudent.email} (${devStudent.id})`);
  console.log(`👨‍🏫 Teacher: ${devTeacher.email} (${devTeacher.id})\n`);

  // Find demo class
  const demoClass = await prisma.class.findFirst({
    where: { name: { contains: "NGSS" } },
  });

  if (!demoClass) {
    console.error("❌ Demo class not found.");
    return;
  }

  console.log(`🏫 Class: ${demoClass.name} (${demoClass.id})\n`);

  // Find first lesson
  const lesson = await prisma.lesson.findFirst({
    orderBy: { order: "asc" },
  });

  if (!lesson) {
    console.error("❌ No lessons found.");
    return;
  }

  console.log(`📚 Lesson: ${lesson.title} (${lesson.id})\n`);

  // Check current completion status
  const currentCompletion = await prisma.lessonCompletion.findUnique({
    where: {
      lessonId_studentId_classId: {
        lessonId: lesson.id,
        studentId: devStudent.id,
        classId: demoClass.id,
      },
    },
  });

  console.log("📊 Current completion status:");
  if (currentCompletion) {
    console.log(`   ✅ Completed at: ${currentCompletion.completedAt.toISOString()}`);
  } else {
    console.log(`   ❌ Not completed`);
  }

  // Simulate teacher API call
  console.log("\n👨‍🏫 Teacher view (API simulation):");
  const teacherViewCompletions = await prisma.lessonCompletion.findMany({
    where: {
      classId: demoClass.id,
      lessonId: lesson.id,
    },
    select: {
      studentId: true,
      completedAt: true,
    },
  });

  const completionMap = new Map(
    teacherViewCompletions.map((completion) => [completion.studentId, completion.completedAt])
  );

  const enrollments = await prisma.classEnrollment.findMany({
    where: { classId: demoClass.id },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  const students = enrollments.map((enrollment) => {
    const completedAt = completionMap.get(enrollment.student.id);
    return {
      studentId: enrollment.student.id,
      name: enrollment.student.name ?? enrollment.student.email,
      email: enrollment.student.email,
      completed: Boolean(completedAt),
      completedAt: completedAt ? completedAt.toISOString() : null,
    };
  });

  const studentStatus = students.find((s) => s.studentId === devStudent.id);
  if (studentStatus) {
    console.log(`   Student: ${studentStatus.name}`);
    console.log(`   Status: ${studentStatus.completed ? "✅ Completed" : "❌ Pending"}`);
    console.log(`   CompletedAt: ${studentStatus.completedAt || "null"}`);
  } else {
    console.log("   ❌ Student not found in enrollments");
  }

  console.log("\n🔍 Debug info:");
  console.log(`   Direct completion check: ${currentCompletion ? "EXISTS" : "NOT FOUND"}`);
  console.log(`   Teacher view check: ${studentStatus?.completed ? "COMPLETED" : "PENDING"}`);
  console.log(
    `   Match: ${currentCompletion?.completedAt?.toISOString() === studentStatus?.completedAt ? "✅" : "❌"}`
  );

  if (currentCompletion && studentStatus) {
    const directTime = currentCompletion.completedAt.getTime();
    const teacherTime = studentStatus.completedAt
      ? new Date(studentStatus.completedAt).getTime()
      : null;
    console.log(`   Time difference: ${teacherTime ? directTime - teacherTime : "N/A"}ms`);
  }
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
