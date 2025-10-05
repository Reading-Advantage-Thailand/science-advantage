#!/usr/bin/env node

/**
 * Test completion status using dev auth system consistently
 * This creates both teacher and student using dev auth, then tests the flow
 */

const http = require("http");

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

async function testWithDevAuth() {
  console.log("🔍 Testing completion status with dev auth system...\n");

  // Use dev auth for both teacher and student
  const teacherCookie = `dev-auth=${encodeURIComponent(
    JSON.stringify({
      role: "TEACHER",
      name: "Dev Teacher",
      email: "teacher.dev@example.com",
    })
  )}`;

  const studentCookie = `dev-auth=${encodeURIComponent(
    JSON.stringify({
      role: "STUDENT",
      name: "Dev Student",
      email: "student.dev@example.com",
    })
  )}`;

  // First, get the dev teacher's class
  console.log("1️⃣ Getting dev teacher's class...");
  const classesOptions = {
    hostname: "localhost",
    port: 3000,
    path: "/api/classes",
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: teacherCookie,
    },
  };

  const classesResponse = await makeRequest(classesOptions);

  if (classesResponse.status !== 200) {
    console.log("❌ Failed to get classes:", classesResponse.data);
    return;
  }

  const classes = classesResponse.data;
  if (!classes || classes.length === 0) {
    console.log("❌ No classes found for dev teacher");
    return;
  }

  const devClass = classes[0];
  console.log(`✅ Found class: ${devClass.name} (${devClass.id})`);

  // Get lessons for this class
  console.log("\n2️⃣ Getting lessons for class...");
  const lessonsOptions = {
    hostname: "localhost",
    port: 3000,
    path: `/api/classes/${devClass.id}/lessons`,
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: teacherCookie,
    },
  };

  const lessonsResponse = await makeRequest(lessonsOptions);

  if (lessonsResponse.status !== 200) {
    console.log("❌ Failed to get lessons:", lessonsResponse.data);
    return;
  }

  const lessons = lessonsResponse.data;
  if (!lessons || lessons.length === 0) {
    console.log("❌ No lessons found");
    return;
  }

  const lesson = lessons[0];
  console.log(`✅ Found lesson: ${lesson.title} (${lesson.slug})`);

  // Get initial completion status
  console.log("\n3️⃣ Getting initial completion status...");
  const completionsOptions = {
    hostname: "localhost",
    port: 3000,
    path: `/api/classes/${devClass.id}/lessons/${lesson.slug}/completions`,
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: teacherCookie,
    },
  };

  const initialCompletions = await makeRequest(completionsOptions);

  if (initialCompletions.status !== 200) {
    console.log("❌ Failed to get completions:", initialCompletions.data);
    return;
  }

  console.log("Initial completions:", initialCompletions.data.students);

  // Now have student complete the lesson
  console.log("\n4️⃣ Student completing lesson...");
  const toggleOptions = {
    hostname: "localhost",
    port: 3000,
    path: `/api/lessons/${lesson.slug}/completion`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: studentCookie,
    },
  };

  const toggleResponse = await makeRequest(toggleOptions, {});
  console.log("Toggle response:", toggleResponse.data);

  // Wait a moment
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Check completion status again
  console.log("\n5️⃣ Checking completion status after student action...");
  const finalCompletions = await makeRequest(completionsOptions);

  if (finalCompletions.status !== 200) {
    console.log("❌ Failed to get final completions:", finalCompletions.data);
    return;
  }

  console.log("Final completions:", finalCompletions.data.students);

  // Compare results
  const initialStudent = initialCompletions.data.students.find(
    (s) => s.email === "student.dev@example.com"
  );
  const finalStudent = finalCompletions.data.students.find(
    (s) => s.email === "student.dev@example.com"
  );

  if (initialStudent && finalStudent) {
    console.log("\n📊 Comparison:");
    console.log(
      `   Before: ${initialStudent.completed ? "✅ Completed" : "❌ Pending"} at ${initialStudent.completedAt || "N/A"}`
    );
    console.log(
      `   After:  ${finalStudent.completed ? "✅ Completed" : "❌ Pending"} at ${finalStudent.completedAt || "N/A"}`
    );

    if (initialStudent.completed !== finalStudent.completed) {
      console.log("   ✅ Status changed correctly - issue NOT reproduced");
    } else {
      console.log("   ❌ Status did NOT change - issue REPRODUCED!");
      console.log("   🔍 This suggests there's a real synchronization problem");
    }
  } else {
    console.log("   ❌ Student not found in completions");
    console.log("   🔍 This suggests the dev student isn't enrolled in the dev class");
  }
}

testWithDevAuth().catch(console.error);
