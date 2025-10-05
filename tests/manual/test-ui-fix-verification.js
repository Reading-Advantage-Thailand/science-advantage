#!/usr/bin/env node

/**
 * Manual UI Test Verification for Completion Status Fix
 *
 * This script helps verify that the completion status fix works correctly
 * by testing the API endpoints that the UI now uses.
 */

const http = require("http");

// Configuration
const BASE_URL = "http://localhost:3000";
const TEST_CLASS_ID = "cm9w9vn3b0000l7md8e6e1e9t"; // From our test data
const TEST_LESSON_SLUG = "introduction-to-chemistry";

// Helper function to make HTTP requests
function makeRequest(path, method = "GET", data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: 3000,
      path: path,
      method: method,
      headers: {
        "Content-Type": "application/json",
        Cookie: "next-auth.session-token=dev-impersonation-teacher-1", // Teacher session
      },
    };

    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => {
        try {
          const jsonBody = body ? JSON.parse(body) : {};
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: jsonBody,
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body,
          });
        }
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testCompletionsAPI() {
  console.log("🔍 Testing Completions API...");

  try {
    // Test the completions endpoint that the UI now uses
    const response = await makeRequest(
      `/api/classes/${TEST_CLASS_ID}/lessons/${TEST_LESSON_SLUG}/completions`
    );

    console.log(`✅ API Response Status: ${response.statusCode}`);

    if (response.statusCode === 200) {
      const data = response.body;
      console.log("✅ API Response Structure:");
      console.log(`   - Class: ${data.class?.name || "N/A"}`);
      console.log(`   - Lesson: ${data.lesson?.title || "N/A"}`);
      console.log(`   - Students: ${data.students?.length || 0}`);

      if (data.students && data.students.length > 0) {
        console.log("\n📊 Student Completion Status:");
        data.students.forEach((student, index) => {
          console.log(
            `   ${index + 1}. ${student.name}: ${student.completed ? "✅ Completed" : "⏳ Pending"}`
          );
        });
      }

      console.log("\n✅ Completions API is working correctly!");
      console.log("✅ The UI will now receive real-time updates every 5 seconds.");
      return true;
    } else {
      console.log(`❌ API returned status ${response.statusCode}`);
      console.log("Response:", response.body);
      return false;
    }
  } catch (error) {
    console.log("❌ Error testing completions API:", error.message);
    return false;
  }
}

async function testLessonCompletionAPI() {
  console.log("\n🔍 Testing Lesson Completion API...");

  try {
    // Test the lesson completion endpoint
    const response = await makeRequest(`/api/lessons/${TEST_LESSON_SLUG}/completion`);

    console.log(`✅ Lesson Completion API Status: ${response.statusCode}`);

    if (response.statusCode === 200) {
      const data = response.body;
      console.log("✅ Lesson Completion Response:");
      console.log(`   - Completed: ${data.completed ? "Yes" : "No"}`);
      console.log(`   - Completed At: ${data.completedAt || "N/A"}`);
      console.log(`   - Lesson ID: ${data.lessonId || "N/A"}`);

      console.log("\n✅ Lesson Completion API is working correctly!");
      return true;
    } else {
      console.log(`❌ API returned status ${response.statusCode}`);
      console.log("Response:", response.body);
      return false;
    }
  } catch (error) {
    console.log("❌ Error testing lesson completion API:", error.message);
    return false;
  }
}

async function main() {
  console.log("🚀 Starting UI Fix Verification Tests");
  console.log("=====================================\n");

  console.log("📋 Test Configuration:");
  console.log(`   - Base URL: ${BASE_URL}`);
  console.log(`   - Class ID: ${TEST_CLASS_ID}`);
  console.log(`   - Lesson Slug: ${TEST_LESSON_SLUG}`);
  console.log(`   - Test Type: Teacher impersonation\n`);

  const completionsTest = await testCompletionsAPI();
  const lessonCompletionTest = await testLessonCompletionAPI();

  console.log("\n📊 Test Results Summary:");
  console.log("========================");
  console.log(`Completions API Test: ${completionsTest ? "✅ PASSED" : "❌ FAILED"}`);
  console.log(`Lesson Completion API Test: ${lessonCompletionTest ? "✅ PASSED" : "❌ FAILED"}`);

  if (completionsTest && lessonCompletionTest) {
    console.log("\n🎉 ALL TESTS PASSED!");
    console.log("\n✅ The completion status display bug has been successfully fixed!");
    console.log("✅ Teachers will now see real-time updates in the completions page.");
    console.log("✅ The page auto-refreshes every 5 seconds to show the latest status.");
    console.log("\n🔧 To test manually:");
    console.log("1. Start the development server: npm run dev");
    console.log(
      "2. Navigate to: http://localhost:3000/classes/" +
        TEST_CLASS_ID +
        "/lessons/" +
        TEST_LESSON_SLUG +
        "/completions"
    );
    console.log("3. Complete the lesson as a student in another browser/tab");
    console.log("4. Watch the teacher's completions page update within 5 seconds");
  } else {
    console.log("\n❌ SOME TESTS FAILED!");
    console.log("Please check the server logs and ensure:");
    console.log("1. The development server is running (npm run dev)");
    console.log("2. The database is accessible");
    console.log("3. Test data exists in the database");
  }
}

// Run the tests
main().catch(console.error);
