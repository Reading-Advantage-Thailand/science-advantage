import { describe, expect, it } from "vitest";

import {
  experimentSubmissionsToCsv,
  parseExperimentContent,
  parseExperimentSubmissionPayload,
} from "@/lib/experiments";

describe("parseExperimentContent", () => {
  it("splits overview, steps, and safety notes", () => {
    const guide = parseExperimentContent(
      [
        "## Investigation Overview",
        "Students explore concepts.",
        "",
        "## Steps",
        "1. Gather materials.",
        "2. Record observations.",
        "",
        "## Safety Notes",
        "- Wear goggles.",
        "- Keep liquids away from outlets.",
      ].join("\n")
    );

    expect(guide.overview).toEqual(["Students explore concepts."]);
    expect(guide.steps).toEqual(["Gather materials.", "Record observations."]);
    expect(guide.safetyNotes).toEqual([
      "Wear goggles.",
      "Keep liquids away from outlets.",
    ]);
  });
});

describe("parseExperimentSubmissionPayload", () => {
  it("validates required fields", () => {
    const result = parseExperimentSubmissionPayload({
      teamName: "Team Alpha",
      variableTested: "Soil type",
      initialTemperatureC: "21.5",
      finalTemperatureC: 28.3,
      observations: "Sample notes",
    });

    expect(result).toMatchObject({
      success: true,
      data: {
        teamName: "Team Alpha",
        variableTested: "Soil type",
        initialTemperatureC: 21.5,
        finalTemperatureC: 28.3,
        observations: "Sample notes",
      },
    });
  });

  it("returns errors for invalid payload", () => {
    const result = parseExperimentSubmissionPayload({
      teamName: "",
      variableTested: null,
      initialTemperatureC: "",
      finalTemperatureC: "abc",
      observations: "",
    });

    expect(result.success).toBe(false);
    expect(result).toMatchObject({
      errors: expect.arrayContaining([
        "Team name is required",
        "Variable tested is required",
        "Initial temperature must be a number",
        "Final temperature must be a number",
        "Observations are required",
      ]),
    });
  });
});

describe("experimentSubmissionsToCsv", () => {
  it("generates CSV rows", () => {
    const csv = experimentSubmissionsToCsv({
      className: "NGSS Cohort",
      lessonTitle: "Mini Greenhouse",
      submissions: [
        {
          studentName: "Avery",
          studentEmail: "avery@example.com",
          submittedAt: new Date("2024-01-01T12:00:00.000Z"),
          data: {
            teamName: "Team Sun",
            variableTested: "Cover material",
            initialTemperatureC: 21.45,
            finalTemperatureC: 29.12,
            observations: "Clear cover warmed faster.",
          },
        },
      ],
    });

    const rows = csv.split("\n");
    expect(rows[0]).toContain("Class,Lesson,Team,Student");
    expect(rows[1]).toContain("Team Sun");
    expect(rows[1]).toContain("29.12");
    expect(rows[1]).toContain("7.67");
    expect(rows[1]).toContain("2024-01-01T12:00:00.000Z");
  });
});
