interface QuestionTypes {
  "Multiple Choice": number;
  "Classic/Open-ended": number;
  "True/False": number;
}

interface TopicDistribution {
  [topic: string]: number;
}

interface AnalysisResult {
  questionCount: number;
  questionTypes: QuestionTypes;
  topicDistribution: TopicDistribution;
  difficultyScore: number;
  summary: string;
}

const SAMPLE_TOPICS = [
  "Data Structures",
  "Algorithms",
  "Object-Oriented Programming",
  "Database Design",
  "Networking",
  "Operating Systems",
  "Machine Learning",
  "Linear Algebra",
  "Calculus",
  "Statistics",
  "Software Engineering",
  "Computer Architecture",
  "Discrete Mathematics",
  "Web Development",
  "Cybersecurity",
  "Artificial Intelligence",
  "Graph Theory",
  "Probability",
  "Signal Processing",
  "Control Systems",
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals: number = 1): number {
  const val = Math.random() * (max - min) + min;
  return parseFloat(val.toFixed(decimals));
}

function generateQuestionTypes(): QuestionTypes {
  const mc = randomInt(20, 60);
  const tf = randomInt(10, Math.min(40, 100 - mc));
  const oe = 100 - mc - tf;

  return {
    "Multiple Choice": mc,
    "Classic/Open-ended": oe,
    "True/False": tf,
  };
}

function generateTopicDistribution(): TopicDistribution {
  const numTopics = randomInt(4, 6);
  const shuffled = [...SAMPLE_TOPICS].sort(() => Math.random() - 0.5);
  const selectedTopics = shuffled.slice(0, numTopics);

  const distribution: TopicDistribution = {};
  let remaining = 100;

  for (let i = 0; i < selectedTopics.length; i++) {
    if (i === selectedTopics.length - 1) {
      distribution[selectedTopics[i]] = remaining;
    } else {
      const maxShare = remaining - (selectedTopics.length - i - 1) * 5;
      const share = randomInt(10, Math.min(40, maxShare));
      distribution[selectedTopics[i]] = share;
      remaining -= share;
    }
  }

  return distribution;
}

function generateSummary(
  questionCount: number,
  questionTypes: QuestionTypes,
  difficultyScore: number,
  topicDistribution: TopicDistribution
): string {
  const difficultyLabel =
    difficultyScore <= 4.0
      ? "relatively easy"
      : difficultyScore <= 6.0
      ? "moderately difficult"
      : difficultyScore <= 7.5
      ? "challenging"
      : "very difficult";

  const topTopics = Object.entries(topicDistribution)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([topic]) => topic);

  const dominantType = Object.entries(questionTypes).sort(
    (a, b) => b[1] - a[1]
  )[0][0];

  return (
    `This exam contains ${questionCount} questions and is rated as ${difficultyLabel} ` +
    `with a difficulty score of ${difficultyScore}/10. ` +
    `The exam primarily consists of ${dominantType} questions (${questionTypes[dominantType as keyof QuestionTypes]}%). ` +
    `Key topics covered include ${topTopics.join(", ")}. ` +
    `Students should focus on these areas and practice ${dominantType.toLowerCase()} format questions ` +
    `to prepare effectively for this exam style.`
  );
}

export async function analyzeExam(_fileUrl: string): Promise<AnalysisResult> {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const questionCount = randomInt(10, 30);
  const questionTypes = generateQuestionTypes();
  const topicDistribution = generateTopicDistribution();
  const difficultyScore = randomFloat(3.0, 9.0);
  const summary = generateSummary(
    questionCount,
    questionTypes,
    difficultyScore,
    topicDistribution
  );

  return {
    questionCount,
    questionTypes,
    topicDistribution,
    difficultyScore,
    summary,
  };
}
