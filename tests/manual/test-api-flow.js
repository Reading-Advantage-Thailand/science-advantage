#!/usr/bin/env node

/**
 * Test script to reproduce the completion status issue using actual API calls
 * This simulates the real user flow through the web interface
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

async function testCompletionFlow() {
  console.log("🔍 Testing completion status flow via API...\n");

  const baseUrl = "http://localhost:3000";
  const classId = "cmgd1vpjl0003nmjrf6a19dlr";
  const lessonSlug = "lesson-1-earth-systems-overview";

  // First, let's create a dev teacher session and get their class
  console.log("1️⃣ Setting up dev teacher session...");

  // Use the seeded teacher's credentials for dev auth
  const teacherCookie = `dev-auth=${encodeURIComponent(
    JSON.stringify({
      role: "TEACHER",
      name: "Taylor Morgan",
      email: "teacher.ngss@example.com",
    })
  )}`;

  // Get teacher's class info
  const classOptions = {
    hostname: "localhost",
    port: 3000,
    path: `/api/classes/${classId}/lessons/${lessonSlug}/completions`,
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: teacherCookie,
    },
  };

  console.log("2️⃣ Getting current completion status from teacher view...");
  const teacherResponse = await makeRequest(classOptions);

  if (teacherResponse.status === 401) {
    console.log(
      "❌ Teacher auth failed. This suggests the dev teacher ID doesn't match the seeded teacher ID."
    );
    console.log("   This is expected - dev auth creates separate users from seed data.");

    // Let's check what classes the dev teacher has
    const devClassOptions = {
      hostname: "localhost",
      port: 3000,
      path: "/api/classes",
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: teacherCookie,
      },
    };

    const devClassResponse = await makeRequest(devClassOptions);
    console.log("Dev teacher classes:", devClassResponse.data);
    return;
  }

  console.log("Teacher view response:", teacherResponse.data);

  // Now set up student session
  console.log("\n3️⃣ Setting up dev student session...");
  const studentCookie = `dev-auth=${encodeURIComponent(
    JSON.stringify({
      role: "STUDENT",
      name: "Avery Chen",
      email: "student.a@example.com",
    })
  )}`;

  // Toggle completion
  const toggleOptions = {
    hostname: "localhost",
    port: 3000,
    path: `/api/lessons/${lessonSlug}/completion`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: studentCookie,
    },
  };

  console.log("4️⃣ Toggling student completion...");
  const toggleResponse = await makeRequest(toggleOptions, {});
  console.log("Toggle response:", toggleResponse.data);

  // Wait a moment to simulate real-world timing
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Check teacher view again
  console.log("\n5️⃣ Checking teacher view after student completion...");
  const teacherResponseAfter = await makeRequest(classOptions);
  console.log("Teacher view after:", teacherResponseAfter.data);

  // Compare the results
  if (teacherResponse.data.students && teacherResponseAfter.data.students) {
    const studentBefore = teacherResponse.data.students.find(
      (s) => s.email === "student.a@example.com"
    );
    const studentAfter = teacherResponseAfter.data.students.find(
      (s) => s.email === "student.a@example.com"
    );

    if (studentBefore && studentAfter) {
      console.log("\n📊 Comparison:");
      console.log(
        `   Before: ${studentBefore.completed ? "✅ Completed" : "❌ Pending"} at ${studentBefore.completedAt || "N/A"}`
      );
      console.log(
        `   After:  ${studentAfter.completed ? "✅ Completed" : "❌ Pending"} at ${studentAfter.completedAt || "N/A"}`
      );

      if (studentBefore.completed !== studentAfter.completed) {
        console.log("   ✅ Status changed correctly - issue NOT reproduced");
      } else {
        console.log("   ❌ Status did NOT change - issue REPRODUCED!");
      }
    } else {
      console.log("   ❌ Student not found in teacher view");
    }
  }
}

testCompletionFlow().catch(console.error);
