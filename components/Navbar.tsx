"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

const navLinks = [
    { href: "/setup", label: "Setup" },
    { href: "/#features", label: "Features" },
];

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
        const handleScroll = () => {
            setScrolled(window.scrollY > 40);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "nav-scrolled py-3" : "py-5 border-b border-[var(--border)]"
                }`}
        >
            <div className="flex items-center justify-between px-16 max-w-[1400px] mx-auto">
                <Link href="/" className="flex items-center gap-3 logo-hover">
                    <span className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Evalve</span>
                </Link>

                <div className="flex items-center gap-8">
                    {navLinks.map((link) => {
                        const isActive =
                            pathname === link.href ||
                            (link.href === "/interview" && pathname.startsWith("/interview")) ||
                            (link.href === "/enterprise" && pathname.startsWith("/enterprise"));

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`relative group inline-block transition-colors font-mono-accent text-xs ${isActive
                                    ? "text-[var(--text-primary)] font-semibold"
                                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                    }`}
                            >
                                {link.label}
                                <span
                                    className={`absolute -bottom-1 left-0 h-[2px] bg-[#16a34a] transition-all duration-300 ${isActive ? "w-full" : "w-0 group-hover:w-full"
                                        }`}
                                />
                            </Link>
                        );
                    })}

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="relative w-9 h-9 rounded-lg border border-[var(--border)] bg-[var(--card-bg)] flex items-center justify-center hover:border-[#16a34a]/40 transition-all"
                        aria-label="Toggle theme"
                    >
                        {mounted && (
                            theme === "dark" ? (
                                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4 text-[var(--text-secondary)]" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            )
                        )}
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
