import { PrismaClient, ExamType } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals: number = 1): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateQuestionTypes() {
  const mc = randomInt(20, 60);
  const tf = randomInt(10, Math.min(40, 100 - mc));
  const oe = 100 - mc - tf;
  return { "Multiple Choice": mc, "Classic/Open-ended": oe, "True/False": tf };
}

function generateTopicDistribution() {
  const allTopics = [
    "Data Structures", "Algorithms", "OOP", "Database Design",
    "Networking", "Operating Systems", "Machine Learning", "Linear Algebra",
    "Calculus", "Statistics", "Software Engineering", "Computer Architecture",
    "Discrete Mathematics", "Web Development", "Cybersecurity", "AI",
  ];
  const numTopics = randomInt(4, 6);
  const topics = allTopics.sort(() => Math.random() - 0.5).slice(0, numTopics);
  const dist: Record<string, number> = {};
  let remaining = 100;
  for (let i = 0; i < topics.length; i++) {
    if (i === topics.length - 1) {
      dist[topics[i]] = remaining;
    } else {
      const share = randomInt(10, Math.min(40, remaining - (topics.length - i - 1) * 5));
      dist[topics[i]] = share;
      remaining -= share;
    }
  }
  return dist;
}

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.examAnalysis.deleteMany();
  await prisma.professorRating.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.course.deleteMany();
  await prisma.professor.deleteMany();
  await prisma.user.deleteMany();

  // Create 3 users
  const hashedPassword = await bcrypt.hash("password123", 10);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: "alice@university.edu",
        password: hashedPassword,
        name: "Alice Johnson",
        university: "MIT",
        department: "Computer Science",
      },
    }),
    prisma.user.create({
      data: {
        email: "bob@university.edu",
        password: hashedPassword,
        name: "Bob Smith",
        university: "Stanford",
        department: "Electrical Engineering",
      },
    }),
    prisma.user.create({
      data: {
        email: "charlie@university.edu",
        password: hashedPassword,
        name: "Charlie Brown",
        university: "MIT",
        department: "Mathematics",
      },
    }),
  ]);

  console.log(`Created ${users.length} users`);

  // Create 10 professors
  const professorData = [
    { name: "Dr. Sarah Chen", department: "Computer Science", university: "MIT" },
    { name: "Dr. James Wilson", department: "Mathematics", university: "Stanford" },
    { name: "Dr. Maria Garcia", department: "Computer Science", university: "MIT" },
    { name: "Dr. Robert Taylor", department: "Electrical Engineering", university: "Stanford" },
    { name: "Dr. Emily Davis", department: "Computer Science", university: "Harvard" },
    { name: "Dr. Michael Brown", department: "Mathematics", university: "MIT" },
    { name: "Dr. Lisa Anderson", department: "Data Science", university: "Stanford" },
    { name: "Dr. David Martinez", department: "Computer Science", university: "Harvard" },
    { name: "Dr. Jennifer Lee", department: "Electrical Engineering", university: "MIT" },
    { name: "Dr. William Thompson", department: "Mathematics", university: "Harvard" },
  ];

  const professors = await Promise.all(
    professorData.map((p) => prisma.professor.create({ data: p }))
  );

  console.log(`Created ${professors.length} professors`);

  // Create 20 courses
  const courseNames = [
    { name: "Introduction to Algorithms", code: "CS101" },
    { name: "Data Structures", code: "CS102" },
    { name: "Database Systems", code: "CS201" },
    { name: "Operating Systems", code: "CS301" },
    { name: "Machine Learning", code: "CS401" },
    { name: "Linear Algebra", code: "MATH201" },
    { name: "Calculus I", code: "MATH101" },
    { name: "Calculus II", code: "MATH102" },
    { name: "Discrete Mathematics", code: "MATH301" },
    { name: "Probability and Statistics", code: "MATH401" },
    { name: "Computer Networks", code: "CS302" },
    { name: "Software Engineering", code: "CS303" },
    { name: "Artificial Intelligence", code: "CS402" },
    { name: "Computer Architecture", code: "CS304" },
    { name: "Cybersecurity", code: "CS403" },
    { name: "Web Development", code: "CS202" },
    { name: "Digital Signal Processing", code: "EE301" },
    { name: "Control Systems", code: "EE302" },
    { name: "Deep Learning", code: "CS501" },
    { name: "Natural Language Processing", code: "CS502" },
  ];

  const courses = await Promise.all(
    courseNames.map((c, i) =>
      prisma.course.create({
        data: {
          name: c.name,
          code: c.code,
          professorId: professors[i % professors.length].id,
        },
      })
    )
  );

  console.log(`Created ${courses.length} courses`);

  // Create 30 exams with analyses
  const examTypes: ExamType[] = ["MIDTERM", "FINAL", "MAKEUP"];
  const semesters = ["Fall", "Spring", "Summer"];
  const years = [2022, 2023, 2024, 2025];

  const exams = [];
  for (let i = 0; i < 30; i++) {
    const course = courses[i % courses.length];
    const exam = await prisma.exam.create({
      data: {
        courseId: course.id,
        examType: randomElement(examTypes),
        year: randomElement(years),
        semester: randomElement(semesters),
        fileUrl: `/uploads/sample-exam-${i + 1}.pdf`,
        uploadedById: randomElement(users).id,
      },
    });

    const questionCount = randomInt(10, 30);
    const questionTypes = generateQuestionTypes();
    const topicDistribution = generateTopicDistribution();
    const difficultyScore = randomFloat(3.0, 9.0);

    const dominantType = Object.entries(questionTypes).sort(
      (a, b) => b[1] - a[1]
    )[0][0];
    const diffLabel =
      difficultyScore <= 4
        ? "relatively easy"
        : difficultyScore <= 6
        ? "moderately difficult"
        : difficultyScore <= 7.5
        ? "challenging"
        : "very difficult";

    const summary = `This exam contains ${questionCount} questions and is rated as ${diffLabel} with a difficulty score of ${difficultyScore}/10. The exam primarily consists of ${dominantType} questions.`;

    await prisma.examAnalysis.create({
      data: {
        examId: exam.id,
        questionCount,
        questionTypes,
        topicDistribution,
        difficultyScore,
        summary,
      },
    });

    exams.push(exam);
  }

  console.log(`Created ${exams.length} exams with analyses`);

  // Create 50 ratings
  const comments = [
    "Very fair exams, well-structured questions.",
    "Exams are tough but fair. Study the textbook thoroughly.",
    "Questions are tricky, need to understand concepts deeply.",
    "Great professor, exams match the lecture content.",
    "Difficult exams but good learning experience.",
    "Easy exams if you attend all lectures.",
    "Very challenging, requires extra preparation.",
    "Well-balanced difficulty level.",
    "Exams are straightforward, no surprises.",
    "Tough grader but fair exam questions.",
    null,
    null,
  ];

  for (let i = 0; i < 50; i++) {
    await prisma.professorRating.create({
      data: {
        professorId: professors[i % professors.length].id,
        userId: users[i % users.length].id,
        difficultyScore: randomInt(1, 5),
        fairnessScore: randomInt(1, 5),
        comment: randomElement(comments),
      },
    });
  }

  console.log("Created 50 ratings");
  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
