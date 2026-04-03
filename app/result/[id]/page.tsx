import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranscription } from "@/lib/actions/general.action";
import dayjs from "dayjs";
import Navbar from "@/components/Navbar";
import DownloadReportButton from "@/components/DownloadReportButton";

/* ────────────── helpers ────────────── */
function getGradeColor(grade: string) {
    const g = grade?.toUpperCase() || "C";
    if (g.startsWith("A")) return { bg: "#16a34a", light: "#dcfce7", border: "#16a34a", ring: "#16a34a" };
    if (g.startsWith("B")) return { bg: "#2563eb", light: "#dbeafe", border: "#2563eb", ring: "#2563eb" };
    if (g.startsWith("C")) return { bg: "#f59e0b", light: "#fef3c7", border: "#f59e0b", ring: "#f59e0b" };
    if (g.startsWith("D")) return { bg: "#ea580c", light: "#ffedd5", border: "#ea580c", ring: "#ea580c" };
    return { bg: "#dc2626", light: "#fee2e2", border: "#dc2626", ring: "#dc2626" };
}


function getGradeFromScore(score: number): string {
    if (score >= 95) return "A+";
    if (score >= 90) return "A";
    if (score >= 85) return "B+";
    if (score >= 80) return "B";
    if (score >= 75) return "C+";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "E";
}

function getGradeLabel(grade: string) {
    const g = grade?.toUpperCase() || "C";
    if (g.startsWith("A")) return "EXCELLENT";
    if (g.startsWith("B")) return "GOOD";
    if (g.startsWith("C")) return "AVERAGE";
    if (g.startsWith("D")) return "BELOW AVG";
    return "POOR";
}

function getLevelColor(level: string) {
    const l = level?.toLowerCase() || "average";
    if (l === "excellent") return { bg: "#dcfce7", text: "#16a34a", border: "#16a34a" };
    if (l === "good") return { bg: "#dbeafe", text: "#2563eb", border: "#2563eb" };
    if (l === "average") return { bg: "#fef3c7", text: "#d97706", border: "#f59e0b" };
    return { bg: "#fee2e2", text: "#dc2626", border: "#dc2626" };
}

function getReadinessLabel(score: number) {
    if (score >= 85) return "Interview Ready";
    if (score >= 65) return "Partially Ready";
    if (score >= 45) return "Needs Improvement";
    return "Not Ready";
}

function getReadinessColor(score: number) {
    if (score >= 85) return "#16a34a";
    if (score >= 65) return "#f59e0b";
    if (score >= 45) return "#ea580c";
    return "#dc2626";
}

/* Circular progress ring */
function ScoreRing({ score, size = 120, stroke = 10, color }: { score: number; size?: number; stroke?: number; color: string }) {
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    return (
        <svg width={size} height={size} className="score-ring">
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
            <circle
                cx={size / 2} cy={size / 2} r={radius} fill="none"
                stroke={color} strokeWidth={stroke} strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={offset}
                style={{ transform: "rotate(-90deg)", transformOrigin: "center", transition: "stroke-dashoffset 1s ease" }}
            />
            <text x="50%" y="46%" textAnchor="middle" dominantBaseline="central" className="text-3xl font-black" fill="#1a1a1a" style={{ fontSize: "32px", fontWeight: 900 }}>
                {score}
            </text>
            <text x="50%" y="64%" textAnchor="middle" dominantBaseline="central" fill="#999" style={{ fontSize: "11px" }}>
                {score} / 100
            </text>
        </svg>
    );
}

/* ────────────── page ────────────── */
const ResultPage = async ({ params }: RouteParams) => {
    const { id } = await params;
    const data = await getTranscription(id);

    if (!data) redirect("/");

    const assessment = data.assessment;
    const score = assessment?.score ?? 0;
    const grade = assessment?.grade || (assessment ? getGradeFromScore(score) : "C");
    const gradeColor = getGradeColor(grade);
    const gradeLabel = getGradeLabel(grade);
    const totalFindings = assessment?.questionBreakdown?.length || 0;
    const readinessLabel = getReadinessLabel(score);
    const readinessColor = getReadinessColor(score);

    return (
        <div className="min-h-screen relative bg-[#f5f0e8] noise-bg">
            <Navbar />

            <div className="max-w-7xl mx-auto px-16 pt-32 pb-16 relative z-10 max-sm:px-4 max-sm:pt-24">
                {/* ━━━ Page Header ━━━ */}
                <div className="flex flex-col items-center gap-4 mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#16a34a]/10 border border-[#16a34a]/30 rounded-md">
                        <span className="w-2 h-2 rounded-full bg-[#16a34a]"></span>
                        <span className="font-mono-accent text-[#16a34a] text-xs">Performance Analysis</span>
                    </div>
                    <h1 className="text-5xl font-bold text-[#1a1a1a] tracking-tight leading-tight max-sm:text-4xl">
                        Interview <span className="text-[#16a34a]">Report</span>
                    </h1>
                </div>

                {assessment && (
                    <>
                        {/* ━━━ ROW 1 — INTERVIEW REPORT CARD ━━━ */}
                        <div className="bg-white rounded-xl border border-[#1a1a1a]/15 card-lift mb-6 overflow-hidden">
                            {/* Meta bar */}
                            <div className="flex items-center justify-between px-6 py-3 border-b border-[#1a1a1a]/10">
                                <p className="text-[10px] font-mono-accent text-[#6b6b6b] tracking-widest">INTERVIEW REPORT CARD</p>
                                <div className="flex items-center gap-3 text-[10px] font-mono-accent text-[#999]">
                                    {data.position && <span className="flex items-center gap-1">📋 <strong className="text-[#1a1a1a]">{data.position}</strong></span>}
                                    {data.interviewType && <span>• {data.interviewType}</span>}
                                    {data.completedAt && <span>• {dayjs(data.completedAt).format("MMM D, YYYY, h:mm A")}</span>}
                                </div>
                            </div>

                            {/* Card body — 2 columns */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-[#1a1a1a]/10">
                                {/* Col 1: Grade + Feedback */}
                                <div className="p-6 flex items-start gap-5">
                                    <div className="flex flex-col items-center flex-shrink-0">
                                        <div
                                            className="w-[88px] h-[88px] rounded-xl flex items-center justify-center border-[3px]"
                                            style={{ backgroundColor: gradeColor.light, borderColor: gradeColor.border }}
                                        >
                                            <span className="text-5xl font-black leading-none" style={{ color: gradeColor.bg }}>
                                                {grade}
                                            </span>
                                        </div>
                                        <span className="mt-2 text-[9px] font-mono-accent font-bold tracking-widest" style={{ color: gradeColor.bg }}>
                                            {gradeLabel}
                                        </span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-lg font-bold text-[#1a1a1a] leading-tight mb-0.5">
                                            {score >= 85 ? "Excellent" : score >= 65 ? "Good Performance" : score >= 45 ? "Needs" : "Needs"}
                                            {score < 85 && score >= 45 && <br />}
                                            {score >= 85 ? " Performance" : score >= 65 ? "" :
                                                <span style={{ color: gradeColor.bg }}> Improvement</span>}
                                        </h3>
                                        <p className="text-[12px] text-[#6b6b6b] leading-relaxed mt-2 line-clamp-5">
                                            {assessment.feedback}
                                        </p>
                                    </div>
                                </div>

                                {/* Col 2: Circular Score */}
                                <div className="p-6 flex flex-col items-center justify-center">
                                    <ScoreRing score={score} color={gradeColor.ring} />
                                    <p className="mt-3 text-sm font-bold" style={{ color: readinessColor }}>
                                        {readinessLabel}
                                    </p>
                                    <div className="flex items-center gap-3 mt-2 text-[10px] font-mono-accent text-[#999]">
                                        {data.completedAt && <span>⏱ {dayjs(data.completedAt).format("h:mm A")}</span>}
                                        <span>• {score} / 100</span>
                                        {totalFindings > 0 && <span>• {totalFindings} Qs</span>}
                                    </div>
                                </div>
                            </div>
                        </div>


                        {/* ━━━ ROW 2 — Strengths/Weaknesses + Final Verdict ━━━ */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            {/* Strengths vs Weaknesses */}
                            <div className="bg-white rounded-xl border border-[#1a1a1a]/15 card-lift p-6">
                                <h3 className="text-base font-bold text-[#1a1a1a] mb-5">Strengths vs Weaknesses</h3>

                                {/* Strengths */}
                                <div className="mb-5">
                                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white bg-[#16a34a] px-3 py-1 rounded-md mb-3">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        Strengths
                                    </span>
                                    <ul className="space-y-2 mt-2" style={{ listStyle: "none" }}>
                                        {assessment.strengths?.map((s: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2 text-[13px] text-[#1a1a1a] leading-snug">
                                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#16a34a] flex-shrink-0" />
                                                {s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Weaknesses */}
                                <div>
                                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white bg-[#ea580c] px-3 py-1 rounded-md mb-3">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                        Weaknesses
                                    </span>
                                    <ul className="space-y-2 mt-2" style={{ listStyle: "none" }}>
                                        {assessment.areasForImprovement?.map((a: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2 text-[13px] text-[#1a1a1a] leading-snug">
                                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#ea580c] flex-shrink-0" />
                                                {a}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Final Verdict */}
                            <div className="bg-white rounded-xl border border-[#1a1a1a]/15 card-lift p-6">
                                <h3 className="text-base font-bold text-[#1a1a1a] mb-5">Final Verdict</h3>

                                {/* Hire recommendation */}
                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: score >= 70 ? "#16a34a" : "#dc2626" }} />
                                        <span className="text-sm font-bold" style={{ color: score >= 70 ? "#16a34a" : "#dc2626" }}>
                                            {score >= 85 ? "Strong Hire" : score >= 70 ? "Lean Hire" : score >= 50 ? "Lean No Hire" : "No Hire"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: readinessColor }} />
                                        <span className="text-sm font-bold" style={{ color: readinessColor }}>
                                            {readinessLabel}
                                        </span>
                                    </div>
                                </div>

                                {/* Score bar */}
                                <div className="mb-6">
                                    <div className="flex justify-between text-[10px] font-mono-accent text-[#999] mb-1.5">
                                        <span>OVERALL SCORE</span>
                                        <span>{score}/100</span>
                                    </div>
                                    <div className="h-2.5 bg-[#f3f4f6] rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all"
                                            style={{ width: `${score}%`, backgroundColor: gradeColor.bg }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ━━━ ROW 3 — Question-wise Analysis (collapsible) ━━━ */}
                        {assessment.questionBreakdown && assessment.questionBreakdown.length > 0 && (
                            <details className="bg-white rounded-xl border border-[#1a1a1a]/15 group mb-6 overflow-hidden">
                                <summary className="px-6 py-4 cursor-pointer flex items-center justify-between hover:bg-[#fafaf8] transition-colors">
                                    <span className="flex items-center gap-3">
                                        <svg className="w-4 h-4 text-[#2563eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                        <span className="text-sm font-bold text-[#1a1a1a]">Question-wise Analysis</span>
                                        <span className="text-[10px] font-mono-accent text-[#999]">{assessment.questionBreakdown.length} QUESTIONS</span>
                                    </span>
                                    <svg className="w-4 h-4 text-[#6b6b6b] transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </summary>

                                {/* Table header */}
                                <div className="grid grid-cols-12 px-6 py-2.5 bg-[#fafaf8] border-y border-[#1a1a1a]/10 text-[10px] font-mono-accent text-[#999] tracking-wider">
                                    <div className="col-span-5">Question</div>
                                    <div className="col-span-4">AI Evaluation</div>
                                    <div className="col-span-3">Score</div>
                                </div>

                                {/* Questions */}
                                <div className="divide-y divide-[#1a1a1a]/10">
                                    {assessment.questionBreakdown.map((q: { question: string; score: number; level: string; feedback: string }, i: number) => {
                                        const qc = getLevelColor(q.level);
                                        return (
                                            <div key={i} className="grid grid-cols-12 px-6 py-4 items-start gap-3 hover:bg-[#fafaf8] transition-colors">
                                                <div className="col-span-5">
                                                    <span className="text-[10px] font-mono-accent text-[#bbb] block mb-1">Question {i + 1}</span>
                                                    <p className="text-[13px] font-semibold text-[#1a1a1a] leading-snug">{q.question}</p>
                                                </div>
                                                <div className="col-span-4">
                                                    <div className="flex items-start gap-1.5">
                                                        <span className="mt-0.5 w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: qc.border }} />
                                                        <p className="text-[12px] text-[#6b6b6b] leading-snug">{q.feedback}</p>
                                                    </div>
                                                </div>
                                                <div className="col-span-3 flex items-center gap-2">
                                                    <div
                                                        className="w-10 h-10 rounded-lg flex flex-col items-center justify-center border-2"
                                                        style={{ borderColor: qc.border, backgroundColor: qc.bg + "40" }}
                                                    >
                                                        <span className="text-sm font-black" style={{ color: qc.text }}>{q.score}</span>
                                                    </div>
                                                    <span
                                                        className="text-[9px] font-mono-accent font-bold px-2 py-0.5 rounded"
                                                        style={{ backgroundColor: qc.bg, color: qc.text }}
                                                    >
                                                        {q.level?.toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </details>
                        )}

                        {/* ━━━ INTERVIEW RECORDING ━━━ */}
                        {data.recordingUrl && (
                            <details className="bg-white rounded-xl border border-[#1a1a1a]/15 group mb-6 overflow-hidden" open>
                                <summary className="px-6 py-4 cursor-pointer flex items-center justify-between hover:bg-[#fafaf8] transition-colors">
                                    <span className="flex items-center gap-3">
                                        <svg className="w-4 h-4 text-[#dc2626]" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" fill="white" /></svg>
                                        <span className="text-sm font-bold text-[#1a1a1a]">Your Interview Recording</span>
                                        <span className="text-[10px] font-mono-accent text-[#999]">VIDEO + AUDIO</span>
                                    </span>
                                    <svg className="w-4 h-4 text-[#6b6b6b] transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </summary>
                                <div className="px-6 py-5 border-t border-[#1a1a1a]/10">
                                    <video
                                        controls
                                        className="w-full rounded-xl border border-[#1a1a1a]/10"
                                        style={{ maxHeight: "500px", backgroundColor: "#000" }}
                                    >
                                        <source src={data.recordingUrl} type="video/webm" />
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                            </details>
                        )}

                        {/* ━━━ TRANSCRIPT — collapsible bottom bar ━━━ */}
                        <details className="bg-white rounded-xl border border-[#1a1a1a]/15 group mb-6 overflow-hidden">
                            <summary className="px-6 py-4 cursor-pointer flex items-center justify-between hover:bg-[#fafaf8] transition-colors">
                                <span className="flex items-center gap-3">
                                    <svg className="w-4 h-4 text-[#16a34a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                                    <span className="text-sm font-bold text-[#1a1a1a]">View Full Transcript</span>
                                    <span className="text-[10px] font-mono-accent text-[#999]">{data.transcript.length} MESSAGES</span>
                                </span>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-3 text-[10px] font-mono-accent text-[#999]">
                                        <span className="flex items-center gap-1">📎 Full Interview</span>
                                        <span className="flex items-center gap-1">📝 Transcript</span>
                                    </div>
                                    <svg className="w-4 h-4 text-[#6b6b6b] transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </summary>

                            <div className="px-6 py-5 border-t border-[#1a1a1a]/10 space-y-4">
                                {data.transcript.map((entry: any, index: number) => {
                                    const isAI = entry.role === "assistant";
                                    return (
                                        <div key={index} className={`flex gap-3 ${isAI ? "" : "flex-row-reverse"}`}>
                                            <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${isAI ? "bg-[#16a34a]/10 border border-[#16a34a]/20" : "bg-[#1a1a1a]"}`}>
                                                {isAI ? (
                                                    <svg className="w-4 h-4 text-[#16a34a]" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
                                                        <circle cx="9" cy="10" r="1.5" /><circle cx="15" cy="10" r="1.5" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div className={`max-w-[75%] ${isAI ? "" : "text-right"}`}>
                                                <p className="text-[10px] font-mono-accent text-[#999] mb-1">{isAI ? "AI Interviewer" : "You"}</p>
                                                <div className={`rounded-xl px-4 py-3 border ${isAI ? "bg-white border-[#1a1a1a]/10 rounded-tl-sm" : "bg-[#1a1a1a] text-white border-[#1a1a1a] rounded-tr-sm"}`}>
                                                    <p className={`text-[13px] leading-relaxed ${isAI ? "text-[#1a1a1a]" : "text-white"}`}>{entry.content}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </details>
                    </>
                )}

                {/* ━━━ FOOTER CTA ━━━ */}
                <div className="flex items-center justify-center gap-4 pt-6 pb-8 flex-wrap">
                    <Link href="/setup" className="px-8 py-3 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold rounded-full transition-all transform hover:scale-[1.02] text-sm flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        Start New Interview
                    </Link>
                    {assessment && (
                        <DownloadReportButton
                            reportData={{
                                score: assessment?.score ?? 0,
                                grade: assessment?.grade || getGradeFromScore(assessment?.score ?? 0),
                                gradeLabel: getGradeLabel(assessment?.grade || getGradeFromScore(assessment?.score ?? 0)),
                                feedback: assessment?.feedback || "",
                                strengths: assessment?.strengths || [],
                                areasForImprovement: assessment?.areasForImprovement || [],
                                questionBreakdown: assessment?.questionBreakdown || [],
                                position: data?.position,
                                interviewType: data?.interviewType,
                                completedAt: data?.completedAt,
                            }}
                        />
                    )}
                    <Link href="/" className="px-8 py-3 bg-white hover:bg-[#f3f4f6] text-[#1a1a1a] font-bold rounded-full transition-all border border-[#1a1a1a] text-sm transform hover:scale-[1.02]">
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ResultPage;
