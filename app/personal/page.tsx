"use client";

import Link from "next/link";
import { useState } from "react";
import VoiceInterviewer from "@/components/Agent";
import Navbar from "@/components/Navbar";

export default function PersonalPage() {
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);

  return (
    <div className="min-h-screen relative bg-[#f5f0e8] noise-bg">
      <Navbar />

      {/* Main Content */}
      <div className="px-16 pt-32 pb-12 max-w-7xl mx-auto relative z-10">
        {/* Title Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-[#1a1a1a] mb-4">
            Evalve <span className="text-[#16a34a]">Mock Interview</span>
          </h1>
          <p className="text-[#6b6b6b] text-sm font-mono-accent mb-1">
            Answer adaptive questions from your AI interview copilot.
          </p>
          <p className="text-[#999] text-xs font-mono-accent">
            Ace your next interview with real-time voice responses.
          </p>
        </div>

        {!isInterviewStarted ? (
          <>
            {/* Two Panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-6xl mx-auto">
              {/* AI Interviewer Panel */}
              <div className="bg-white rounded-xl p-8 border border-[#1a1a1a]/15 card-lift">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-[#16a34a]/10 border border-[#16a34a]/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#16a34a]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
                      <circle cx="9" cy="10" r="1.5" />
                      <circle cx="15" cy="10" r="1.5" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-[#1a1a1a]">AI Interviewer</h3>
                </div>
                <p className="text-[#999] text-sm font-mono-accent">○ Listening...</p>
              </div>

              {/* User Panel */}
              <div className="bg-white rounded-xl p-8 border border-[#1a1a1a]/15 card-lift">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-[#1a1a1a] rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-[#1a1a1a]">You</h3>
                </div>
                <p className="text-[#999] text-sm font-mono-accent mb-4">○ Start voice response...</p>
              </div>
            </div>

            {/* Instructions */}
            <p className="text-center text-[#999] text-xs font-mono-accent mb-8">
              Transcription is auto-captured. Click Start to begin speaking.
            </p>

            {/* Start Button */}
            <div className="text-center">
              <button
                onClick={() => setIsInterviewStarted(true)}
                className="px-10 py-4 bg-[#16a34a] text-white font-bold rounded-md hover:bg-[#15803d] transition-all transform hover:scale-[1.02] flex items-center gap-3 mx-auto"
              >
                Click to Start
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </>
        ) : (
          <div className="max-w-6xl mx-auto">
            <VoiceInterviewer
              candidateName="Guest User"
              userId="guest"
              mode="generate"
            />
          </div>
        )}
      </div>
    </div>
  );
}
