import Link from "next/link";
import { SITE_NAME, SITE_TAGLINE, NAV_CATEGORIES } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-white mt-0">
      {/* Top border accent */}
      <div className="h-[3px] bg-[#9b0000]" />

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3
              className="text-2xl mb-1 text-white"
              style={{ fontFamily: "var(--font-unifraktur), cursive" }}
            >
              {SITE_NAME}
            </h3>
            <p className="text-[11px] italic text-gray-400 mb-3"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {SITE_TAGLINE}
            </p>
            <p className="text-[13px] text-gray-400 leading-relaxed">
              Delivering breaking news and commentary on the issues that affect
              the future of our nation.
            </p>
          </div>

          {/* Sections */}
          <div>
            <h4 className="text-[12px] font-bold uppercase tracking-[0.1em] text-white mb-3 pb-2 border-b border-[#333]">
              Sections
            </h4>
            <ul className="grid grid-cols-2 gap-1">
              {NAV_CATEGORIES.map((cat) => (
                <li key={cat.name}>
                  <Link
                    href={cat.href}
                    className="text-[13px] text-gray-400 hover:text-white transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-[12px] font-bold uppercase tracking-[0.1em] text-white mb-3 pb-2 border-b border-[#333]">
              About
            </h4>
            <ul className="space-y-1.5">
              <li>
                <Link href="#" className="text-[13px] text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-[13px] text-gray-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="#" className="text-[13px] text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-[13px] text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#333] mt-8 pt-6 text-center text-[12px] text-gray-500">
          &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
