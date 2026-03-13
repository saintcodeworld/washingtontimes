"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Search, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { NAV_CATEGORIES, TRENDING_TOPICS, SITE_TAGLINE } from "@/lib/constants";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white">
      {/* ===== Red WATCH ticker bar ===== */}
      <div className="bg-[#cc0000] text-white">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-9">
          <div className="flex items-center gap-2">
            <Play size={12} fill="white" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Watch
            </span>
            <span className="text-xs opacity-90 hidden sm:inline">
              Washington Times Live
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="#"
              className="text-xs font-semibold hover:underline hidden md:inline"
            >
              Subscribe
            </Link>
            <Link
              href="#"
              className="text-xs font-semibold hover:underline"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* ===== Masthead with Gothic logo ===== */}
      <div className="border-b border-[#e5e5e5]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            className="lg:hidden p-2 hover:bg-[#f4f4f4] rounded"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <Link href="/" className="flex flex-col items-center mx-auto">
            <span
              className="font-gothic text-3xl md:text-4xl lg:text-[2.7rem] leading-none text-[#1a1a1a] tracking-wide"
              style={{ fontFamily: "var(--font-unifraktur), cursive" }}
            >
              The Washington Times
            </span>
            <span className="text-[11px] text-[#777] italic mt-0.5 tracking-wide"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              {SITE_TAGLINE}
            </span>
          </Link>

          <button
            className="p-2 hover:bg-[#f4f4f4] rounded"
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Search"
          >
            <Search size={18} className="text-[#555]" />
          </button>
        </div>
      </div>

      {/* ===== Main navigation with black borders ===== */}
      <nav className="hidden lg:block border-t border-[#222] border-b border-b-[#222]">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center">
            {NAV_CATEGORIES.map((cat, i) => (
              <Link
                key={cat.name}
                href={cat.href}
                className={`px-4 py-2.5 text-[12px] font-bold tracking-[0.08em] text-[#222] hover:text-[#9b0000] transition-colors ${
                  i < NAV_CATEGORIES.length - 1 ? "border-r border-[#ddd]" : ""
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="#"
              className="px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider bg-[#9b0000] text-white rounded-sm hover:bg-[#7a0000] transition-colors"
            >
              Subscribe
            </Link>
            <Link
              href="#"
              className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#555] border border-[#ccc] rounded-sm hover:bg-[#f4f4f4] transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* ===== Trending bar ===== */}
      <div className="hidden lg:block border-b border-[#e5e5e5] bg-white">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#9b0000] flex-shrink-0">
            Trending:
          </span>
          <div className="flex items-center gap-0 text-[12px] text-[#555]">
            {TRENDING_TOPICS.map((topic, i) => (
              <span key={topic} className="flex items-center flex-shrink-0">
                <Link
                  href={`/search?q=${encodeURIComponent(topic)}`}
                  className="hover:text-[#9b0000] hover:underline transition-colors whitespace-nowrap"
                >
                  {topic}
                </Link>
                {i < TRENDING_TOPICS.length - 1 && (
                  <span className="mx-2 text-[#ccc]">|</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ===== Search bar dropdown ===== */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden bg-[#f4f4f4] border-b border-[#e5e5e5]"
          >
            <form
              onSubmit={handleSearch}
              className="max-w-2xl mx-auto px-4 py-3 flex gap-2"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="flex-1 px-4 py-2 border border-[#ccc] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#9b0000]/20"
                autoFocus
              />
              <button
                type="submit"
                className="px-5 py-2 bg-[#9b0000] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#7a0000] transition-colors"
              >
                Search
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Mobile navigation ===== */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden overflow-hidden bg-white border-b border-[#e5e5e5]"
          >
            <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col">
              {NAV_CATEGORIES.map((cat) => (
                <Link
                  key={cat.name}
                  href={cat.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 text-[12px] font-bold tracking-[0.08em] text-[#222] hover:text-[#9b0000] border-b border-[#eee] transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
              <div className="flex gap-2 py-3">
                <Link
                  href="#"
                  className="flex-1 text-center px-4 py-2 text-[11px] font-bold uppercase bg-[#9b0000] text-white"
                >
                  Subscribe
                </Link>
                <Link
                  href="#"
                  className="flex-1 text-center px-4 py-2 text-[11px] font-bold uppercase border border-[#ccc] text-[#555]"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
