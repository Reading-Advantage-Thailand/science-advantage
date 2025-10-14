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
      gradeLevel: 6,
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

  // 2. Seed curriculum templates (lessons and standards)
  console.log('\n📚 Seeding curriculum data...');

  // Define curriculum structure: Grade → Standard → Units → Lessons
  const curriculumData = [
    {
      grade: 3,
      framework: 'THAI' as StandardsAlignment,
      units: [
        {
          title: 'Living Things and Their Environment',
          titleTH: 'สิ่งมีชีวิตและสิ่งแวดล้อม',
          description: 'Explore plants, animals, and their habitats',
          lessons: [
            { title: 'Parts of Plants', titleTH: 'ส่วนต่าง ๆ ของพืช' },
            { title: 'Animal Habitats', titleTH: 'ที่อยู่อาศัยของสัตว์' },
            { title: 'Food Chains', titleTH: 'ห่วงโซ่อาหาร' },
          ],
        },
        {
          title: 'Matter and Materials',
          titleTH: 'สสารและวัสดุ',
          description: 'Learn about properties of materials',
          lessons: [
            { title: 'Solids, Liquids, and Gases', titleTH: 'ของแข็ง ของเหลว และก๊าซ' },
            { title: 'Changing Materials', titleTH: 'การเปลี่ยนแปลงของวัสดุ' },
          ],
        },
      ],
    },
    {
      grade: 4,
      framework: 'THAI' as StandardsAlignment,
      units: [
        {
          title: 'Energy and Force',
          titleTH: 'พลังงานและแรง',
          description: 'Understand energy transformations and forces',
          lessons: [
            { title: 'Types of Energy', titleTH: 'ประเภทของพลังงาน' },
            { title: 'Push and Pull', titleTH: 'แรงดันและแรงดึง' },
            { title: 'Simple Machines', titleTH: 'เครื่องจักรกลง่าย ๆ' },
          ],
        },
        {
          title: 'Earth and Space',
          titleTH: 'โลกและอวกาศ',
          description: 'Explore the Earth, moon, and solar system',
          lessons: [
            { title: 'Day and Night', titleTH: 'กลางวันและกลางคืน' },
            { title: 'The Moon', titleTH: 'ดวงจันทร์' },
          ],
        },
      ],
    },
    {
      grade: 5,
      framework: 'THAI' as StandardsAlignment,
      units: [
        {
          title: 'Human Body Systems',
          titleTH: 'ระบบในร่างกายมนุษย์',
          description: 'Learn about major body systems',
          lessons: [
            { title: 'Digestive System', titleTH: 'ระบบย่อยอาหาร' },
            { title: 'Circulatory System', titleTH: 'ระบบไหลเวียนเลือด' },
            { title: 'Respiratory System', titleTH: 'ระบบหายใจ' },
          ],
        },
        {
          title: 'Ecosystems',
          titleTH: 'ระบบนิเวศ',
          description: 'Study interactions in ecosystems',
          lessons: [
            { title: 'Producers and Consumers', titleTH: 'ผู้ผลิตและผู้บริโภค' },
            { title: 'Decomposers', titleTH: 'ผู้ย่อยสลาย' },
          ],
        },
      ],
    },
    {
      grade: 6,
      framework: 'THAI' as StandardsAlignment,
      units: [
        {
          title: 'Chemical Reactions',
          titleTH: 'ปฏิกิริยาเคมี',
          description: 'Introduction to chemical changes',
          lessons: [
            { title: 'Physical vs Chemical Changes', titleTH: 'การเปลี่ยนแปลงทางกายภาพและเคมี' },
            { title: 'Acids and Bases', titleTH: 'กรดและเบส' },
            { title: 'Combustion', titleTH: 'การเผาไหม้' },
          ],
        },
        {
          title: 'Electricity and Magnetism',
          titleTH: 'ไฟฟ้าและแม่เหล็ก',
          description: 'Explore electrical circuits and magnets',
          lessons: [
            { title: 'Electric Circuits', titleTH: 'วงจรไฟฟ้า' },
            { title: 'Magnets', titleTH: 'แม่เหล็ก' },
          ],
        },
      ],
    },
    {
      grade: 3,
      framework: 'NGSS' as StandardsAlignment,
      units: [
        {
          title: 'Weather and Climate',
          titleTH: 'สภาพอากาศและภูมิอากาศ',
          description: 'Study weather patterns and climate',
          lessons: [
            { title: 'Weather vs Climate', titleTH: 'สภาพอากาศกับภูมิอากาศ' },
            { title: 'Measuring Weather', titleTH: 'การวัดสภาพอากาศ' },
            { title: 'Climate Zones', titleTH: 'เขตภูมิอากาศ' },
          ],
        },
      ],
    },
    {
      grade: 4,
      framework: 'NGSS' as StandardsAlignment,
      units: [
        {
          title: 'Energy Transfer',
          titleTH: 'การถ่ายเทพลังงาน',
          description: 'Learn how energy moves and transforms',
          lessons: [
            { title: 'Energy in Motion', titleTH: 'พลังงานในการเคลื่อนที่' },
            { title: 'Heat Transfer', titleTH: 'การถ่ายเทความร้อน' },
            { title: 'Light and Sound', titleTH: 'แสงและเสียง' },
          ],
        },
      ],
    },
    {
      grade: 5,
      framework: 'NGSS' as StandardsAlignment,
      units: [
        {
          title: 'Structure and Properties of Matter',
          titleTH: 'โครงสร้างและคุณสมบัติของสสาร',
          description: 'Investigate matter at the particle level',
          lessons: [
            { title: 'Atoms and Molecules', titleTH: 'อะตอมและโมเลกุล' },
            { title: 'Mixtures and Solutions', titleTH: 'สารผสมและสารละลาย' },
          ],
        },
      ],
    },
    {
      grade: 6,
      framework: 'NGSS' as StandardsAlignment,
      units: [
        {
          title: 'Cells and Organisms',
          titleTH: 'เซลล์และสิ่งมีชีวิต',
          description: 'Study cells as the building blocks of life',
          lessons: [
            { title: 'Cell Structure', titleTH: 'โครงสร้างเซลล์' },
            { title: 'Cell Functions', titleTH: 'หน้าที่ของเซลล์' },
            { title: 'Photosynthesis', titleTH: 'การสังเคราะห์แสง' },
          ],
        },
      ],
    },
  ];

  const lessonsByKey: Record<string, any> = {};
  for (const curriculumItem of curriculumData) {
    for (let unitIdx = 0; unitIdx < curriculumItem.units.length; unitIdx++) {
      const unitData = curriculumItem.units[unitIdx];
      for (let lessonIdx = 0; lessonIdx < unitData.lessons.length; lessonIdx++) {
        const lessonData = unitData.lessons[lessonIdx];
        const lessonKey = `${curriculumItem.grade}_${curriculumItem.framework}_${unitIdx}_${lessonIdx}`;

        const lesson = await prisma.lesson.upsert({
          where: { id: lessonKey },
          update: {},
          create: {
            id: lessonKey,
            title: `${lessonData.title} / ${lessonData.titleTH}`,
            description: `Learn about ${lessonData.title.toLowerCase()} in grade ${curriculumItem.grade}`,
            content: `This is placeholder content for ${lessonData.title}. Full lesson content will be added later.`,
            gradeLevel: curriculumItem.grade,
            order: lessonIdx + 1,
          },
        });
        lessonsByKey[lessonKey] = lesson;
      }
    }
  }
  console.log(`  ✓ Created ${Object.keys(lessonsByKey).length} lessons`);

  // 3. Seed demo classes with curriculum units
  console.log('\n🏫 Seeding demo classes...');
  const teacher = users['TEACHER'];

  const demoClasses = [
    {
      name: 'Grade 3 Science (Thai Standards)',
      gradeLevel: 3,
      standardsAlignment: 'THAI' as StandardsAlignment,
      joinCode: 'DEMO3T',
    },
    {
      name: 'Grade 4 Science (Thai Standards)',
      gradeLevel: 4,
      standardsAlignment: 'THAI' as StandardsAlignment,
      joinCode: 'DEMO4T',
    },
    {
      name: 'Grade 6 Science (NGSS)',
      gradeLevel: 6,
      standardsAlignment: 'NGSS' as StandardsAlignment,
      joinCode: 'DEMO6N',
    },
  ];

  for (const classData of demoClasses) {
    const cls = await prisma.class.upsert({
      where: { joinCode: classData.joinCode },
      update: {},
      create: {
        ...classData,
        teacherId: teacher.id,
      },
    });

    // Find curriculum units for this grade/framework and create them for the class
    const matchingCurriculum = curriculumData.filter(
      (c) => c.grade === classData.gradeLevel && c.framework === classData.standardsAlignment
    );

    for (const curriculumItem of matchingCurriculum) {
      for (let unitIdx = 0; unitIdx < curriculumItem.units.length; unitIdx++) {
        const unitData = curriculumItem.units[unitIdx];
        const unitKey = `${cls.id}_unit_${unitIdx}`;

        // Collect lesson IDs for this unit
        const lessonIds = unitData.lessons.map((_, lessonIdx) => {
          return `${curriculumItem.grade}_${curriculumItem.framework}_${unitIdx}_${lessonIdx}`;
        });

        await prisma.curriculumUnit.upsert({
          where: { id: unitKey },
          update: {},
          create: {
            id: unitKey,
            title: `${unitData.title} / ${unitData.titleTH}`,
            description: unitData.description,
            framework: classData.standardsAlignment,
            gradeLevel: classData.gradeLevel,
            order: unitIdx + 1,
            classId: cls.id,
            lessons: {
              connect: lessonIds.map((id) => ({ id })),
            },
          },
        });
      }
    }

    console.log(`  ✓ Created class: ${classData.name} (Join code: ${classData.joinCode})`);
  }

  // 4. Enroll demo student in one class
  const student = users['STUDENT'];
  const demoClass = await prisma.class.findUnique({
    where: { joinCode: 'DEMO6N' },
  });
  if (demoClass) {
    await prisma.class.update({
      where: { id: demoClass.id },
      data: {
        students: {
          connect: { id: student.id },
        },
      },
    });
    console.log(`  ✓ Enrolled demo student in ${demoClass.name}`);
  }

  console.log('\n✅ Seed completed successfully!\n');
  console.log('📝 Demo Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Username: student_demo | Password: Password123!');
  console.log('Username: teacher_demo | Password: Password123!');
  console.log('Username: admin_demo   | Password: Password123!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('🏫 Demo Classes:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Grade 3 (Thai) - Join code: DEMO3T');
  console.log('Grade 4 (Thai) - Join code: DEMO4T');
  console.log('Grade 6 (NGSS) - Join code: DEMO6N');
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
