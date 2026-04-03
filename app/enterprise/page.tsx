"use client";

import Link from "next/link";
import Image from "next/image";
import { Settings, BarChart3, Layers, Mail } from "lucide-react";
import Navbar from "@/components/Navbar";
import ScrollReveal from "@/components/ScrollReveal";

const solutions = [
  {
    icon: Settings,
    title: "Tailored AI Interviews",
    desc: "Customize question banks to target specific roles, seniority levels, and skillsets for optimal fit.",
  },
  {
    icon: BarChart3,
    title: "Streamline Evaluations",
    desc: "Consistent, bias-free assessments across technical and behavioral domains.",
  },
  {
    icon: Layers,
    title: "Scalable Platform",
    desc: "Efficiently manage interviews at scale with detailed analytics and reporting.",
  },
];

const enterpriseStats = [
  { value: "92%", label: "Candidate Match Rate" },
  { value: "1,000+", label: "Interviews Managed" },
  { value: "1-Week", label: "Implementation Time" },
  { value: "20%", label: "Hiring Time Reduction" },
];

const pricingPlans = [
  {
    name: "Starter",
    price: "$499",
    period: "/month",
    popular: false,
    features: [
      "Up to 50 interviews/month",
      "Basic analytics",
      "Email support",
      "Standard question banks",
      "Limited Usage of Integrated IDE",
    ],
    buttonStyle: "border-2 border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white",
    buttonText: "Get Started",
  },
  {
    name: "Professional",
    price: "$1,499",
    period: "/month",
    popular: true,
    features: [
      "Up to 200 interviews/month",
      "Advanced analytics & reporting",
      "Priority support",
      "Custom question banks",
      "Unlimited Usage of Integrated IDE",
    ],
    buttonStyle: "bg-[#16a34a] text-white hover:bg-[#15803d]",
    buttonText: "Get Started",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    popular: false,
    features: [
      "Unlimited interviews",
      "White-label solution",
      "Dedicated account manager",
      "Full customization",
      "On-premise deployment option",
    ],
    buttonStyle: "border-2 border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white",
    buttonText: "Contact Sales",
  },
];

export default function EnterprisePage() {
  return (
    <div className="min-h-screen relative bg-[#f5f0e8] noise-bg">
      <Navbar />

      {/* Hero Section */}
      <section className="px-16 pt-40 pb-24 max-w-7xl mx-auto text-center relative z-10">
        <ScrollReveal>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#16a34a]/10 border border-[#16a34a]/30 rounded-md mb-6">
            <span className="w-2 h-2 rounded-full bg-[#16a34a]"></span>
            <span className="font-mono-accent text-[#16a34a] text-xs">Enterprise Solutions</span>
          </div>
          <h1 className="text-6xl font-bold text-[#1a1a1a] mb-6">
            Evalve AI Recruitment{" "}
            <span className="text-[#16a34a]">Solutions</span>
          </h1>
        </ScrollReveal>
        <ScrollReveal delay={100}>
          <p className="text-lg text-[#6b6b6b] max-w-3xl mx-auto mb-12 leading-relaxed">
            Transform your hiring process with adaptable, AI-driven interviews
            calibrated specifically for your hiring needs.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={200}>
          <div className="flex items-center justify-center gap-4">
            <a
              href="mailto:enterprise@evalve.ai"
              className="px-8 py-4 bg-[#16a34a] text-white font-bold rounded-md hover:bg-[#15803d] transition-all transform hover:scale-[1.02]"
            >
              Contact Our Team
            </a>
            <a
              href="#pricing"
              className="px-8 py-4 border-2 border-[#1a1a1a] text-[#1a1a1a] font-bold rounded-md hover:bg-[#1a1a1a] hover:text-white transition-all transform hover:scale-[1.02]"
            >
              View Pricing Plans
            </a>
          </div>
        </ScrollReveal>
      </section>

      <div className="border-t border-[#1a1a1a]/10 mx-16"></div>

      {/* Solutions Section */}
      <section className="px-16 py-24 max-w-7xl mx-auto relative z-10">
        <ScrollReveal>
          <p className="font-mono-accent text-[#6b6b6b] text-center mb-4 text-xs">Why enterprises choose Evalve</p>
          <h2 className="text-5xl font-bold text-[#1a1a1a] text-center mb-6">
            Custom AI Solutions for{" "}
            <span className="text-[#16a34a]">Enterprises</span>
          </h2>
          <p className="text-lg text-[#6b6b6b] text-center max-w-3xl mx-auto mb-16">
            Tailored AI interviews, streamlined assessments, and analytics for your hiring requirements.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {solutions.map((sol, i) => (
            <ScrollReveal key={sol.title} delay={i * 100}>
              <div className="bg-white rounded-xl p-8 border border-[#1a1a1a]/15 card-lift h-full">
                <div className="w-14 h-14 bg-[#16a34a]/10 border border-[#16a34a]/20 rounded-lg flex items-center justify-center mb-6">
                  <sol.icon className="w-7 h-7 text-[#16a34a]" />
                </div>
                <h3 className="text-xl font-bold text-[#1a1a1a] mb-4">{sol.title}</h3>
                <p className="text-[#6b6b6b] text-sm leading-relaxed">{sol.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <div className="border-t border-[#1a1a1a]/10 mx-16"></div>

      {/* Stats Section */}
      <section className="px-16 py-24 max-w-7xl mx-auto relative z-10">
        <ScrollReveal>
          <h2 className="text-5xl font-bold text-[#1a1a1a] text-center mb-16">
            Request a Demo
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {enterpriseStats.map((stat, i) => (
            <ScrollReveal key={stat.label} delay={i * 80}>
              <div className="stat-card bg-white rounded-xl p-8 border border-[#1a1a1a]/15 text-center cursor-default">
                <h3 className="text-4xl font-bold text-[#1a1a1a] mb-3">{stat.value}</h3>
                <p className="text-[#6b6b6b] text-sm font-mono-accent">{stat.label}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <div className="border-t border-[#1a1a1a]/10 mx-16"></div>

      {/* Pricing Section */}
      <section id="pricing" className="px-16 py-24 max-w-7xl mx-auto relative z-10">
        <ScrollReveal>
          <p className="font-mono-accent text-[#6b6b6b] text-center mb-4 text-xs">Transparent pricing</p>
          <h2 className="text-5xl font-bold text-[#1a1a1a] text-center mb-6">Pricing Plans</h2>
          <p className="text-lg text-[#6b6b6b] text-center max-w-3xl mx-auto mb-16">
            Choose the plan that fits your organization&apos;s hiring needs.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, i) => (
            <ScrollReveal key={plan.name} delay={i * 100}>
              <div
                className={`bg-white rounded-xl p-8 card-lift relative h-full flex flex-col ${plan.popular
                  ? "border-2 border-[#16a34a]"
                  : "border border-[#1a1a1a]/15"
                  }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-[#16a34a] text-white text-xs font-bold px-4 py-1 rounded-bl-lg rounded-tr-xl badge-popular font-mono-accent">
                    Popular
                  </div>
                )}
                <h3 className="text-xl font-bold text-[#1a1a1a] mb-4">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-[#1a1a1a]">{plan.price}</span>
                  {plan.period && <span className="text-[#6b6b6b]">{plan.period}</span>}
                </div>
                <ul className="space-y-3 mb-8 flex-1 list-none">
                  {plan.features.map((f) => (
                    <li key={f} className="text-[#6b6b6b] text-sm flex items-center gap-2">
                      <span className="text-[#16a34a] font-bold">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full px-6 py-3 font-bold rounded-md transition-all transform hover:scale-[1.02] ${plan.buttonStyle}`}
                >
                  {plan.buttonText}
                </button>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <div className="border-t border-[#1a1a1a]/10 mx-16"></div>

      {/* Get in Touch Section */}
      <section className="px-16 py-24 max-w-7xl mx-auto text-center relative z-10">
        <ScrollReveal>
          <h2 className="text-5xl font-bold text-[#1a1a1a] mb-6">Get in Touch</h2>
          <p className="text-lg text-[#6b6b6b] max-w-3xl mx-auto mb-12 leading-relaxed">
            Let&apos;s make hiring seamless and intelligent for your business.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={100}>
          <a
            href="mailto:enterprise@evalve.ai"
            className="inline-flex items-center gap-3 px-10 py-5 bg-[#16a34a] text-white font-bold rounded-md hover:bg-[#15803d] transition-all transform hover:scale-[1.02]"
          >
            <Mail className="w-5 h-5" />
            enterprise@evalve.ai
          </a>
        </ScrollReveal>
      </section>

      {/* Footer */}
      <footer className="px-16 py-10 text-center border-t border-[#1a1a1a]/10 relative z-10">
        <p className="text-[#999] text-xs font-mono-accent">
          © 2026 Evalve – AI Interview Platform
        </p>
      </footer>
    </div>
  );
}
