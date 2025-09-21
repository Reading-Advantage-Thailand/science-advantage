import { PrismaClient, LessonType, Role } from "@prisma/client";

const prisma = new PrismaClient();

const UNIT_SLUG = "ngss-grade-6-unit-1";

type QuizSeed = {
  order: number;
  prompt: string;
  options: [string, string, string, string];
  answer: string;
  rationale: string;
};

type LessonSeed = {
  title: string;
  slug: string;
  summary: string;
  order: number;
  content: string;
  type?: LessonType;
  quiz: QuizSeed[];
};

const lessons: LessonSeed[] = [
  {
    title: "Lesson 1: Earth's Systems Overview",
    slug: "lesson-1-earth-systems-overview",
    summary:
      "Students build a conceptual model of the geosphere, hydrosphere, atmosphere, and biosphere and explore how the systems interact.",
    order: 1,
    content: [
      "## Earth's Systems Overview",
      "- Identify Earth's four major systems",
      "- Examine energy and matter transfers between systems",
      "- Create a system interaction diagram for your science notebook",
    ].join("\n"),
    quiz: [
      {
        order: 1,
        prompt: "Which Earth system contains rivers, oceans, and glaciers?",
        options: ["Geosphere", "Hydrosphere", "Atmosphere", "Biosphere"],
        answer: "Hydrosphere",
        rationale: "The hydrosphere includes all of Earth's liquid and frozen water.",
      },
      {
        order: 2,
        prompt: "Plants exchanging gases with the air is an interaction between which systems?",
        options: [
          "Geosphere and Atmosphere",
          "Biosphere and Hydrosphere",
          "Atmosphere and Biosphere",
          "Hydrosphere and Geosphere",
        ],
        answer: "Atmosphere and Biosphere",
        rationale:
          "Plants (biosphere) take in carbon dioxide and release oxygen into the atmosphere.",
      },
      {
        order: 3,
        prompt: "Which statement best describes a system?",
        options: [
          "A group of unrelated parts",
          "A collection of parts working together",
          "An identical set of objects",
          "A random assortment of materials",
        ],
        answer: "A collection of parts working together",
        rationale: "A system is multiple interacting components that function as a whole.",
      },
      {
        order: 4,
        prompt: "How does the geosphere affect the hydrosphere?",
        options: [
          "Rocks melt into water",
          "River valleys guide water flow",
          "Plants release water vapor",
          "Winds carry water droplets",
        ],
        answer: "River valleys guide water flow",
        rationale: "Geosphere landforms channel hydrosphere movement.",
      },
    ],
  },
  {
    title: "Lesson 2: Weathering and Erosion",
    slug: "lesson-2-weathering-and-erosion",
    summary:
      "Students model weathering and erosion processes and connect them to Earth's changing surface over time.",
    order: 2,
    content: [
      "## Weathering and Erosion",
      "- Differentiate between physical and chemical weathering",
      "- Model erosion and deposition with stream tables",
      "- Analyze how landforms change across time",
    ].join("\n"),
    quiz: [
      {
        order: 1,
        prompt: "What is the main difference between weathering and erosion?",
        options: [
          "Weathering moves sediments; erosion breaks rocks",
          "Weathering breaks rocks; erosion moves sediments",
          "Weathering and erosion are identical",
          "Erosion only happens in deserts",
        ],
        answer: "Weathering breaks rocks; erosion moves sediments",
        rationale:
          "Weathering occurs in place, while erosion involves transporting the weathered material.",
      },
      {
        order: 2,
        prompt: "Which example shows chemical weathering?",
        options: [
          "Tree roots cracking a sidewalk",
          "Water freezing in rock cracks",
          "Acid rain dissolving limestone",
          "Wind carving arches in sandstone",
        ],
        answer: "Acid rain dissolving limestone",
        rationale: "Chemical weathering changes minerals through reactions like acid rain dissolving rock.",
      },
      {
        order: 3,
        prompt: "Where does deposition occur in a stream system?",
        options: ["At the source", "On steep slopes", "Where flow slows", "Only underground"],
        answer: "Where flow slows",
        rationale: "Sediments drop out when the water loses energy, such as in slow sections or deltas.",
      },
      {
        order: 4,
        prompt: "Which landform is mainly created by erosion?",
        options: ["Delta", "Floodplain", "Canyon", "Beach"],
        answer: "Canyon",
        rationale: "Flowing water erodes rock over long periods to form deep canyons.",
      },
    ],
  },
  {
    title: "Lesson 3: Water Cycle Dynamics",
    slug: "lesson-3-water-cycle-dynamics",
    summary:
      "Students trace water molecules through evaporation, condensation, precipitation, and collection pathways.",
    order: 3,
    content: [
      "## Water Cycle Dynamics",
      "- Track water molecules across the cycle",
      "- Explain phase changes with particle models",
      "- Relate the Sun's energy to water movement",
    ].join("\n"),
    quiz: [
      {
        order: 1,
        prompt: "What drives the entire water cycle?",
        options: ["Earth's rotation", "The Sun's energy", "Gravity", "Wind"],
        answer: "The Sun's energy",
        rationale: "Solar energy causes evaporation, which starts the movement of water through the cycle.",
      },
      {
        order: 2,
        prompt: "Which process changes water vapor back to liquid water?",
        options: ["Evaporation", "Sublimation", "Condensation", "Transpiration"],
        answer: "Condensation",
        rationale: "Condensation turns gas into liquid and forms clouds.",
      },
      {
        order: 3,
        prompt: "Where does groundwater collect?",
        options: ["In the atmosphere", "In aquifers", "Within clouds", "On mountain peaks"],
        answer: "In aquifers",
        rationale: "Groundwater fills permeable rock layers called aquifers below Earth's surface.",
      },
      {
        order: 4,
        prompt: "Which path shows a full cycle for one water molecule?",
        options: [
          "Ocean -> cloud -> lake",
          "Ocean -> evaporation -> cloud -> precipitation -> river -> ocean",
          "Cloud -> precipitation -> glacier",
          "River -> ocean -> glacier",
        ],
        answer: "Ocean -> evaporation -> cloud -> precipitation -> river -> ocean",
        rationale: "This path shows evaporation, condensation, precipitation, and collection returning to the ocean.",
      },
    ],
  },
  {
    title: "Lesson 4: Weather Patterns",
    slug: "lesson-4-weather-patterns",
    summary:
      "Students interpret weather maps, analyze air masses, and connect unequal heating to atmospheric circulation.",
    order: 4,
    content: [
      "## Weather Patterns",
      "- Compare maritime and continental air masses",
      "- Read synoptic weather maps",
      "- Model how unequal heating drives global winds",
    ].join("\n"),
    quiz: [
      {
        order: 1,
        prompt: "Which air mass is warm and humid?",
        options: ["Continental polar", "Maritime tropical", "Continental arctic", "Maritime polar"],
        answer: "Maritime tropical",
        rationale: "Maritime tropical air forms over warm oceans and brings heat and moisture.",
      },
      {
        order: 2,
        prompt: "What causes wind?",
        options: [
          "Earth's magnetic field",
          "Differing air pressures",
          "Ocean tides",
          "Earth reflecting sunlight",
        ],
        answer: "Differing air pressures",
        rationale:
          "Wind results from air moving from high-pressure to low-pressure areas created by unequal heating.",
      },
      {
        order: 3,
        prompt: "Which front often brings thunderstorms?",
        options: ["Warm front", "Cold front", "Stationary front", "Occluded front"],
        answer: "Cold front",
        rationale: "Cold fronts force warm air rapidly upward, producing thunderstorms.",
      },
      {
        order: 4,
        prompt: "Which tool measures air pressure?",
        options: ["Thermometer", "Anemometer", "Barometer", "Hygrometer"],
        answer: "Barometer",
        rationale: "A barometer measures air pressure to help forecast weather changes.",
      },
    ],
  },
  {
    title: "Lesson 5: Climate and Human Impact",
    slug: "lesson-5-climate-and-human-impact",
    summary:
      "Students compare weather and climate data, then evaluate how human activities influence climate systems.",
    order: 5,
    content: [
      "## Climate and Human Impact",
      "- Distinguish weather from climate",
      "- Analyze greenhouse gas data sets",
      "- Design a mitigation proposal for your community",
    ].join("\n"),
    quiz: [
      {
        order: 1,
        prompt: "What is the main difference between weather and climate?",
        options: [
          "Weather is day-to-day; climate is long-term",
          "Weather happens in the ocean",
          "Climate is only temperature",
          "Weather is only precipitation",
        ],
        answer: "Weather is day-to-day; climate is long-term",
        rationale: "Weather describes short-term conditions, while climate averages conditions over decades.",
      },
      {
        order: 2,
        prompt: "Which gas is the largest contributor to the greenhouse effect?",
        options: ["Nitrogen", "Oxygen", "Carbon dioxide", "Argon"],
        answer: "Carbon dioxide",
        rationale: "Carbon dioxide traps heat effectively and is increasing due to human activities.",
      },
      {
        order: 3,
        prompt: "Which human activity increases atmospheric carbon dioxide the most?",
        options: ["Planting trees", "Burning fossil fuels", "Recycling", "Using solar panels"],
        answer: "Burning fossil fuels",
        rationale: "Combusting coal, oil, and natural gas releases stored carbon into the atmosphere.",
      },
      {
        order: 4,
        prompt: "What is one effect of melting polar ice on oceans?",
        options: [
          "Lowered sea levels",
          "Saltier oceans",
          "Sea-level rise",
          "Immediate droughts",
        ],
        answer: "Sea-level rise",
        rationale: "Melting land ice adds water to the oceans, raising global sea levels.",
      },
    ],
  },
  {
    title: "Investigation: Designing a Mini Greenhouse",
    slug: "investigation-designing-a-mini-greenhouse",
    summary:
      "Students test how different materials affect internal temperature in a model greenhouse to connect energy transfer concepts.",
    order: 6,
    content: [
      "## Investigation Overview",
      "Students will design two mini greenhouses and compare how quickly each gains heat when exposed to a lamp.",
      "",
      "## Steps",
      "1. Form teams and review the safety checklist.",
      "2. Build two mini greenhouses using provided materials.",
      "3. Select one variable to test (cover material, ventilation, or mass).",
      "4. Collect temperature data every five minutes for 30 minutes.",
      "5. Graph results and recommend materials for a school garden greenhouse.",
      "",
      "## Safety Notes",
      "- Wear safety goggles when working near the heat lamp.",
      "- Do not touch the bulb or metal clamps with bare hands after they have been on for more than five minutes.",
      "- Keep water away from electrical cords and outlets.",
    ].join("\n"),
    type: LessonType.EXPERIMENT,
    quiz: [],
  },
];

async function resetForSeed() {
  await prisma.experimentSubmission.deleteMany();
  await prisma.lessonCompletion.deleteMany();
  await prisma.attempt.deleteMany();
  await prisma.quizQuestion.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.classEnrollment.deleteMany();
  await prisma.class.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  await resetForSeed();

  const teacher = await prisma.user.create({
    data: {
      email: "teacher.ngss@example.com",
      name: "Taylor Morgan",
      role: Role.TEACHER,
    },
  });

  const students = await Promise.all([
    prisma.user.create({
      data: {
        email: "student.a@example.com",
        name: "Avery Chen",
        role: Role.STUDENT,
      },
    }),
    prisma.user.create({
      data: {
        email: "student.b@example.com",
        name: "Jordan Patel",
        role: Role.STUDENT,
      },
    }),
  ]);

  const classroom = await prisma.class.create({
    data: {
      name: "NGSS Grade 6 - Unit 1",
      description: "Pilot cohort focusing on Earth's systems, weather, and climate.",
      joinCode: "NGSS6-UNIT1",
      teacher: {
        connect: { id: teacher.id },
      },
      enrollments: {
        create: students.map((student) => ({
          student: { connect: { id: student.id } },
        })),
      },
    },
  });

  const createdLessons = await prisma.$transaction(
    lessons.map((lesson) =>
      prisma.lesson.create({
        data: {
          title: lesson.title,
          slug: lesson.slug,
          summary: lesson.summary,
          order: lesson.order,
          unitSlug: UNIT_SLUG,
          content: lesson.content,
          type: lesson.type ?? LessonType.LESSON,
          quizQuestions: {
            create: lesson.quiz.map((question) => ({
              order: question.order,
              prompt: question.prompt,
              options: question.options,
              answer: question.answer,
              rationale: question.rationale,
            })),
          },
        },
      })
    )
  );

  const lessonOne = createdLessons.find(
    (lesson) => lesson.slug === "lesson-1-earth-systems-overview"
  );

  const experimentLesson = createdLessons.find(
    (lesson) => lesson.slug === "investigation-designing-a-mini-greenhouse"
  );

  if (lessonOne) {
    await prisma.lessonCompletion.create({
      data: {
        lessonId: lessonOne.id,
        studentId: students[0].id,
        classId: classroom.id,
      },
    });
  }

  if (experimentLesson) {
    await prisma.experimentSubmission.create({
      data: {
        lessonId: experimentLesson.id,
        studentId: students[0].id,
        classId: classroom.id,
        data: {
          teamName: "Avery & Jordan",
          variableTested: "Cover material",
          initialTemperatureC: 21.5,
          finalTemperatureC: 29.2,
          observations:
            "Greenhouse with clear plastic warmed faster than the vented model.",
        },
      },
    });
  }

  const totalQuestions = lessons.reduce((sum, lesson) => sum + lesson.quiz.length, 0);

  console.log("Seeded:", {
    teachers: 1,
    students: students.length,
    classes: 1,
    lessons: lessons.length,
    questions: totalQuestions,
    lessonCompletions: lessonOne ? 1 : 0,
    experimentSubmissions: experimentLesson ? 1 : 0,
  });
}

main()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
