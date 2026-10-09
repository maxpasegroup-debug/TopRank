import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { getEnv } from "../src/server/env";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: getEnv().DATABASE_URL }),
});

const exams = [
  { code: "NEET", name: "National Eligibility cum Entrance Test" },
  { code: "JEE_MAIN", name: "JEE Main" },
  { code: "JEE_ADVANCED", name: "JEE Advanced" },
  { code: "KEAM", name: "Kerala Engineering Architecture Medical" },
  { code: "CUET", name: "Common University Entrance Test" },
];

const subjects = [
  { code: "PHYSICS", slug: "physics", name: "Physics" },
  { code: "CHEMISTRY", slug: "chemistry", name: "Chemistry" },
  { code: "BIOLOGY", slug: "biology", name: "Biology" },
  { code: "MATHEMATICS", slug: "mathematics", name: "Mathematics" },
  { code: "GENERAL_TEST", slug: "general-test", name: "General Test" },
];

const examSubjects: Record<string, string[]> = {
  NEET: ["PHYSICS", "CHEMISTRY", "BIOLOGY"],
  JEE_MAIN: ["PHYSICS", "CHEMISTRY", "MATHEMATICS"],
  JEE_ADVANCED: ["PHYSICS", "CHEMISTRY", "MATHEMATICS"],
  KEAM: ["PHYSICS", "CHEMISTRY", "MATHEMATICS"],
  CUET: ["GENERAL_TEST"],
};

type ChapterSeed = {
  title: string;
  slug: string;
  summary: string;
  lessons: { title: string; slug: string; summary: string }[];
};

type QuestionSeed = {
  code: string;
  text: string;
  type: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "NUMERICAL";
  difficulty: "EASY" | "MEDIUM" | "HARD";
  subjectCode: string;
  chapterSlug: string;
  lessonSlug?: string;
  options: { code: string; text: string; isCorrect: boolean }[];
  exams: string[];
  explanation: string;
  source: string;
  tags: string[];
};

const chapterSeed: Record<string, ChapterSeed[]> = {
  PHYSICS: [
    { title: "Units and Measurements", slug: "units-and-measurements", summary: "Measurement systems, units, errors, and dimensional analysis.", lessons: [{ title: "SI Units and Dimensions", slug: "si-units-and-dimensions", summary: "Understand base units, derived units, and dimensional formulas." }] },
    { title: "Motion in a Straight Line", slug: "motion-in-a-straight-line", summary: "Position, displacement, velocity, acceleration, and graphs.", lessons: [{ title: "Distance and Displacement", slug: "distance-and-displacement", summary: "Compare path length with shortest change in position." }] },
    { title: "Motion in a Plane", slug: "motion-in-a-plane", summary: "Vectors, projectile motion, and two-dimensional kinematics.", lessons: [{ title: "Vectors in Plane Motion", slug: "vectors-in-plane-motion", summary: "Resolve vectors and apply them to plane motion." }] },
    { title: "Laws of Motion", slug: "laws-of-motion", summary: "Newton's laws, friction, and circular motion basics.", lessons: [{ title: "Newton's Laws", slug: "newtons-laws", summary: "Apply Newton's laws to entrance-style force problems." }] },
  ],
  CHEMISTRY: [
    { title: "Some Basic Concepts of Chemistry", slug: "some-basic-concepts-of-chemistry", summary: "Mole concept, concentration terms, and stoichiometry.", lessons: [{ title: "Mole Concept Basics", slug: "mole-concept-basics", summary: "Use moles and molar mass in calculation-based questions." }] },
    { title: "Structure of Atom", slug: "structure-of-atom", summary: "Atomic models, quantum numbers, and electronic configuration.", lessons: [{ title: "Atomic Models", slug: "atomic-models", summary: "Trace the development of atomic structure ideas." }] },
    { title: "Classification of Elements", slug: "classification-of-elements", summary: "Periodic trends and classification of elements.", lessons: [{ title: "Periodic Trends", slug: "periodic-trends", summary: "Learn radius, ionization energy, and electronegativity trends." }] },
    { title: "Chemical Bonding", slug: "chemical-bonding", summary: "Ionic, covalent, and coordinate bonds with VSEPR basics.", lessons: [{ title: "Ionic and Covalent Bonds", slug: "ionic-and-covalent-bonds", summary: "Identify bonding patterns in entrance questions." }] },
  ],
  BIOLOGY: [
    { title: "The Living World", slug: "the-living-world", summary: "Diversity, taxonomy, nomenclature, and classification basics.", lessons: [{ title: "Taxonomy Basics", slug: "taxonomy-basics", summary: "Understand taxonomic hierarchy and naming systems." }] },
    { title: "Biological Classification", slug: "biological-classification", summary: "Kingdom systems and major organism groups.", lessons: [{ title: "Five Kingdom Classification", slug: "five-kingdom-classification", summary: "Differentiate Monera, Protista, Fungi, Plantae, and Animalia." }] },
    { title: "Plant Kingdom", slug: "plant-kingdom", summary: "Algae, bryophytes, pteridophytes, gymnosperms, and angiosperms.", lessons: [{ title: "Major Plant Groups", slug: "major-plant-groups", summary: "Compare plant groups using entrance-relevant traits." }] },
    { title: "Animal Kingdom", slug: "animal-kingdom", summary: "Animal classification and distinguishing features.", lessons: [{ title: "Animal Classification", slug: "animal-classification", summary: "Use body plans and symmetry to classify animal groups." }] },
  ],
  MATHEMATICS: [
    { title: "Sets", slug: "sets", summary: "Set notation, operations, Venn diagrams, and applications.", lessons: [{ title: "Set Operations", slug: "set-operations", summary: "Apply union, intersection, and complement rules." }] },
    { title: "Relations and Functions", slug: "relations-and-functions", summary: "Relations, functions, domain, range, and composition.", lessons: [{ title: "Domain and Range", slug: "domain-and-range", summary: "Find valid input and output sets for common functions." }] },
    { title: "Quadratic Equations", slug: "quadratic-equations", summary: "Roots, discriminant, and equation transformations.", lessons: [{ title: "Nature of Roots", slug: "nature-of-roots", summary: "Use the discriminant to analyze quadratic roots." }] },
    { title: "Sequence and Series", slug: "sequence-and-series", summary: "Arithmetic and geometric progressions.", lessons: [{ title: "Arithmetic Progression", slug: "arithmetic-progression", summary: "Find nth terms and sums for AP problems." }] },
  ],
  GENERAL_TEST: [
    { title: "Quantitative Aptitude", slug: "quantitative-aptitude", summary: "Core numerical aptitude for CUET-style preparation.", lessons: [{ title: "Number Systems", slug: "number-systems", summary: "Revise integers, factors, multiples, and divisibility." }] },
    { title: "Logical Reasoning", slug: "logical-reasoning", summary: "Reasoning patterns and analytical thinking.", lessons: [{ title: "Series Reasoning", slug: "series-reasoning", summary: "Identify number and alphabet series patterns." }] },
    { title: "General Awareness", slug: "general-awareness", summary: "Static awareness foundations for entrance readiness.", lessons: [{ title: "India at a Glance", slug: "india-at-a-glance", summary: "Review basic civic and geographic facts." }] },
    { title: "Language Skills", slug: "language-skills", summary: "Comprehension and vocabulary basics.", lessons: [{ title: "Reading Comprehension Basics", slug: "reading-comprehension-basics", summary: "Practice main idea and inference skills." }] },
  ],
};

const questionSeed: QuestionSeed[] = [
  {
    code: "FND-PHY-MSL-001",
    text: "A student walks 3 m east and then 4 m north. What is the magnitude of displacement?",
    type: "SINGLE_CHOICE",
    difficulty: "EASY",
    subjectCode: "PHYSICS",
    chapterSlug: "motion-in-a-straight-line",
    lessonSlug: "distance-and-displacement",
    options: [
      { code: "A", text: "1 m", isCorrect: false },
      { code: "B", text: "5 m", isCorrect: true },
      { code: "C", text: "7 m", isCorrect: false },
      { code: "D", text: "12 m", isCorrect: false },
    ],
    exams: ["NEET", "JEE_MAIN", "KEAM"],
    explanation: "The displacement is the straight-line resultant of perpendicular components: sqrt(3^2 + 4^2) = 5 m.",
    source: "TopRank foundation seed",
    tags: ["kinematics", "vectors"],
  },
  {
    code: "FND-CHE-MOL-001",
    text: "How many moles are present in 18 g of water? Use molar mass of water as 18 g/mol.",
    type: "NUMERICAL",
    difficulty: "EASY",
    subjectCode: "CHEMISTRY",
    chapterSlug: "some-basic-concepts-of-chemistry",
    lessonSlug: "mole-concept-basics",
    options: [{ code: "NUMERIC", text: "1", isCorrect: true }],
    exams: ["NEET", "JEE_MAIN", "JEE_ADVANCED", "KEAM"],
    explanation: "Moles = given mass / molar mass = 18 / 18 = 1.",
    source: "TopRank foundation seed",
    tags: ["mole-concept"],
  },
  {
    code: "FND-BIO-TAX-001",
    text: "Which taxonomic rank comes immediately below family?",
    type: "SINGLE_CHOICE",
    difficulty: "MEDIUM",
    subjectCode: "BIOLOGY",
    chapterSlug: "the-living-world",
    lessonSlug: "taxonomy-basics",
    options: [
      { code: "A", text: "Order", isCorrect: false },
      { code: "B", text: "Genus", isCorrect: true },
      { code: "C", text: "Class", isCorrect: false },
      { code: "D", text: "Phylum", isCorrect: false },
    ],
    exams: ["NEET"],
    explanation: "The hierarchy around family is order, family, genus, species.",
    source: "TopRank foundation seed",
    tags: ["taxonomy"],
  },
  {
    code: "FND-MAT-SET-001",
    text: "For sets A and B, which expression represents elements common to both sets?",
    type: "SINGLE_CHOICE",
    difficulty: "EASY",
    subjectCode: "MATHEMATICS",
    chapterSlug: "sets",
    lessonSlug: "set-operations",
    options: [
      { code: "A", text: "A union B", isCorrect: false },
      { code: "B", text: "A intersection B", isCorrect: true },
      { code: "C", text: "A complement", isCorrect: false },
      { code: "D", text: "B complement", isCorrect: false },
    ],
    exams: ["JEE_MAIN", "JEE_ADVANCED", "KEAM"],
    explanation: "The intersection contains elements that belong to both sets.",
    source: "TopRank foundation seed",
    tags: ["sets"],
  },
  {
    code: "FND-CUET-QA-001",
    text: "Which of the following are factors of 12?",
    type: "MULTIPLE_CHOICE",
    difficulty: "EASY",
    subjectCode: "GENERAL_TEST",
    chapterSlug: "quantitative-aptitude",
    lessonSlug: "number-systems",
    options: [
      { code: "A", text: "2", isCorrect: true },
      { code: "B", text: "3", isCorrect: true },
      { code: "C", text: "5", isCorrect: false },
      { code: "D", text: "6", isCorrect: true },
    ],
    exams: ["CUET"],
    explanation: "2, 3, and 6 divide 12 exactly; 5 does not.",
    source: "TopRank foundation seed",
    tags: ["number-systems"],
  },
  {
    code: "FND-PHY-LAW-001",
    text: "When no net external force acts on a body, which quantity remains constant?",
    type: "SINGLE_CHOICE",
    difficulty: "MEDIUM",
    subjectCode: "PHYSICS",
    chapterSlug: "laws-of-motion",
    lessonSlug: "newtons-laws",
    options: [
      { code: "A", text: "Velocity", isCorrect: true },
      { code: "B", text: "Acceleration", isCorrect: false },
      { code: "C", text: "Force", isCorrect: false },
      { code: "D", text: "Mass always doubles", isCorrect: false },
    ],
    exams: ["NEET", "JEE_MAIN", "JEE_ADVANCED"],
    explanation: "By Newton's first law, velocity remains constant when net external force is zero.",
    source: "TopRank foundation seed",
    tags: ["newtons-laws"],
  },
];

async function main() {
  const examByCode = new Map<string, { id: string }>();
  const subjectByCode = new Map<string, { id: string; slug: string }>();

  for (const exam of exams) {
    const record = await prisma.exam.upsert({
      where: { code: exam.code },
      update: { name: exam.name, status: "PUBLISHED", active: true },
      create: { ...exam, status: "PUBLISHED", active: true },
    });
    examByCode.set(exam.code, { id: record.id });
  }

  await prisma.exam.updateMany({
    where: { code: "JEE" },
    data: { status: "ARCHIVED", active: false },
  });

  for (const subject of subjects) {
    const record = await prisma.subject.upsert({
      where: { slug: subject.slug },
      update: { code: subject.code, name: subject.name, status: "PUBLISHED", active: true },
      create: { ...subject, status: "PUBLISHED", active: true },
    });
    subjectByCode.set(subject.code, { id: record.id, slug: record.slug });
  }

  for (const [examCode, subjectCodes] of Object.entries(examSubjects)) {
    const exam = examByCode.get(examCode);
    if (!exam) continue;

    for (const [index, subjectCode] of subjectCodes.entries()) {
      const subject = subjectByCode.get(subjectCode);
      if (!subject) continue;

      await prisma.examSubject.upsert({
        where: { examId_subjectId: { examId: exam.id, subjectId: subject.id } },
        update: { order: index + 1, status: "PUBLISHED", active: true },
        create: { examId: exam.id, subjectId: subject.id, order: index + 1, status: "PUBLISHED", active: true },
      });
    }
  }

  for (const [subjectCode, chapters] of Object.entries(chapterSeed)) {
    const subject = subjectByCode.get(subjectCode);
    if (!subject) continue;

    for (const [chapterIndex, chapter] of chapters.entries()) {
      const chapterRecord = await prisma.chapter.upsert({
        where: { subjectId_slug: { subjectId: subject.id, slug: chapter.slug } },
        update: { title: chapter.title, summary: chapter.summary, order: chapterIndex + 1, status: "PUBLISHED", active: true },
        create: { subjectId: subject.id, title: chapter.title, slug: chapter.slug, summary: chapter.summary, order: chapterIndex + 1, status: "PUBLISHED", active: true },
      });

      for (const [lessonIndex, lesson] of chapter.lessons.entries()) {
        const lessonRecord = await prisma.lesson.upsert({
          where: { chapterId_slug: { chapterId: chapterRecord.id, slug: lesson.slug } },
          update: { title: lesson.title, summary: lesson.summary, order: lessonIndex + 1, status: "PUBLISHED", active: true },
          create: { chapterId: chapterRecord.id, title: lesson.title, slug: lesson.slug, summary: lesson.summary, order: lessonIndex + 1, status: "PUBLISHED", active: true },
        });

        await prisma.learningResource.upsert({
          where: { lessonId_slug: { lessonId: lessonRecord.id, slug: "foundation-notes" } },
          update: {
            title: `${lesson.title} Foundation Notes`,
            type: "NOTES",
            reference: "Seeded TopRank foundation content. Replace with reviewed production material before public launch.",
            order: 1,
            status: "PUBLISHED",
            active: true,
          },
          create: {
            lessonId: lessonRecord.id,
            title: `${lesson.title} Foundation Notes`,
            slug: "foundation-notes",
            type: "NOTES",
            reference: "Seeded TopRank foundation content. Replace with reviewed production material before public launch.",
            order: 1,
            status: "PUBLISHED",
            active: true,
          },
        });
      }
    }
  }

  for (const item of questionSeed) {
    const subject = subjectByCode.get(item.subjectCode);
    if (!subject) continue;

    const chapter = await prisma.chapter.findUnique({
      where: { subjectId_slug: { subjectId: subject.id, slug: item.chapterSlug } },
    });
    if (!chapter) continue;

    const lesson = item.lessonSlug
      ? await prisma.lesson.findUnique({
          where: { chapterId_slug: { chapterId: chapter.id, slug: item.lessonSlug } },
        })
      : null;

    const question = await prisma.question.upsert({
      where: { code: item.code },
      update: {
        text: item.text,
        type: item.type,
        difficulty: item.difficulty,
        subjectId: subject.id,
        chapterId: chapter.id,
        lessonId: lesson?.id,
        explanation: item.explanation,
        source: item.source,
        language: "en",
        reviewStatus: "REVIEWED",
        tags: item.tags,
        status: "PUBLISHED",
        active: true,
      },
      create: {
        code: item.code,
        text: item.text,
        type: item.type,
        difficulty: item.difficulty,
        subjectId: subject.id,
        chapterId: chapter.id,
        lessonId: lesson?.id,
        explanation: item.explanation,
        source: item.source,
        language: "en",
        reviewStatus: "REVIEWED",
        tags: item.tags,
        status: "PUBLISHED",
        active: true,
      },
    });

    for (const [index, option] of item.options.entries()) {
      await prisma.questionOption.upsert({
        where: { questionId_code: { questionId: question.id, code: option.code } },
        update: { text: option.text, order: index + 1, isCorrect: option.isCorrect, active: true },
        create: { questionId: question.id, code: option.code, text: option.text, order: index + 1, isCorrect: option.isCorrect, active: true },
      });
    }

    for (const examCode of item.exams) {
      const exam = examByCode.get(examCode);
      if (!exam) continue;

      await prisma.questionExam.upsert({
        where: { questionId_examId: { questionId: question.id, examId: exam.id } },
        update: { status: "PUBLISHED", active: true, marks: 4, negativeMarks: 1 },
        create: { questionId: question.id, examId: exam.id, status: "PUBLISHED", active: true, marks: 4, negativeMarks: 1 },
      });
    }
  }
}

main().finally(async () => {
  await prisma.$disconnect();
});
