"use server";

import { db } from "@/firebase/admin";
import Groq from "groq-sdk";


export async function createSession(data: {
  targetRole: string;
  companyType: string;
  interviewType: string;
  codingRound: boolean;
  preferredLanguage: string;
  recordInterview: boolean;
  difficulty: string;
  detectedSkills: string[];
  keyTechnologies: string[];
  experienceLevel: string;
  resumeText: string;
  profileLinks: { platform: string; label: string; url: string }[];
}): Promise<string> {
  const sessionRef = await db.collection("sessions").add({
    userId: "guest",
    position: data.targetRole,
    interviewType: data.interviewType,
    technicalStack: [...data.detectedSkills, ...data.keyTechnologies],
    experienceLevel: data.experienceLevel,
    queryList: [],
    isCompleted: false,
    createdAt: new Date().toISOString(),
    // Setup context for AI prompt
    targetRole: data.targetRole,
    companyType: data.companyType,
    codingRound: data.codingRound,
    preferredLanguage: data.preferredLanguage,
    recordInterview: data.recordInterview,
    difficulty: data.difficulty,
    detectedSkills: data.detectedSkills,
    keyTechnologies: data.keyTechnologies,
    resumeText: data.resumeText,
    profileLinks: data.profileLinks,
  });

  return sessionRef.id;
}

export async function getSessionById(id: string): Promise<InterviewSession | null> {
  const sessionDoc = await db.collection("sessions").doc(id).get();

  if (!sessionDoc.exists) return null;

  return { id: sessionDoc.id, ...sessionDoc.data() } as InterviewSession;
}

export async function saveTranscription(
  sessionId: string,
  transcript: { role: string; content: string }[],
  setupContext?: {
    targetRole?: string;
    experienceLevel?: string;
  }
) {
  let assessment = null;
  try {
    if (transcript && transcript.length > 0) {
      assessment = await analyzeTranscript(transcript, setupContext);
    }
  } catch (error) {
    console.error("Failed to analyze transcript:", error);
  }

  await db.collection("sessions").doc(sessionId).update({
    transcript,
    assessment,
    isCompleted: true,
    completedAt: new Date().toISOString(),
  });
}

async function analyzeTranscript(
  transcript: { role: string; content: string }[],
  setupContext?: {
    targetRole?: string;
    experienceLevel?: string;
  }
) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.warn("GROQ_API_KEY is not set. Skipping transcript analysis.");
    return null;
  }

  const groq = new Groq({ apiKey });

  const formattedTranscript = transcript
    .map((entry) => `${entry.role === "assistant" ? "Interviewer" : "Candidate"}: ${entry.content}`)
    .join("\n");

  const prompt = `
    Analyze the following mock interview transcript for the position of ${setupContext?.targetRole || "Software Engineer"} (Experience level: ${setupContext?.experienceLevel || "Not specified"}).
    
    Transcript:
    ${formattedTranscript}

    Evaluate the candidate's performance and provide your assessment strictly in the following JSON format:
    {
      "score": <number between 0 and 100>,
      "grade": "<letter grade: A+, A, B+, B, C+, C, D, or F>",
      "feedback": "<A detailed overall evaluation paragraph, at least 3-4 sentences>",
      "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
      "areasForImprovement": ["<area 1>", "<area 2>", "<area 3>"],
      "categoryScores": [
        { "category": "Technical Knowledge", "score": <0-100>, "level": "<Excellent/Good/Average/Poor>" },
        { "category": "Communication", "score": <0-100>, "level": "<Excellent/Good/Average/Poor>" },
        { "category": "Problem Solving", "score": <0-100>, "level": "<Excellent/Good/Average/Poor>" },
        { "category": "Code Quality", "score": <0-100>, "level": "<Excellent/Good/Average/Poor>" },
        { "category": "Confidence", "score": <0-100>, "level": "<Excellent/Good/Average/Poor>" }
      ],
      "questionBreakdown": [
        {
          "question": "<the interview question that was asked>",
          "score": <0-100>,
          "level": "<Excellent/Good/Average/Poor>",
          "feedback": "<1-2 sentence evaluation of the candidate's answer>"
        }
      ]
    }

    Rules:
    - For categoryScores, rate each of the 5 categories independently based on the transcript.
    - Level mapping: 90-100 = Excellent, 70-89 = Good, 50-69 = Average, 0-49 = Poor.
    - For questionBreakdown, list each distinct question the interviewer asked and evaluate the candidate's response individually.
    - Return ONLY the JSON. No other text.
  `;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert technical interviewer evaluating a candidate's performance. Focus strictly on their answers, tone, and technical accuracy.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const content = chatCompletion.choices[0]?.message?.content;
    if (content) {
      return JSON.parse(content);
    }
    return null;
  } catch (error) {
    console.error("Error calling Groq API:", error);
    return null;
  }
}


export async function getTranscription(sessionId: string) {
  const doc = await db.collection("sessions").doc(sessionId).get();
  if (!doc.exists) return null;
  const data = doc.data();
  return {
    transcript: (data?.transcript || []) as { role: string; content: string }[],
    position: (data?.position || "") as string,
    interviewType: (data?.interviewType || "") as string,
    completedAt: (data?.completedAt || "") as string,
    technicalStack: (data?.technicalStack || []) as string[],
    assessment: data?.assessment || null,
    recordingUrl: (data?.recordingUrl || "") as string,
  };
}

export async function saveRecordingUrl(sessionId: string, recordingUrl: string) {
  await db.collection("sessions").doc(sessionId).update({
    recordingUrl,
  });
}
