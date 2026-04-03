"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { aiInterviewerConfig } from "@/constants";
import { saveTranscription, saveRecordingUrl } from "@/lib/actions/general.action";
import CodeEditor from "@/components/CodeEditor";

enum ConnectionState {
  IDLE = "IDLE",
  ESTABLISHING = "ESTABLISHING",
  CONNECTED = "CONNECTED",
  TERMINATED = "TERMINATED",
}

interface DialogEntry {
  role: "user" | "system" | "assistant";
  content: string;
}

const VoiceInterviewer = ({
  candidateName,
  userId,
  sessionId,
  mode,
  queryList,
  setupContext,
  autoStart = false,
}: VoiceAgentProps & { autoStart?: boolean }) => {
  const navigation = useRouter();
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.IDLE);
  const [dialogHistory, setDialogHistory] = useState<DialogEntry[]>([]);
  const dialogHistoryRef = useRef<DialogEntry[]>([]);
  const [agentSpeaking, setAgentSpeaking] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<string>("");
  const [userTranscript, setUserTranscript] = useState<string>("");
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isProcessingResults, setIsProcessingResults] = useState(false);

  const isCodingRound = setupContext?.codingRound === true;
  const isRecordingEnabled = setupContext?.recordInterview === true;

  // Recording refs and state
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const handleConnectionEstablished = () => {
      console.log("VAPI: Call started successfully!");
      setConnectionState(ConnectionState.CONNECTED);
      setStartTime(Date.now());

      // Start recording if enabled
      if (isRecordingEnabled) {
        startRecording();
      }
    };

    const handleConnectionClosed = () => {
      console.log("VAPI: Call ended");
      setConnectionState(ConnectionState.TERMINATED);
      setStartTime(null);
      setElapsedTime(0);
    };

    const handleIncomingMessage = (msg: Message) => {
      console.log("VAPI Message received:", msg.type, msg);
      if (msg.type === "transcript") {
        if (msg.role === "user") {
          if (msg.transcriptType === "partial") {
            setUserTranscript(msg.transcript);
          } else if (msg.transcriptType === "final") {
            setUserTranscript(msg.transcript);
            const dialogEntry = { role: msg.role, content: msg.transcript };
            setDialogHistory((previous) => [...previous, dialogEntry]);
          }
        } else {
          if (msg.transcriptType === "final") {
            const dialogEntry = { role: msg.role, content: msg.transcript };
            setDialogHistory((previous) => [...previous, dialogEntry]);
          }
        }
      }
    };

    const handleAgentSpeechStart = () => {
      setAgentSpeaking(true);
    };

    const handleAgentSpeechEnd = () => {
      setAgentSpeaking(false);
    };

    const handleConnectionError = (err: any) => {
      console.error("VAPI Connection error:", err);
      console.error("=== VAPI ERROR DETAILS ===");
      console.error("Full error JSON:", JSON.stringify(err, null, 2));
      console.error("Action:", err?.action);
      console.error("Error Message:", err?.errorMsg);
      console.error("Error:", err?.error);
      console.error("Call Client ID:", err?.callClientId);
      alert(`VAPI Error: ${err?.errorMsg || err?.error || err?.message || JSON.stringify(err)}`);
    };

    vapi.on("call-start", handleConnectionEstablished);
    vapi.on("call-end", handleConnectionClosed);
    vapi.on("message", handleIncomingMessage);
    vapi.on("speech-start", handleAgentSpeechStart);
    vapi.on("speech-end", handleAgentSpeechEnd);
    vapi.on("error", handleConnectionError);

    return () => {
      vapi.off("call-start", handleConnectionEstablished);
      vapi.off("call-end", handleConnectionClosed);
      vapi.off("message", handleIncomingMessage);
      vapi.off("speech-start", handleAgentSpeechStart);
      vapi.off("speech-end", handleAgentSpeechEnd);
      vapi.off("error", handleConnectionError);
    };
  }, []);

  useEffect(() => {
    dialogHistoryRef.current = dialogHistory;
    if (dialogHistory.length > 0) {
      setCurrentMessage(dialogHistory[dialogHistory.length - 1].content);
    }

    // Only auto-navigate for non-interview modes (generate)
    if (connectionState === ConnectionState.TERMINATED && mode !== "interview") {
      setTimeout(() => {
        navigation.push("/interview");
      }, 1000);
    }
  }, [dialogHistory, connectionState, navigation]);

  useEffect(() => {
    if (autoStart && connectionState === ConnectionState.IDLE) {
      const startInterview = async () => {
        setConnectionState(ConnectionState.ESTABLISHING);
        if (mode === "generate") {
          await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
            variableValues: {
              username: candidateName,
              userid: userId,
            },
          });
        } else {
          let structuredQueries = "";
          if (queryList) {
            structuredQueries = queryList
              .map((query) => `- ${query}`)
              .join("\n");
          }
          await vapi.start(aiInterviewerConfig, {
            variableValues: {
              questions: structuredQueries,
              target_role: setupContext?.targetRole || "",
              company_type: setupContext?.companyType || "",
              interview_type: setupContext?.interviewType || "",
              coding_round: setupContext?.codingRound ? "Yes" : "No",
              difficulty: setupContext?.difficulty || "Adaptive",
              resume: [
                setupContext?.resumeText ? `Resume Content: ${setupContext.resumeText}` : "",
                setupContext?.detectedSkills?.length ? `Skills: ${setupContext.detectedSkills.join(", ")}` : "",
                setupContext?.keyTechnologies?.length ? `Key Technologies: ${setupContext.keyTechnologies.join(", ")}` : "",
                setupContext?.experienceLevel ? `Experience Level: ${setupContext.experienceLevel}` : "",
              ].filter(Boolean).join("\n"),
            },
          });
        }
      };
      startInterview();
    }
  }, [autoStart, connectionState, mode, candidateName, userId, queryList, setupContext]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (startTime && connectionState === ConnectionState.CONNECTED) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [startTime, connectionState]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const initiateConnection = async () => {
    setConnectionState(ConnectionState.ESTABLISHING);

    try {
      if (mode === "generate") {
        console.log("Starting with workflow ID:", process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID);
        await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
          variableValues: {
            username: candidateName,
            userid: userId,
          },
        });
      } else {
        let structuredQueries = "";
        if (queryList) {
          structuredQueries = queryList
            .map((query) => `- ${query}`)
            .join("\n");
        }

        console.log("Starting with aiInterviewerConfig");
        console.log("Mode:", mode);
        console.log("Questions:", structuredQueries);
        console.log("Setup Context:", setupContext);

        await vapi.start(aiInterviewerConfig, {
          variableValues: {
            questions: structuredQueries,
            target_role: setupContext?.targetRole || "",
            company_type: setupContext?.companyType || "",
            interview_type: setupContext?.interviewType || "",
            coding_round: setupContext?.codingRound ? "Yes" : "No",
            difficulty: setupContext?.difficulty || "Adaptive",
            resume: [
              setupContext?.resumeText ? `Resume Content: ${setupContext.resumeText}` : "",
              setupContext?.detectedSkills?.length ? `Skills: ${setupContext.detectedSkills.join(", ")}` : "",
              setupContext?.keyTechnologies?.length ? `Key Technologies: ${setupContext.keyTechnologies.join(", ")}` : "",
              setupContext?.experienceLevel ? `Experience Level: ${setupContext.experienceLevel}` : "",
            ].filter(Boolean).join("\n"),
          },
        });
      }
      console.log("vapi.start completed");
    } catch (error) {
      console.error("VAPI START ERROR:", error);
      setConnectionState(ConnectionState.IDLE);
    }
  };

  const terminateConnection = async () => {
    setConnectionState(ConnectionState.TERMINATED);
    setIsProcessingResults(true); // Show processing indicator
    vapi.stop();

    // Stop recording if active
    let recordingUrl = "";
    if (isRecordingEnabled && mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      recordingUrl = await stopAndUploadRecording();
    }

    // Clean up camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Save transcription to Firestore and THEN navigate to result
    const currentDialog = dialogHistoryRef.current;
    if (mode === "interview" && sessionId) {
      try {
        if (currentDialog.length > 0) {
          await saveTranscription(sessionId, currentDialog, setupContext);
        }
      } catch (error) {
        console.error("Failed to save transcription:", error);
      }
      // Navigate to result page regardless
      navigation.push(`/result/${sessionId}`);
    }
  };

  // --- Recording functions ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;

      // Show camera preview
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9,opus",
      });
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(1000); // Capture in 1-second chunks
      setIsRecording(true);
      console.log("Recording started");
    } catch (error) {
      console.error("Failed to start recording:", error);
      alert("Camera/microphone access denied. Recording will not be available.");
    }
  };

  const stopAndUploadRecording = (): Promise<string> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === "inactive") {
        resolve("");
        return;
      }

      recorder.onstop = async () => {
        setIsRecording(false);
        setIsUploading(true);

        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        console.log("Recording blob size:", blob.size);

        try {
          const formData = new FormData();
          formData.append("recording", blob, `${sessionId}.webm`);
          formData.append("sessionId", sessionId || "unknown");

          const response = await fetch("/api/upload-recording", {
            method: "POST",
            body: formData,
          });

          const result = await response.json();
          if (result.success && sessionId) {
            await saveRecordingUrl(sessionId, result.recordingUrl);
            console.log("Recording saved:", result.recordingUrl);
            resolve(result.recordingUrl);
          } else {
            console.error("Upload failed:", result.error);
            resolve("");
          }
        } catch (error) {
          console.error("Failed to upload recording:", error);
          resolve("");
        } finally {
          setIsUploading(false);
        }
      };

      recorder.stop();
    });
  };

  const latestAssistantMessage = dialogHistory
    .filter(entry => entry.role === "assistant")
    .slice(-1)[0]?.content || "";

  const latestUserMessage = dialogHistory
    .filter(entry => entry.role === "user")
    .slice(-1)[0]?.content || "";

  // Interview conversation panels (shared between coding and non-coding layouts)
  const interviewPanels = (
    <>
      {/* AI Interviewer Panel */}
      <div className={cn(
        "bg-white rounded-xl p-6 border border-[#1a1a1a]/15 flex flex-col card-lift",
        isCodingRound ? "flex-1" : "min-h-[150px] p-8"
      )}>
        <div className={cn("flex items-center gap-3", isCodingRound ? "mb-2" : "mb-4")}>
          <div className="relative">
            <div className={cn(
              "bg-[#16a34a]/10 border border-[#16a34a]/20 rounded-lg flex items-center justify-center",
              isCodingRound ? "w-10 h-10" : "w-12 h-12"
            )}>
              <svg className={cn("text-[#16a34a]", isCodingRound ? "w-5 h-5" : "w-6 h-6")} fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
                <circle cx="9" cy="10" r="1.5" />
                <circle cx="15" cy="10" r="1.5" />
              </svg>
            </div>
            {agentSpeaking && (
              <span className={cn(
                "absolute inset-0 rounded-lg border-2 border-[#16a34a] animate-ping",
                isCodingRound ? "w-10 h-10" : "w-12 h-12"
              )} />
            )}
          </div>
          <div>
            <h3 className={cn("font-bold text-[#1a1a1a]", isCodingRound ? "text-base" : "text-lg")}>AI Interviewer</h3>
            <p className="text-xs font-mono-accent text-[#6b6b6b]">Evalve Agent</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          {connectionState === "CONNECTED" ? (
            <div className="space-y-3">
              <p className="text-[#6b6b6b] text-sm font-mono-accent">
                {agentSpeaking ? "● Speaking..." : "○ Listening..."}
              </p>
              {latestAssistantMessage && (
                <div className="bg-[#f5f0e8] rounded-lg p-3 border border-[#1a1a1a]/10">
                  <p className={cn("text-[#1a1a1a] leading-relaxed", isCodingRound ? "text-xs" : "text-sm")}>{latestAssistantMessage}</p>
                  <div className="text-right mt-1.5 text-xs text-[#999] font-mono-accent">{formatTime(elapsedTime)}</div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-[#999] text-sm font-mono-accent">Waiting to start...</p>
          )}
        </div>
      </div>

      {/* User Panel */}
      <div className={cn(
        "bg-white rounded-xl p-6 border border-[#1a1a1a]/15 flex flex-col card-lift",
        isCodingRound ? "flex-1" : "min-h-[300px] p-8"
      )}>
        <div className={cn("flex items-center gap-3", isCodingRound ? "mb-2" : "mb-4")}>
          <div className={cn(
            "bg-[#1a1a1a] rounded-lg flex items-center justify-center",
            isCodingRound ? "w-10 h-10" : "w-12 h-12"
          )}>
            <svg className={cn("text-white", isCodingRound ? "w-5 h-5" : "w-6 h-6")} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          <div>
            <h3 className={cn("font-bold text-[#1a1a1a]", isCodingRound ? "text-base" : "text-lg")}>You</h3>
            <p className="text-xs font-mono-accent text-[#6b6b6b]">Candidate</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          {connectionState === "CONNECTED" ? (
            <div className="space-y-3">
              <p className="text-[#6b6b6b] text-sm font-mono-accent">
                {userTranscript ? "● Speaking..." : "○ Start voice response..."}
              </p>
              {(userTranscript || latestUserMessage) && (
                <div className="bg-[#f5f0e8] rounded-lg p-3 border border-[#1a1a1a]/10">
                  <p className={cn("text-[#1a1a1a] leading-relaxed", isCodingRound ? "text-xs" : "text-sm")}>{userTranscript || latestUserMessage}</p>
                  <div className="text-right mt-1.5 text-xs text-[#999] font-mono-accent">{formatTime(elapsedTime)}</div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-[#999] text-sm font-mono-accent">Ready to respond...</p>
          )}
        </div>
      </div>
    </>
  );

  // Call-to-action buttons
  const actionButtons = (
    <div className={cn("flex flex-col items-center", isCodingRound ? "space-y-4" : "space-y-6")}>
      {isProcessingResults ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-[#16a34a] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-mono-accent text-[#6b6b6b]">Processing your results...</span>
        </div>
      ) : connectionState !== "CONNECTED" ? (
        <button
          className={cn(
            "group relative bg-[#16a34a] hover:bg-[#15803d] text-white font-bold rounded-md transition-all transform hover:scale-[1.02] flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed",
            isCodingRound ? "px-6 py-3 text-sm" : "px-10 py-4 text-base"
          )}
          onClick={() => initiateConnection()}
          disabled={connectionState === "ESTABLISHING"}
        >
          <span className={cn(
            connectionState === "ESTABLISHING" && "opacity-0"
          )}>
            {connectionState === "IDLE" || connectionState === "TERMINATED"
              ? "Start Interview"
              : "Connecting"}
          </span>
          {connectionState === "IDLE" || connectionState === "TERMINATED" ? (
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          ) : (
            <div className={cn(
              "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-1",
              connectionState !== "ESTABLISHING" && "hidden"
            )}>
              <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          )}
        </button>
      ) : (
        <button
          className={cn(
            "bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold rounded-md transition-all transform hover:scale-[1.02]",
            isCodingRound ? "px-6 py-3 text-sm" : "px-10 py-4 text-base"
          )}
          onClick={() => terminateConnection()}
        >
          End Interview
        </button>
      )}
    </div>
  );

  // === CODING ROUND LAYOUT (split view) ===
  if (isCodingRound) {
    return (
      <div className="w-full flex flex-col items-center space-y-6">
        <div className="flex w-full max-w-[1400px] gap-5" style={{ height: "calc(100vh - 140px)" }}>
          {/* Left: Interview Panels */}
          <div className="w-[400px] shrink-0 flex flex-col gap-4 pr-1 h-full">
            {interviewPanels}
            <div className="shrink-0 py-3">
              {actionButtons}
            </div>
          </div>

          {/* Right: Code Editor */}
          <div className="flex-1 min-w-0">
            <CodeEditor preferredLanguage={setupContext?.preferredLanguage} />
          </div>
        </div>
      </div>
    );
  }

  // === DEFAULT LAYOUT (no coding round) ===
  return (
    <div className="w-full flex flex-col items-center space-y-8">
      {/* Two Panels Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl">
        {interviewPanels}
      </div>

      {/* Call to Action */}
      {actionButtons}

      {/* Camera Preview (recording mode) */}
      {isRecordingEnabled && connectionState === "CONNECTED" && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="relative rounded-xl overflow-hidden border-2 border-[#1a1a1a]/20 shadow-2xl bg-black" style={{ width: 200, height: 150 }}>
            <video
              ref={videoPreviewRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
              style={{ transform: "scaleX(-1)" }}
            />
            {isRecording && (
              <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 bg-[#dc2626] rounded-md">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                <span className="text-[10px] font-bold text-white font-mono">REC</span>
              </div>
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs text-white font-bold">Uploading...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default VoiceInterviewer;
