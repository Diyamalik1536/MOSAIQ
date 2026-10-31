import "./ProjectGraphic.css";

/**
 * ProjectGraphic
 * Renders an editorial, vector-based preview canvas for MOSAIQ projects.
 * Adheres to rule #231: Reusable fallback treatment using project's real category,
 * title, technology tags, and MOSAIQ violet/lavender design system.
 */
export default function ProjectGraphic({ project, variant = "card" }) {
  const { category, stack, visualTheme } = project;
  const gradient = visualTheme?.gradient || "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)";
  const pattern = visualTheme?.svgPattern || "constellation";

  return (
    <div className={`tf-project-graphic tf-project-graphic--${variant}`}>
      {/* Background ambient gradient */}
      <div
        className="tf-graphic-gradient-layer"
        style={{ background: gradient }}
      />

      {/* Subtle grid pattern overlay */}
      <div className="tf-graphic-grid-overlay" />

      {/* Vector Canvas Motif */}
      <div className="tf-graphic-artboard">
        {pattern === "constellation" && (
          <svg viewBox="0 0 400 240" className="tf-graphic-svg" aria-hidden="true">
            <defs>
              <linearGradient id="glowGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#c7d2fe" stopOpacity="0.4" />
              </linearGradient>
            </defs>
            {/* UI Window frame */}
            <rect x="25" y="25" width="350" height="190" rx="14" fill="#ffffff" fillOpacity="0.12" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.35" />
            <circle cx="45" cy="45" r="4" fill="#ffffff" fillOpacity="0.6" />
            <circle cx="58" cy="45" r="4" fill="#ffffff" fillOpacity="0.4" />
            <circle cx="71" cy="45" r="4" fill="#ffffff" fillOpacity="0.4" />
            <line x1="25" y1="62" x2="375" y2="62" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.2" />
            {/* Constellation Nodes */}
            <line x1="90" y1="140" x2="170" y2="100" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.6" strokeDasharray="3 3" />
            <line x1="170" y1="100" x2="250" y2="150" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.7" />
            <line x1="250" y1="150" x2="320" y2="110" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.5" strokeDasharray="3 3" />
            <line x1="170" y1="100" x2="200" y2="175" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.4" />
            {/* Nodes */}
            <circle cx="90" cy="140" r="14" fill="url(#glowGrad1)" />
            <circle cx="170" cy="100" r="20" fill="#ffffff" />
            <circle cx="170" cy="100" r="10" fill="#5035ff" />
            <circle cx="250" cy="150" r="16" fill="url(#glowGrad1)" />
            <circle cx="320" cy="110" r="12" fill="url(#glowGrad1)" />
            <circle cx="200" cy="175" r="10" fill="url(#glowGrad1)" />
            {/* Pill labels */}
            <rect x="135" y="72" width="70" height="16" rx="8" fill="#1e1b4b" fillOpacity="0.7" />
            <text x="170" y="83" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">CORE ANCHOR</text>
          </svg>
        )}

        {pattern === "wallet" && (
          <svg viewBox="0 0 400 240" className="tf-graphic-svg" aria-hidden="true">
            {/* Mobile phone frame */}
            <rect x="130" y="20" width="140" height="200" rx="20" fill="#ffffff" fillOpacity="0.14" stroke="#ffffff" strokeWidth="1.6" strokeOpacity="0.4" />
            <rect x="170" y="26" width="60" height="6" rx="3" fill="#ffffff" fillOpacity="0.4" />
            {/* Card inside phone */}
            <rect x="145" y="55" width="110" height="68" rx="10" fill="#ffffff" fillOpacity="0.3" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.5" />
            <circle cx="165" cy="75" r="8" fill="#ffffff" fillOpacity="0.8" />
            <circle cx="177" cy="75" r="8" fill="#38bdf8" fillOpacity="0.7" />
            <rect x="155" y="98" width="50" height="6" rx="3" fill="#ffffff" fillOpacity="0.8" />
            <rect x="155" y="108" width="70" height="4" rx="2" fill="#ffffff" fillOpacity="0.5" />
            {/* NFC Wave arcs */}
            <path d="M 235 68 A 12 12 0 0 1 243 78" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M 239 63 A 18 18 0 0 1 249 79" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
            {/* Transaction item rows */}
            <rect x="145" y="140" width="110" height="18" rx="6" fill="#ffffff" fillOpacity="0.2" />
            <rect x="145" y="165" width="110" height="18" rx="6" fill="#ffffff" fillOpacity="0.2" />
            <circle cx="155" cy="149" r="4" fill="#38bdf8" />
            <circle cx="155" cy="174" r="4" fill="#22c55e" />
          </svg>
        )}

        {pattern === "ai" && (
          <svg viewBox="0 0 400 240" className="tf-graphic-svg" aria-hidden="true">
            {/* Neural network / Diff chart */}
            <rect x="40" y="30" width="320" height="180" rx="12" fill="#ffffff" fillOpacity="0.12" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.3" />
            <line x1="40" y1="70" x2="360" y2="70" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.2" />
            {/* Diff Comparison Columns */}
            <rect x="65" y="90" width="115" height="100" rx="8" fill="#ffffff" fillOpacity="0.15" />
            <rect x="220" y="90" width="115" height="100" rx="8" fill="#ffffff" fillOpacity="0.22" />
            <text x="122" y="108" fill="#ffffff" fontSize="10" fontWeight="600" textAnchor="middle">Current Resume</text>
            <text x="277" y="108" fill="#ffffff" fontSize="10" fontWeight="600" textAnchor="middle">AI Recommendation</text>
            {/* Match percentage meter */}
            <circle cx="192" cy="140" r="22" fill="#18181b" fillOpacity="0.6" stroke="#ffffff" strokeWidth="1.5" />
            <text x="192" y="144" fill="#a855f7" fontSize="12" fontWeight="bold" textAnchor="middle">+94%</text>
            {/* Connecting lines */}
            <line x1="160" y1="140" x2="170" y2="140" stroke="#ffffff" strokeWidth="2" strokeDasharray="2 2" />
            <line x1="214" y1="140" x2="224" y2="140" stroke="#ffffff" strokeWidth="2" strokeDasharray="2 2" />
          </svg>
        )}

        {pattern === "cloud" && (
          <svg viewBox="0 0 400 240" className="tf-graphic-svg" aria-hidden="true">
            {/* Terminal Window */}
            <rect x="50" y="25" width="300" height="190" rx="10" fill="#064e3b" fillOpacity="0.75" stroke="#34d399" strokeWidth="1.4" strokeOpacity="0.5" />
            <rect x="50" y="25" width="300" height="28" rx="10" fill="#047857" fillOpacity="0.8" />
            <circle cx="68" cy="39" r="4" fill="#ef4444" />
            <circle cx="80" cy="39" r="4" fill="#eab308" />
            <circle cx="92" cy="39" r="4" fill="#22c55e" />
            <text x="200" y="43" fill="#ffffff" fontSize="10" textAnchor="middle" opacity="0.8">cloud-deployer-cli</text>
            {/* CLI prompt lines */}
            <text x="70" y="80" fill="#34d399" fontSize="11" fontFamily="monospace">$ tf-deploy --preview --ssl</text>
            <text x="70" y="105" fill="#a7f3d0" fontSize="10" fontFamily="monospace">✓ Provisioning AWS ECS Cluster [OK]</text>
            <text x="70" y="125" fill="#a7f3d0" fontSize="10" fontFamily="monospace">✓ Ephemeral Postgres provisioned [OK]</text>
            <text x="70" y="145" fill="#a7f3d0" fontSize="10" fontFamily="monospace">✓ SSL Cert generated via Let's Encrypt</text>
            <text x="70" y="175" fill="#fef08a" fontSize="10" fontWeight="bold" fontFamily="monospace">🚀 Live at: https://pr-42.talentforge.dev</text>
          </svg>
        )}

        {pattern === "notes" && (
          <svg viewBox="0 0 400 240" className="tf-graphic-svg" aria-hidden="true">
            {/* Study deck */}
            <rect x="70" y="45" width="220" height="150" rx="12" fill="#ffffff" fillOpacity="0.15" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.3" transform="rotate(-4 180 120)" />
            <rect x="100" y="35" width="220" height="150" rx="12" fill="#ffffff" fillOpacity="0.28" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.5" />
            <rect x="120" y="55" width="80" height="14" rx="4" fill="#d97706" />
            <text x="160" y="66" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">CS-301 SYLLABUS</text>
            <rect x="120" y="85" width="170" height="6" rx="3" fill="#ffffff" fillOpacity="0.8" />
            <rect x="120" y="100" width="140" height="6" rx="3" fill="#ffffff" fillOpacity="0.6" />
            <rect x="120" y="115" width="155" height="6" rx="3" fill="#ffffff" fillOpacity="0.6" />
            <rect x="120" y="145" width="60" height="20" rx="6" fill="#ffffff" fillOpacity="0.35" />
            <text x="150" y="159" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">★ 48 Votes</text>
          </svg>
        )}

        {pattern === "design" && (
          <svg viewBox="0 0 400 240" className="tf-graphic-svg" aria-hidden="true">
            {/* Accessibility Design Canvas */}
            <rect x="40" y="30" width="320" height="180" rx="14" fill="#ffffff" fillOpacity="0.15" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.4" />
            {/* Palette swatch rings */}
            <circle cx="85" cy="80" r="22" fill="#7c3aed" stroke="#ffffff" strokeWidth="2" />
            <circle cx="140" cy="80" r="22" fill="#4f46e5" stroke="#ffffff" strokeWidth="2" />
            <circle cx="195" cy="80" r="22" fill="#ec4899" stroke="#ffffff" strokeWidth="2" />
            <circle cx="250" cy="80" r="22" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
            {/* High Contrast badge */}
            <rect x="65" y="125" width="125" height="45" rx="8" fill="#18181b" stroke="#a855f7" strokeWidth="1.5" />
            <text x="127" y="144" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">WCAG 2.1 AAA</text>
            <text x="127" y="158" fill="#a855f7" fontSize="9" textAnchor="middle">Ratio 14.2:1 Pass ✓</text>
            {/* Component preview */}
            <rect x="210" y="125" width="125" height="45" rx="8" fill="#ffffff" stroke="#7c3aed" strokeWidth="2" strokeDasharray="3 3" />
            <text x="272" y="144" fill="#4c1d95" fontSize="10" fontWeight="bold" textAnchor="middle">Accessible Button</text>
            <text x="272" y="158" fill="#6b7280" fontSize="9" textAnchor="middle">:focus-visible ring</text>
          </svg>
        )}

        {pattern === "code" && (
          <svg viewBox="0 0 400 240" className="tf-graphic-svg" aria-hidden="true">
            {/* Code diff / parser */}
            <rect x="40" y="30" width="320" height="180" rx="10" fill="#0f172a" fillOpacity="0.8" stroke="#38bdf8" strokeWidth="1.2" strokeOpacity="0.4" />
            <text x="60" y="65" fill="#38bdf8" fontSize="11" fontFamily="monospace">import pdfplumber, re</text>
            <text x="60" y="90" fill="#94a3b8" fontSize="10" fontFamily="monospace"># Extract verified artifacts</text>
            <text x="60" y="115" fill="#f43f5e" fontSize="10" fontFamily="monospace">- raw_links: 14 unparsed</text>
            <text x="60" y="138" fill="#10b981" fontSize="10" fontFamily="monospace">+ verified_repos: 4 active [200 OK]</text>
            <text x="60" y="160" fill="#a855f7" fontSize="10" fontFamily="monospace">+ candidate_skills: ['Python', 'SQL']</text>
            <rect x="60" y="180" width="120" height="18" rx="4" fill="#0284c7" fillOpacity="0.4" />
            <text x="120" y="193" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">Confidence 96.8%</text>
          </svg>
        )}

        {pattern === "calendar" && (
          <svg viewBox="0 0 400 240" className="tf-graphic-svg" aria-hidden="true">
            {/* Event schedule board */}
            <rect x="40" y="30" width="320" height="180" rx="12" fill="#ffffff" fillOpacity="0.14" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.4" />
            {/* Calendar cards */}
            <rect x="60" y="55" width="130" height="65" rx="8" fill="#ffffff" fillOpacity="0.3" stroke="#ffffff" strokeWidth="1" />
            <text x="75" y="78" fill="#ffffff" fontSize="11" fontWeight="bold">HackChitkara '26</text>
            <text x="75" y="95" fill="#ffffff" fontSize="9" opacity="0.8">48-Hr Hardware & AI</text>
            <text x="75" y="110" fill="#e0e7ff" fontSize="8" fontWeight="bold">RSVP: 340 Students</text>

            <rect x="210" y="55" width="130" height="65" rx="8" fill="#ffffff" fillOpacity="0.2" stroke="#ffffff" strokeWidth="1" />
            <text x="225" y="78" fill="#ffffff" fontSize="11" fontWeight="bold">UI/UX Teardown</text>
            <text x="225" y="95" fill="#ffffff" fontSize="9" opacity="0.8">Design Review Session</text>
            <text x="225" y="110" fill="#e0e7ff" fontSize="8" fontWeight="bold">Host: NID Mentors</text>

            <rect x="60" y="135" width="280" height="50" rx="8" fill="#1e1b4b" fillOpacity="0.6" stroke="#818cf8" strokeWidth="1" />
            <circle cx="85" cy="160" r="12" fill="#6366f1" />
            <text x="85" y="164" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">✓</text>
            <text x="110" y="156" fill="#ffffff" fontSize="10" fontWeight="bold">Teammate Finder Live</text>
            <text x="110" y="172" fill="#c7d2fe" fontSize="9">14 teams currently seeking frontend engineers</text>
          </svg>
        )}
      </div>

      {/* Floating Bottom Metadata Bar */}
      <div className="tf-graphic-meta-bar">
        <span className="tf-graphic-category-pill">{category}</span>
        <div className="tf-graphic-stack-tags">
          {stack.slice(0, 3).map((tech) => (
            <span key={tech} className="tf-graphic-tech-pill">
              {tech}
            </span>
          ))}
          {stack.length > 3 && (
            <span className="tf-graphic-tech-pill tf-graphic-tech-more">
              +{stack.length - 3}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
