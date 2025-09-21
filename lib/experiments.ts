import type { ExperimentSubmission } from "@prisma/client";

export type ExperimentGuide = {
  overview: string[];
  steps: string[];
  safetyNotes: string[];
};

export type ExperimentSubmissionData = {
  teamName: string;
  variableTested: string;
  initialTemperatureC: number;
  finalTemperatureC: number;
  observations: string;
};

type ParseResult =
  | { success: true; data: ExperimentSubmissionData }
  | { success: false; errors: string[] };

const toNumber = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value.trim());

    if (!Number.isNaN(parsed) && Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
};

const toString = (value: unknown) =>
  typeof value === "string" ? value.trim() : value === undefined || value === null ? "" : String(value).trim();

const isPresent = (value: string) => value.length > 0;

export function parseExperimentContent(content: string): ExperimentGuide {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const guide: ExperimentGuide = {
    overview: [],
    steps: [],
    safetyNotes: [],
  };

  let section: "overview" | "steps" | "safetyNotes" = "overview";

  for (const line of lines) {
    if (line.startsWith("##")) {
      const normalized = line.toLowerCase();

      if (normalized.includes("safety")) {
        section = "safetyNotes";
      } else if (normalized.includes("step")) {
        section = "steps";
      } else {
        section = "overview";
      }

      continue;
    }

    if (section === "steps") {
      guide.steps.push(line.replace(/^\d+\.\s*/, ""));
      continue;
    }

    if (section === "safetyNotes") {
      guide.safetyNotes.push(line.replace(/^[-*]\s*/, ""));
      continue;
    }

    guide.overview.push(line);
  }

  return guide;
}

export function parseExperimentSubmissionPayload(payload: unknown): ParseResult {
  if (!payload || typeof payload !== "object") {
    return { success: false, errors: ["Invalid payload"] };
  }

  const record = payload as Record<string, unknown>;
  const errors: string[] = [];

  const teamName = toString(record.teamName);
  const variableTested = toString(record.variableTested);
  const observations = toString(record.observations);
  const initialTemperatureC = toNumber(record.initialTemperatureC);
  const finalTemperatureC = toNumber(record.finalTemperatureC);

  if (!isPresent(teamName)) {
    errors.push("Team name is required");
  }

  if (!isPresent(variableTested)) {
    errors.push("Variable tested is required");
  }

  if (initialTemperatureC === null) {
    errors.push("Initial temperature must be a number");
  }

  if (finalTemperatureC === null) {
    errors.push("Final temperature must be a number");
  }

  if (!isPresent(observations)) {
    errors.push("Observations are required");
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      teamName,
      variableTested,
      initialTemperatureC: initialTemperatureC!,
      finalTemperatureC: finalTemperatureC!,
      observations,
    },
  };
}

type CsvSource = {
  submissions: Array<{
    studentName: string;
    studentEmail: string;
    submittedAt: Date;
    data: ExperimentSubmissionData;
  }>;
  lessonTitle: string;
  className: string;
};

const escapeCsvValue = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = typeof value === "number" ? value.toString() : value;

  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
};

export function experimentSubmissionsToCsv({ submissions, lessonTitle, className }: CsvSource) {
  const header = [
    "Class",
    "Lesson",
    "Team",
    "Student",
    "Email",
    "Variable",
    "Initial Temp (°C)",
    "Final Temp (°C)",
    "Change (°C)",
    "Observations",
    "Submitted At",
  ];

  const rows = submissions.map((submission) => {
    const change =
      submission.data.finalTemperatureC - submission.data.initialTemperatureC;

    return [
      escapeCsvValue(className),
      escapeCsvValue(lessonTitle),
      escapeCsvValue(submission.data.teamName),
      escapeCsvValue(submission.studentName),
      escapeCsvValue(submission.studentEmail),
      escapeCsvValue(submission.data.variableTested),
      escapeCsvValue(submission.data.initialTemperatureC.toFixed(2)),
      escapeCsvValue(submission.data.finalTemperatureC.toFixed(2)),
      escapeCsvValue(change.toFixed(2)),
      escapeCsvValue(submission.data.observations),
      escapeCsvValue(submission.submittedAt.toISOString()),
    ].join(",");
  });

  return [header.join(","), ...rows].join("\n");
}

export function sanitizeExperimentSubmission(
  submission: ExperimentSubmission
): ExperimentSubmissionData | null {
  if (!submission || typeof submission.data !== "object") {
    return null;
  }

  const data = submission.data as Record<string, unknown>;

  const parsed = parseExperimentSubmissionPayload({
    teamName: data.teamName,
    variableTested: data.variableTested,
    initialTemperatureC: data.initialTemperatureC,
    finalTemperatureC: data.finalTemperatureC,
    observations: data.observations,
  });

  return parsed.success ? parsed.data : null;
}
