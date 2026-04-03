interface InterviewSession {
  id: string;
  position: string;
  experienceLevel: string;
  queryList: string[];
  technicalStack: string[];
  createdAt: string;
  userId: string;
  interviewType: string;
  isCompleted: boolean;
  transcript?: { role: string; content: string }[];
  completedAt?: string;
  assessment?: {
    score: number;
    grade?: string;
    feedback: string;
    strengths: string[];
    areasForImprovement: string[];
    categoryScores?: {
      category: string;
      score: number;
      level: string;
    }[];
    questionBreakdown?: {
      question: string;
      score: number;
      level: string;
      feedback: string;
    }[];
  };
  // Setup context fields
  targetRole?: string;
  companyType?: string;
  codingRound?: boolean;
  preferredLanguage?: string;
  recordInterview?: boolean;
  recordingUrl?: string;
  difficulty?: string;
  detectedSkills?: string[];
  keyTechnologies?: string[];
  profileLinks?: { platform: string; label: string; url: string }[];
  resumeText?: string;
}

interface VoiceAgentProps {
  candidateName: string;
  userId?: string;
  sessionId?: string;
  mode: "generate" | "interview";
  queryList?: string[];
  // Setup context for AI prompt
  setupContext?: {
    targetRole?: string;
    companyType?: string;
    interviewType?: string;
    codingRound?: boolean;
    preferredLanguage?: string;
    recordInterview?: boolean;
    difficulty?: string;
    detectedSkills?: string[];
    keyTechnologies?: string[];
    experienceLevel?: string;
    resumeText?: string;
  };
}

interface RouteParams {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string>>;
}

interface TechnologyIconProps {
  technicalStack: string[];
}
