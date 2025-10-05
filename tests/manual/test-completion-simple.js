#!/usr/bin/env node

/**
 * Simple test to check completion status consistency
 * Uses database to get test data, then tests API endpoints
 */

require("dotenv").config({ path: ".env.local" });
const { PrismaClient } = require("@prisma/client");
const http = require("http");

const prisma = new PrismaClient();

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => {
        try {
          const jsonBody = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: jsonBody });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on("error", reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testCompletionFlow() {
  console.log("🔍 Testing completion flow with database data...\n");

  try {
    // First, ensure dev users exist
    console.log("🔧 Ensuring dev users exist...");
    const devTeacher = await prisma.user.findUnique({
      where: { id: "dev-teacher" },
    });

    const devStudent = await prisma.user.findUnique({
      where: { id: "dev-student" },
    });

    if (!devTeacher || !devStudent) {
      console.log("❌ Dev users not found. Please visit /signin and create dev users first.");
      return;
    }

    console.log(`✅ Dev teacher: ${devTeacher.name} (${devTeacher.email})`);
    console.log(`✅ Dev student: ${devStudent.name} (${devStudent.email})`);

    // Get dev teacher's class
    const devClass = await prisma.class.findFirst({
      where: { teacherId: "dev-teacher" },
      select: { id: true, name: true, teacherId: true },
    });

    if (!devClass) {
      console.log("❌ No dev class found. Dev teacher should have a class created automatically.");
      return;
    }

    // Get first lesson from database
    const testLesson = await prisma.lesson.findFirst({
      select: { slug: true, title: true },
    });

    if (!testLesson) {
      console.log("❌ No test lesson found in database");
      return;
    }

    console.log(`✅ Using class: ${devClass.name} (${devClass.id})`);
    console.log(`✅ Using lesson: ${testLesson.title} (${testLesson.slug})`);

    // Ensure dev student is enrolled in dev class
    const enrollment = await prisma.classEnrollment.findUnique({
      where: {
        classId_studentId: {
          classId: devClass.id,
          studentId: "dev-student",
        },
      },
    });

    if (!enrollment) {
      console.log("❌ Dev student not enrolled in dev class");
      return;
    }

    console.log(`✅ Dev student enrolled in dev class`);

    // Use dev auth for teacher
    const teacherCookie = `dev-auth=${encodeURIComponent(
      JSON.stringify({
        id: "dev-teacher",
        role: "TEACHER",
        name: devTeacher.name,
        email: devTeacher.email,
      })
    )}`;

    // Use dev auth for student
    const studentCookie = `dev-auth=${encodeURIComponent(
      JSON.stringify({
        id: "dev-student",
        role: "STUDENT",
        name: devStudent.name,
        email: devStudent.email,
      })
    )}`;

    // 1. Get initial completion status from teacher API
    console.log("\n1️⃣ Getting initial completion status...");
    const completionsOptions = {
      hostname: "localhost",
      port: 3000,
      path: `/api/classes/${devClass.id}/lessons/${testLesson.slug}/completions`,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: teacherCookie, // Using teacher cookie to view all completions
      },
    };

    const initialCompletions = await makeRequest(completionsOptions);

    if (initialCompletions.status !== 200) {
      console.log("❌ Failed to get initial completions:", initialCompletions.data);
      return;
    }

    console.log("Initial completions response:", initialCompletions.data);

    // 2. Student toggles completion
    console.log("\n2️⃣ Student toggling completion...");
    const toggleOptions = {
      hostname: "localhost",
      port: 3000,
      path: `/api/lessons/${testLesson.slug}/completion`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: studentCookie,
      },
    };

    // Toggle to true (mark as complete)
    const toggleResponse = await makeRequest(toggleOptions, {
      completed: true,
      classId: devClass.id,
    });
    console.log("Toggle response:", toggleResponse.data);

    // Wait a moment
    await new Promise((resolve) => setTimeout(resolve, 100));

    // 3. Check completion status again
    console.log("\n3️⃣ Checking completion status after toggle...");
    const finalCompletions = await makeRequest(completionsOptions);

    if (finalCompletions.status !== 200) {
      console.log("❌ Failed to get final completions:", finalCompletions.data);
      return;
    }

    console.log("Final completions response:", finalCompletions.data);

    // 4. Check database directly
    console.log("\n4️⃣ Checking database directly...");
    const dbCompletion = await prisma.lessonCompletion.findUnique({
      where: {
        lessonId_studentId_classId: {
          lessonId: testLesson.slug,
          studentId: "dev-student",
          classId: devClass.id,
        },
      },
    });

    console.log("Database completion:", dbCompletion);

    // 5. Compare results
    if (initialCompletions.data.students && finalCompletions.data.students) {
      const initialStudent = initialCompletions.data.students.find(
        (s) => s.email === devStudent.email
      );
      const finalStudent = finalCompletions.data.students.find((s) => s.email === devStudent.email);

      if (initialStudent && finalStudent) {
        console.log("\n📊 API Comparison:");
        console.log(
          `   Before: ${initialStudent.completed ? "✅ Completed" : "❌ Pending"} at ${initialStudent.completedAt || "N/A"}`
        );
        console.log(
          `   After:  ${finalStudent.completed ? "✅ Completed" : "❌ Pending"} at ${finalStudent.completedAt || "N/A"}`
        );

        if (initialStudent.completed !== finalStudent.completed) {
          console.log("   ✅ API status changed correctly");
        } else {
          console.log("   ❌ API status did NOT change - potential issue!");
        }
      }

      // Compare API with database
      if (dbCompletion && finalStudent) {
        console.log("\n📊 API vs Database Comparison:");
        console.log(
          `   Database: ${dbCompletion.completed ? "✅ Completed" : "❌ Pending"} at ${dbCompletion.completedAt || "N/A"}`
        );
        console.log(
          `   API:      ${finalStudent.completed ? "✅ Completed" : "❌ Pending"} at ${finalStudent.completedAt || "N/A"}`
        );

        if (dbCompletion.completed === finalStudent.completed) {
          console.log("   ✅ API and database are consistent");
        } else {
          console.log("   ❌ API and database are INCONSISTENT - this is the bug!");
        }
      }
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testCompletionFlow().catch(console.error);
