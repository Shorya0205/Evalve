"use client";

import { useState, useEffect } from "react";
import VoiceInterviewer from "@/components/Agent";
import Navbar from "@/components/Navbar";

export default function InterviewPage() {
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);

  useEffect(() => {
    document.body.style.overflowY = "hidden";
    return () => {
      document.body.style.overflowY = "auto";
    };
  }, []);

  return (
    <div className="relative bg-[#f5f0e8] noise-bg flex flex-col" style={{ overflowY: "hidden", height: "100vh" }}>
      <Navbar />

      {/* Main Content — fills all remaining space */}
      <div className="flex-1 flex items-center justify-center px-16 py-6 relative z-10">
        <div className="w-full max-w-6xl">
          <VoiceInterviewer
            candidateName="Guest User"
            userId="guest"
            mode="generate"
            autoStart={isInterviewStarted}
          />
        </div>
      </div>
    </div>
  );
}
