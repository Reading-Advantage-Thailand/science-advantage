import { PrismaClient, StandardsAlignment } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper to generate a 6-character alphanumeric join code (excluding ambiguous chars)
function generateJoinCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude I, O, 0, 1
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function main() {
  console.log('🌱 Starting seed process...\n');

  // 1. Seed demo users
  console.log('👥 Seeding demo users...');
  const password = 'Password123!';
  const hashedPassword = await bcrypt.hash(password, 10);

  const demoUsers = [
    {
      username: 'student_demo',
      displayUsername: 'student_demo',
      name: 'Demo Student',
      email: 'student@demo.local',
      role: 'STUDENT' as const,
      gradeLevel: 3,
    },
    {
      username: 'teacher_demo',
      displayUsername: 'teacher_demo',
      name: 'Demo Teacher',
      email: 'teacher@demo.local',
      role: 'TEACHER' as const,
      gradeLevel: null,
    },
    {
      username: 'admin_demo',
      displayUsername: 'admin_demo',
      name: 'Demo Admin',
      email: 'admin@demo.local',
      role: 'ADMIN' as const,
      gradeLevel: null,
    },
    {
      username: 'system_demo',
      displayUsername: 'system_demo',
      name: 'Demo System Admin',
      email: 'system@demo.local',
      role: 'SYSTEM' as const,
      gradeLevel: null,
    },
  ];

  const users: Record<string, any> = {};
  for (const userData of demoUsers) {
    const user = await prisma.user.upsert({
      where: { username: userData.username },
      update: {},
      create: {
        id: `demo_${userData.role.toLowerCase()}`,
        ...userData,
        emailVerified: false,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Create account for Better Auth
    const accountId = `${user.id}_credential`;
    await prisma.account.upsert({
      where: { id: accountId },
      update: {},
      create: {
        id: accountId,
        userId: user.id,
        accountId: user.username,
        providerId: 'credential',
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    users[userData.role] = user;
    console.log(`  ✓ Created ${userData.role} user: ${userData.username}`);
  }

  // 2. Seed Grade 3 Thai National Standards
  console.log('\n📚 Seeding Grade 3 Thai National Standards...');

  const grade3ThaiStandards = [
    // Strand 1: Living Things & Life Processes
    { code: 'Sc1.1-G3', description: 'Identify and describe characteristics that distinguish living from non-living things' },
    { code: 'Sc1.2-G3', description: 'Observe and record basic life processes' },
    { code: 'Sc1.3-G3', description: 'Compare similarities and differences among living things' },

    // Strand 2: Life & the Environment
    { code: 'Sc2.1-G3', description: 'Describe relationships between organisms and their environment' },
    { code: 'Sc2.2-G3', description: 'Create simple food chains showing energy flow' },
    { code: 'Sc2.3-G3', description: 'Identify ways to protect local environments' },

    // Strand 3: Substances & Properties
    { code: 'Sc3.1-G3', description: 'Observe and describe properties of common substances' },
    { code: 'Sc3.2-G3', description: 'Identify the three states of matter in everyday objects' },

    // Strand 4: Forces & Motion
    { code: 'Sc4.1-G3', description: 'Demonstrate push and pull forces' },
    { code: 'Sc4.2-G3', description: 'Describe how forces cause motion or changes in motion' },

    // Strand 5: Energy
    { code: 'Sc5.1-G3', description: 'Identify different forms of energy in daily life' },
    { code: 'Sc5.2-G3', description: 'Describe basic energy sources' },

    // Strand 6: Earth's Processes
    { code: 'Sc6.1-G3', description: 'Describe major features of Earth\'s surface' },
    { code: 'Sc6.2-G3', description: 'Observe and record weather patterns' },
    { code: 'Sc6.3-G3', description: 'Explain the day-night cycle' },

    // Strand 7: Astronomy & Space
    { code: 'Sc7.1-G3', description: 'Describe the Sun, Earth, and Moon' },
    { code: 'Sc7.2-G3', description: 'Explain what causes day and night' },
    { code: 'Sc7.3-G3', description: 'Observe and record moon phases' },

    // Strand 8: Nature of Science & Technology
    { code: 'Sc8.1-G3', description: 'Use scientific process to investigate simple questions' },
    { code: 'Sc8.2-G3', description: 'Use basic tools for observation and measurement' },
    { code: 'Sc8.3-G3', description: 'Record observations using drawings and simple descriptions' },
  ];

  const standardsById: Record<string, any> = {};
  for (const standardData of grade3ThaiStandards) {
    const standard = await prisma.standard.upsert({
      where: {
        framework_code: {
          framework: 'THAI',
          code: standardData.code,
        }
      },
      update: {},
      create: {
        framework: 'THAI',
        code: standardData.code,
        description: standardData.description,
        gradeLevel: 3,
      },
    });
    standardsById[standardData.code] = standard;
    console.log(`  ✓ Created standard: ${standardData.code}`);
  }

  // 3. Seed Grade 3 Lessons (Unit 1: Introduction to Science & Living Things)
  console.log('\n📖 Seeding Grade 3 Unit 1 lessons...');

  const unit1Lessons = [
    {
      id: 'g3-being-a-scientist',
      title: 'Being a Scientist / การเป็นนักวิทยาศาสตร์',
      description: 'What do scientists do? Learn about observing, questioning, predicting, testing, and concluding.',
      order: 1,
      standards: ['Sc8.1-G3', 'Sc8.2-G3'],
    },
    {
      id: 'g3-science-safety-tools',
      title: 'Science Safety and Tools / ความปลอดภัยและเครื่องมือทางวิทยาศาสตร์',
      description: 'Staying safe in science and using basic tools like magnifying glass, ruler, and thermometer.',
      order: 2,
      standards: ['Sc8.2-G3'],
    },
    {
      id: 'g3-making-observations',
      title: 'Making Observations / การสังเกต',
      description: 'Using our senses to observe and record what we see in detail.',
      order: 3,
      standards: ['Sc8.2-G3', 'Sc8.3-G3'],
    },
    {
      id: 'g3-what-makes-alive',
      title: 'What Makes Something Alive? / อะไรทำให้สิ่งมีชีวิต',
      description: 'Seven characteristics of living things: movement, growth, reproduction, response, nutrition, respiration, excretion.',
      order: 4,
      standards: ['Sc1.1-G3'],
    },
    {
      id: 'g3-diversity-living-things',
      title: 'Diversity of Living Things / ความหลากหลายของสิ่งมีชีวิต',
      description: 'Many types of living things - plants, animals, and more. Basic grouping by observable features.',
      order: 5,
      standards: ['Sc1.3-G3'],
    },
    {
      id: 'g3-observing-living-things-lab',
      title: 'Lab: Observing Living Things / การสังเกตสิ่งมีชีวิต',
      description: 'Plant observation study - bean seed planting and initial observations.',
      order: 6,
      standards: ['Sc1.2-G3', 'Sc8.1-G3', 'Sc8.3-G3'],
    },
    {
      id: 'g3-life-processes-growth',
      title: 'Life Processes - Growth / กระบวนการชีวิต - การเติบโต',
      description: 'How living things grow and change over time with examples from plants and animals.',
      order: 7,
      standards: ['Sc1.2-G3'],
    },
    {
      id: 'g3-life-processes-reproduction',
      title: 'Life Processes - Reproduction / กระบวนการชีวิต - การสืบพันธุ์',
      description: 'How living things make more of their kind with simple examples appropriate for Grade 3.',
      order: 8,
      standards: ['Sc1.2-G3'],
    },
    {
      id: 'g3-comparing-living-things',
      title: 'Comparing Living Things / การเปรียบเทียบสิ่งมีชีวิต',
      description: 'Similarities and differences among organisms and how we group living things by features.',
      order: 9,
      standards: ['Sc1.3-G3'],
    },
  ];

  const lessonsById: Record<string, any> = {};
  for (const lessonData of unit1Lessons) {
    const lesson = await prisma.lesson.upsert({
      where: { id: lessonData.id },
      update: {},
      create: {
        id: lessonData.id,
        title: lessonData.title,
        description: lessonData.description,
        content: `This is placeholder content for ${lessonData.title}. Full lesson content will be added later.`,
        gradeLevel: 3,
        order: lessonData.order,
        standards: {
          connect: lessonData.standards.map(code => ({
            framework_code: {
              framework: 'THAI',
              code,
            }
          })),
        },
      },
    });
    lessonsById[lessonData.id] = lesson;
    console.log(`  ✓ Created lesson: ${lessonData.title.split('/')[0].trim()}`);
  }

  // 4. Seed demo class with curriculum units
  console.log('\n🏫 Seeding demo class...');
  const teacher = users['TEACHER'];

  const demoClass = await prisma.class.upsert({
    where: { joinCode: 'DEMO3T' },
    update: {},
    create: {
      name: 'Grade 3 Science (Thai Standards)',
      gradeLevel: 3,
      standardsAlignment: 'THAI',
      joinCode: 'DEMO3T',
      teacherId: teacher.id,
    },
  });
  console.log(`  ✓ Created class: ${demoClass.name} (Join code: ${demoClass.joinCode})`);

  // 5. Create CurriculumUnit for Unit 1
  console.log('\n📚 Creating curriculum unit...');
  const unit1 = await prisma.curriculumUnit.upsert({
    where: { id: `${demoClass.id}_unit_1` },
    update: {},
    create: {
      id: `${demoClass.id}_unit_1`,
      title: 'Unit 1: Introduction to Science & Living Things / หน่วยที่ 1: บทนำสู่วิทยาศาสตร์และสิ่งมีชีวิต',
      description: 'Explore what science is and learn about living things and their characteristics.',
      framework: 'THAI',
      gradeLevel: 3,
      order: 1,
      classId: demoClass.id,
      lessons: {
        connect: unit1Lessons.map(l => ({ id: l.id })),
      },
    },
  });
  console.log(`  ✓ Created curriculum unit: Unit 1`);

  // 6. Enroll demo student in class
  const student = users['STUDENT'];
  await prisma.class.update({
    where: { id: demoClass.id },
    data: {
      students: {
        connect: { id: student.id },
      },
    },
  });
  console.log(`  ✓ Enrolled demo student in ${demoClass.name}`);

  console.log('\n✅ Seed completed successfully!\n');
  console.log('📝 Demo Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Username: student_demo | Password: Password123!');
  console.log('Username: teacher_demo | Password: Password123!');
  console.log('Username: admin_demo   | Password: Password123!');
  console.log('Username: system_demo  | Password: Password123!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('🏫 Demo Class:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Grade 3 (Thai) - Join code: DEMO3T');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
