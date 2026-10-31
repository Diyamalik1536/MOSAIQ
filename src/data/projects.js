import { studentData } from "./students";

/**
 * Rich demo project data for MOSAIQ.
 * Integrated with canonical student builder records (stu_001 to stu_006).
 * Includes long-form case study data inspired by Stefano Girardelli's OBSIDIAN case study.
 */
export const projectsData = [
  {
    id: "proj_talentforge",
    slug: "talentforge-platform",
    title: "MOSAIQ Platform",
    tagline: "Decentralized campus collaboration platform connecting student builders, designers, and engineers.",
    description: "A student-first network that replaces fragmented campus WhatsApp groups and Discord servers with structured skill constellations, verified project listings, and intelligent teammate matching.",
    problemSolved: "Students struggle to find serious, complementary collaborators across engineering, design, and product disciplines within their university campus.",
    category: "Web",
    featured: true,
    status: "Looking for Collaborators",
    stage: "Beta Prototype",
    leadId: "stu_001", // Misthi Rawal
    contributorIds: ["stu_001", "stu_002", "stu_006"],
    stack: ["React", "Vite", "Node.js", "JavaScript", "SQL", "Docker"],
    collaborationNeeds: "Seeking 1 UI/UX Designer and 1 Node.js backend developer to implement real-time presence and constellation graph updates.",
    openRoles: [
      { role: "UI/UX Designer", skill: "Figma & Design Systems", description: "Design token architecture and mobile constellation view" },
      { role: "Backend Developer", skill: "Node.js & WebSockets", description: "Real-time presence and session handshakes" }
    ],
    highlights: [
      "Dynamic 2.5D skill constellation visualizer with 5-stage reveal",
      "Razorpay-inspired 3D card flip talent marquee stream",
      "Multi-language support with instant locale switching (English, Hindi, Punjabi)"
    ],
    visualTheme: {
      gradient: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #2563eb 100%)",
      badgeColor: "#5035ff",
      accentBg: "#f5f3ff",
      svgPattern: "constellation"
    },
    caseStudy: {
      clientContext: "Chitkara University Incubator Project",
      timeline: "4 Months · Spring Semester",
      role: "Lead Fullstack Architecture & Interaction Design",
      executiveSummary: "MOSAIQ is an editorial-grade student collaboration platform that treats campus talent not as static CVs, but as dynamic, interconnected skill constellations. It merges 2.5D visual topology with high-performance React architecture.",
      challenge: "University campuses suffer from severe talent fragmentation. A computer science student building a machine learning model rarely meets the communication designer in the next block who could craft the user interface. Traditional university noticeboards are ignored, while WhatsApp groups lose project briefs within minutes under conversational spam.",
      solution: "We conceptualized a spatial skill mapping paradigm: students become stars, projects become collaborative gravities, and complementary capabilities form glowing visual constellations. Instead of resume scoreboards, MOSAIQ prioritizes mutual skill affinity, real project artifacts, and zero-latency discovery.",
      architecture: [
        { layer: "Presentation Layer", tech: "React 19 + Vite 8", detail: "Componentized modular UI with sub-60fps CSS 3D transforms and SVG vector canvas" },
        { layer: "Topology Engine", tech: "2.5D Coordinate System", detail: "Dynamic distance metrics computing skill complementarity vectors across 6 student builder nodes" },
        { layer: "Localization Pipeline", tech: "i18next React Integration", detail: "Instant tri-lingual switching between English, Hindi, and Punjabi without page reloads" },
        { layer: "State & Storage", tech: "URL History + LocalStorage", detail: "Full browser back/forward route synchronisation and client-side connection request persistence" }
      ],
      metrics: [
        { label: "Render Frame Budget", value: "< 16ms" },
        { label: "Active Builder Nodes", value: "6 Canonical" },
        { label: "Localization Locales", value: "3 Supported" },
        { label: "Bundle Overhead", value: "Zero External 3D" }
      ],
      chapters: [
        {
          number: "01",
          title: "The Campus Disconnect",
          subtitle: "Moving beyond unorganized chat channels",
          content: "Across university campuses, talented students build alone because finding teammates feels intimidating and inefficient. Hackathons run out of designers, while design students lack backend engineers to bring interactive prototypes alive. Our initial audit showed that over 82% of student projects stall before launch due to unbalanced teams.",
          takeaway: "The interface needed to make discovery feel inspiring and editorial, turning collaboration into a natural visual experience."
        },
        {
          number: "02",
          title: "Constellation Topology Engine",
          subtitle: "Visualizing skill complementarity in 2.5D space",
          content: "Rather than displaying boring tabular databases, we engineered a 2.5D constellation model. When a user selects a central anchor student, dynamic SVG vector streams calculate shared strengths (solid violet links) and complementary gaps (dashed lavender streams). The mathematical model rewards cross-disciplinary matches (e.g. Design + Machine Learning).",
          takeaway: "Visual metaphors accelerate cognitive understanding of complex team compatibility."
        },
        {
          number: "03",
          title: "Performance & Accessibility Restraint",
          subtitle: "High visual impact without heavy Three.js runtimes",
          content: "While 3D WebGL libraries are visually impressive, they impose 2MB+ bundle penalties and drain battery life on student laptops. We strictly engineered the experience using native SVG coordinates, CSS 3D transforms (`perspective`, `transform-style: preserve-3d`), and `prefers-reduced-motion` fallbacks. The entire experience builds cleanly under 1 second.",
          takeaway: "Restrained, standards-compliant creative engineering yields superior responsiveness and accessibility."
        }
      ]
    }
  },
  {
    id: "proj_campus_wallet",
    slug: "campus-wallet",
    title: "Campus Wallet",
    tagline: "Frictionless multi-vendor campus micro-transactions with offline NFC support.",
    description: "An intuitive mobile payment application tailored for university canteens, stationery stores, and library printing services, designed with accessibility and low-connectivity resilience in mind.",
    problemSolved: "Poor cellular connectivity in basement cafeterias causes UPI payment failures and long checkout queues between class breaks.",
    category: "Mobile",
    featured: false,
    status: "Looking for Collaborators",
    stage: "UI Prototype & Test",
    leadId: "stu_002", // Aisha Khan
    contributorIds: ["stu_002", "stu_005"],
    stack: ["Figma", "Flutter", "Firebase", "Dart", "UI/UX"],
    collaborationNeeds: "Looking for a Flutter developer experienced with NFC APIs and offline-first SQLite synchronization.",
    openRoles: [
      { role: "Flutter Engineer", skill: "Flutter & SQLite", description: "Implement local transaction ledger and NFC token exchange" },
      { role: "Security Auditor", skill: "Encrypted Storage", description: "Audit hardware keystore token protection" }
    ],
    highlights: [
      "Sub-second offline token redemption via NFC",
      "WCAG 2.1 AA compliant design system with high-contrast mode",
      "Canteen vendor point-of-sale companion app"
    ],
    visualTheme: {
      gradient: "linear-gradient(135deg, #0ea5e9 0%, #3b82f6 50%, #6366f1 100%)",
      badgeColor: "#0284c7",
      accentBg: "#f0f9ff",
      svgPattern: "wallet"
    },
    caseStudy: {
      clientContext: "Student Living & Campus Commerce Lab",
      timeline: "3 Months · Design Sprint & Flutter Build",
      role: "Lead Product Designer & Prototyper",
      executiveSummary: "Campus Wallet eliminates the 15-minute lunchtime payment bottleneck in campus cafeterias where cell service drops to zero. It combines dual-token cryptographic NFC cards with local offline validation.",
      challenge: "University cafeteria basements are notorious cell dead zones. During 20-minute class transitions, hundreds of students attempt UPI mobile payments simultaneously, causing network timeouts, duplicate deductions, and irritated food vendors.",
      solution: "A local-first pre-authorized credit ledger. Students pre-load tokens while on campus Wi-Fi. In the basement, their phone emits an encrypted NFC handshake directly to the vendor terminal in under 300 milliseconds without requiring cellular internet.",
      architecture: [
        { layer: "Design System", tech: "Figma + Tokens Studio", detail: "High-contrast colorways with tactile haptic confirmation triggers" },
        { layer: "Mobile Client", tech: "Flutter 3 + Dart", detail: "Reactive local state with offline-first SQLite transaction log" },
        { layer: "NFC Interface", tech: "Host Card Emulation (HCE)", detail: "Secure element communication for instant badge tapping" }
      ],
      metrics: [
        { label: "Checkout Time", value: "< 350ms" },
        { label: "Cellular Dependency", value: "0% Offline" },
        { label: "Accessibility Score", value: "100% WCAG AA" }
      ],
      chapters: [
        {
          number: "01",
          title: "The Basement Bottleneck",
          subtitle: "Analyzing 400 daily failed canteen payments",
          content: "Observational field studies at the main university cafeteria revealed that 68% of student delays were caused by mobile payment spinners. Cash created change management issues, while online gateways repeatedly timed out in concrete basement structures.",
          takeaway: "A viable solution had to function completely disconnected from the public internet."
        },
        {
          number: "02",
          title: "Accessible & Resilient UI",
          subtitle: "Designing for speed, glare, and one-handed use",
          content: "We designed high-contrast cards with large touch targets, color-blind safe status indicators, and distinct sound/haptic cues so students and busy food vendors can confirm transactions instantly even in loud, crowded cafeterias.",
          takeaway: "Utility design wins when micro-interactions provide unambiguous, instant sensory confirmation."
        }
      ]
    }
  },
  {
    id: "proj_resumeranker",
    slug: "resumeranker-ai",
    title: "ResumeRanker AI",
    tagline: "Explainable NLP engine matching university student resumes to hackathon and internship requirements.",
    description: "An open-source resume analysis toolkit that utilizes lightweight sentence transformers to give students concrete, actionable feedback on skill gaps rather than arbitrary keyword scores.",
    problemSolved: "Commercial ATS software acts as a black box, giving students zero guidance on why their applications were filtered out.",
    category: "AI/ML",
    featured: false,
    status: "Active Building",
    stage: "Model Fine-Tuning",
    leadId: "stu_003", // Rahul Verma
    contributorIds: ["stu_003", "stu_001"],
    stack: ["Python", "Machine Learning", "Pandas", "TensorFlow", "SQL"],
    collaborationNeeds: "Seeking a frontend developer to build an interactive diff viewer for resume improvements.",
    openRoles: [
      { role: "Frontend Developer", skill: "React & Tailwind", description: "Build interactive semantic diff visualizer" },
      { role: "NLP Researcher", skill: "Hugging Face", description: "Fine-tune sentence embeddings on technical job specs" }
    ],
    highlights: [
      "Semantic skill-gap extraction using local embeddings",
      "Privacy-first: runs entirely on-device without cloud data retention",
      "Actionable bullet point rewriting recommendations"
    ],
    visualTheme: {
      gradient: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f43f5e 100%)",
      badgeColor: "#9333ea",
      accentBg: "#faf5ff",
      svgPattern: "ai"
    },
    caseStudy: {
      clientContext: "Campus AI & Data Science Guild",
      timeline: "5 Months · Model Architecture & Pipeline",
      role: "Lead Machine Learning Engineer",
      executiveSummary: "ResumeRanker AI replaces deceptive resume rating percentages with explainable semantic gap extraction. It helps students understand exactly which core competencies are missing from their technical profiles.",
      challenge: "Student builders apply to competitive internships only to receive automated rejection emails with zero feedback. Commercial ATS systems blindly search for exact keywords, filtering out candidates who used synonyms or demonstrated skills through GitHub projects.",
      solution: "A local sentence-transformer pipeline that maps student project descriptions into multidimensional technical vector spaces, comparing conceptual depth against real software engineering requirements.",
      architecture: [
        { layer: "Embedding Pipeline", tech: "MiniLM-L6-v2", detail: "Quantized on-device transformer model for zero-cloud latency" },
        { layer: "Parsing Engine", tech: "Python + pdfplumber", detail: "Multi-column layout reconstruction preserving section semantics" },
        { layer: "Explainability Layer", tech: "Cosine Vector Diff", detail: "Translates abstract similarity distances into readable bullet suggestions" }
      ],
      metrics: [
        { label: "Inference Latency", value: "< 1.2s Local" },
        { label: "Data Retention", value: "0% Privacy First" },
        { label: "Parsing Precision", value: "96.4%" }
      ],
      chapters: [
        {
          number: "01",
          title: "Demystifying the ATS Black Box",
          subtitle: "Why percentage scores fail student builders",
          content: "Existing resume review tools generate meaningless numbers like '78% match' without actionable context. Students end up keyword-stuffing resumes rather than articulating their actual engineering contributions. We set out to build an explainable NLP pipeline that highlights specific architectural competencies.",
          takeaway: "Actionable engineering feedback creates far higher candidate growth than superficial keyword scoring."
        },
        {
          number: "02",
          title: "On-Device Privacy & Semantic Vectors",
          subtitle: "Zero cloud upload architecture",
          content: "Resumes contain sensitive personal information including contact details and academic records. We quantized a lightweight transformer to run directly in the client browser runtime via WebAssembly, guaranteeing student documents never leave their machine.",
          takeaway: "Privacy is not a feature; it is an architectural prerequisite."
        }
      ]
    }
  },
  {
    id: "proj_cloud_deployer",
    slug: "cloud-deployer-cli",
    title: "Cloud Deployer CLI",
    tagline: "Zero-configuration cloud infrastructure tool for student projects and hackathon demos.",
    description: "A lightweight CLI that provisions ephemeral preview environments on AWS and Kubernetes with automatic HTTPS and database provisioning in under 90 seconds.",
    problemSolved: "Students waste hours setting up cloud infrastructure and SSL certificates during 24-hour hackathons.",
    category: "Cloud",
    featured: false,
    status: "Looking for Collaborators",
    stage: "CLI Alpha v0.4",
    leadId: "stu_004", // Priya Sharma
    contributorIds: ["stu_004", "stu_006"],
    stack: ["Java", "Spring Boot", "Microservices", "AWS", "Kubernetes", "Docker"],
    collaborationNeeds: "Looking for a Go developer to rewrite the client CLI for ultra-fast startup and smaller binary footprint.",
    openRoles: [
      { role: "Systems Engineer", skill: "Go / Rust CLI", description: "Rewrite terminal client into single static binary" },
      { role: "Technical Writer", skill: "Developer Docs", description: "Write interactive tutorials and terminal asciinema casts" }
    ],
    highlights: [
      "Single-command preview environment generation",
      "Automatic ephemeral cleanup after 48 hours to prevent cloud billing surprises",
      "Native Docker Compose manifest parsing"
    ],
    visualTheme: {
      gradient: "linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)",
      badgeColor: "#059669",
      accentBg: "#ecfdf5",
      svgPattern: "cloud"
    },
    caseStudy: {
      clientContext: "Open Source Campus DevOps Initiative",
      timeline: "3 Months · Systems Architecture",
      role: "Lead Systems Architect & Backend Dev",
      executiveSummary: "Cloud Deployer CLI turns complicated multi-stage Docker Compose setups into one-command ephemeral preview URLs with automatic HTTPS and cost-saving 48-hour garbage collection.",
      challenge: "During 24-hour hackathons, student teams spend up to 4 hours wrestling with AWS IAM roles, ingress controllers, SSL certs, and Postgres database initialization. Worse, forgot-about resources rack up accidental credit card bills.",
      solution: "A declarative CLI tool that parses any `docker-compose.yml`, deploys ephemeral containers to a shared campus Kubernetes cluster, and issues an instant Let's Encrypt HTTPS domain with a guaranteed 48-hour destruction timer.",
      architecture: [
        { layer: "Client Interface", tech: "Terminal CLI", detail: "Single command `tf-deploy` with color-coded live streaming logs" },
        { layer: "Orchestration Control", tech: "Spring Boot + Kubernetes API", detail: "Provisions isolated namespace and ingress routes dynamically" },
        { layer: "Cost Guardrail", tech: "Cron-based Garbage Collector", detail: "Hard TTL limit tearing down idle instances after 48 hours" }
      ],
      metrics: [
        { label: "Deployment Duration", value: "< 85 seconds" },
        { label: "SSL Ingress Setup", value: "Automatic" },
        { label: "TTL Cost Guardrail", value: "48-Hour Hard Stop" }
      ],
      chapters: [
        {
          number: "01",
          title: "Eliminating Hackathon Infrastructure Drag",
          subtitle: "From terminal command to live URL in under 90s",
          content: "Hackathon judging rounds frequently fail because demo environments crash or HTTP mixed-content blocks student presentation links. We focused entirely on the first 90 seconds of developer experience, automating Docker builds, secret injection, and TLS ingress.",
          takeaway: "Automating developer friction frees students to focus on solving actual domain problems."
        }
      ]
    }
  },
  {
    id: "proj_campusnotes",
    slug: "campusnotes-collaborative",
    title: "CampusNotes Collaborative",
    tagline: "Peer-to-peer verified course notes and study guides organized by university syllabus.",
    description: "A collaborative study repository where university students share markdown notes, past year exam solutions, and interactive flashcards with peer upvoting and branch moderation.",
    problemSolved: "Study materials are scattered across Google Drive links, lost Telegram chats, and unorganized folders.",
    category: "Mobile",
    featured: false,
    status: "Looking for Collaborators",
    stage: "Beta Testing",
    leadId: "stu_005", // Karan Patel
    contributorIds: ["stu_005", "stu_002", "stu_003"],
    stack: ["Flutter", "Firebase", "Dart", "REST APIs", "UI/UX"],
    collaborationNeeds: "Looking for student moderators across branches (CS, IT, Design) and a Flutter developer to implement offline caching.",
    openRoles: [
      { role: "Mobile Developer", skill: "Flutter State Mgmt", description: "Optimize Hive DB local cache and markdown rendering" },
      { role: "Branch Moderator", skill: "CS Coursework", description: "Curate verified past exam answer keys and notes" }
    ],
    highlights: [
      "Offline-first synchronization with Hive database",
      "LaTeX math formula and code snippet rendering",
      "Markdown export to PDF and Notion"
    ],
    visualTheme: {
      gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)",
      badgeColor: "#d97706",
      accentBg: "#fffbeb",
      svgPattern: "notes"
    },
    caseStudy: {
      clientContext: "Student Academic Resources Guild",
      timeline: "3 Months · Mobile Architecture",
      role: "Lead Flutter Engineer",
      executiveSummary: "CampusNotes transforms disorganized course drives into a structured, syllabus-indexed peer study repository with mathematical formula rendering and offline availability.",
      challenge: "Before final exams, students waste hours hunting through fractured Telegram channels and unindexed Google Drive folders for syllabus-accurate lecture notes and past papers.",
      solution: "A mobile application mapped directly to university course codes (e.g. CS-301 Operating Systems), allowing students to fork notes, submit corrections, and study offline.",
      architecture: [
        { layer: "App Shell", tech: "Flutter 3.x", detail: "Smooth 60fps scrolling with embedded LaTeX math formula parser" },
        { layer: "Local Database", tech: "Hive NoSQL", detail: "Instant offline access to downloaded study decks" },
        { layer: "Sync Layer", tech: "Firebase Cloud Sync", detail: "Optimistic background sync when campus Wi-Fi reconnects" }
      ],
      metrics: [
        { label: "Offline Storage", value: "< 25MB App Size" },
        { label: "Math Rendering", value: "Native LaTeX" },
        { label: "Course Indexing", value: "100% Syllabus Aligned" }
      ],
      chapters: [
        {
          number: "01",
          title: "Syllabus-Aligned Architecture",
          subtitle: "Solving the unorganized course drive chaos",
          content: "Most note-sharing systems treat all files equally. We structured the database directly around course syllabi, semester terms, and branch divisions, ensuring students find exactly what appears on their syllabus.",
          takeaway: "Domain-specific taxonomy dramatically reduces information retrieval time."
        }
      ]
    }
  },
  {
    id: "proj_inclusive_checkout",
    slug: "inclusive-checkout",
    title: "Inclusive Checkout Design System",
    tagline: "Open-source accessibility kit ensuring e-commerce flows work seamlessly with screen readers.",
    description: "An evidence-based design system containing fully tested accessible React components and Figma variants built specifically for motor-impaired and low-vision college users.",
    problemSolved: "Over 78% of student startup projects fail basic WCAG accessibility tests, excluding users with assistive devices.",
    category: "Design",
    featured: false,
    status: "Active Building",
    stage: "Figma & React Kit",
    leadId: "stu_002", // Aisha Khan
    contributorIds: ["stu_002", "stu_006"],
    stack: ["Figma", "UI Design", "Prototyping", "Design Systems", "User Research", "React"],
    collaborationNeeds: "Seeking visually impaired or assistive technology users for remote usability testing sessions.",
    openRoles: [
      { role: "Accessibility QA", skill: "NVDA & VoiceOver", description: "Perform manual screen reader audits across checkout dialogs" },
      { role: "React Component Author", skill: "Radix UI / ARIA", description: "Code headless accessible primitives and keyboard traps" }
    ],
    highlights: [
      "Zero contrast violations across dark and light modes",
      "Full keyboard navigation with visible focus rings",
      "Audio cues for successful cart transactions"
    ],
    visualTheme: {
      gradient: "linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)",
      badgeColor: "#7c3aed",
      accentBg: "#faf5ff",
      svgPattern: "design"
    },
    caseStudy: {
      clientContext: "Accessible Web Research Guild",
      timeline: "4 Months · Design Systems Research",
      role: "Lead Accessibility Specialist & Design Systems Author",
      executiveSummary: "Inclusive Checkout provides university student founders with turnkey accessible components that pass WCAG 2.1 AAA audits out of the box, guaranteeing equitable digital access.",
      challenge: "Student entrepreneurs launch e-commerce and SaaS projects using off-the-shelf component libraries that ignore screen reader semantics, trap keyboard users in modals, and fail color contrast ratios.",
      solution: "A curated design system of audited accessible forms, checkout sheets, and notification regions paired with automated CI accessibility linters.",
      architecture: [
        { layer: "Figma Tokens", tech: "W3C Design Token Standard", detail: "Color tokens with built-in contrast ratio mathematical checks" },
        { layer: "React Primitives", tech: "WAI-ARIA 1.2 Guidelines", detail: "Proper `aria-live`, focus trapping, and keyboard rove tabs" },
        { layer: "Automated Audit", tech: "axe-core CI Integration", detail: "Zero automated accessibility errors allowed in build pipe" }
      ],
      metrics: [
        { label: "WCAG Compliance", value: "Level AAA Ready" },
        { label: "Keyboard Nav", value: "100% Tab Accessible" },
        { label: "Focus Contrast", value: "> 4.5:1 Minimum" }
      ],
      chapters: [
        {
          number: "01",
          title: "Designing for Every Student",
          subtitle: "Accessibility as a foundational design parameter",
          content: "Digital products built by university students often unintentionally exclude peers with visual impairments or motor challenges. We researched keyboard navigation patterns and developed visible focus rings that feel modern while providing unmissable visual indicators.",
          takeaway: "Accessible design elevates the interaction experience for all users, not just those with assistive devices."
        }
      ]
    }
  },
  {
    id: "proj_ai_screener",
    slug: "ai-resume-screener",
    title: "AI Resume Screener & Parser",
    tagline: "Automated candidate parser extracting verified GitHub and project artifacts from PDF resumes.",
    description: "A machine learning pipeline that parses student PDF resumes and extracts verifiable GitHub repositories, live demo links, and portfolio domains for objective technical screening.",
    problemSolved: "Student hackathon organizers receive hundreds of PDF submissions with broken links and unverifiable claims.",
    category: "AI/ML",
    featured: false,
    status: "Active Building",
    stage: "v1.2 Open Source",
    leadId: "stu_001", // Misthi Rawal
    contributorIds: ["stu_001", "stu_003"],
    stack: ["Python", "Flask", "Pandas", "JavaScript", "SQL"],
    collaborationNeeds: "Looking for a DevOps engineer to containerize the parser with automated GitHub Actions CI.",
    openRoles: [
      { role: "DevOps Engineer", skill: "Docker & CI/CD", description: "Automate container builds and link verification workers" }
    ],
    highlights: [
      "Extracts and pings live demo URLs automatically",
      "Parses complex multi-column PDF layouts with 94% accuracy",
      "Clean REST API endpoints for hackathon dashboards"
    ],
    visualTheme: {
      gradient: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #1e40af 100%)",
      badgeColor: "#2563eb",
      accentBg: "#eff6ff",
      svgPattern: "code"
    },
    caseStudy: {
      clientContext: "Hackathon Organizer Operations Tool",
      timeline: "2 Months · Python Microservice",
      role: "Lead Backend Developer",
      executiveSummary: "An objective evaluation microservice that extracts live code repositories and demo URLs from student hackathon applications, instantly flagging dead links and verifying code contributions.",
      challenge: "Hackathon organizers spend hours manually clicking through hundreds of PDF applications, discovering that half of the submitted GitHub links are 404s or belong to unoriginal cloned templates.",
      solution: "An automated Python link extraction worker that validates domain availability, checks GitHub commit activity, and delivers a clean JSON verification payload.",
      architecture: [
        { layer: "PDF Extractor", tech: "pdfplumber + regex", detail: "Deep link extraction across complex visual column hierarchies" },
        { layer: "Link Auditor", tech: "Asyncio + aiohttp", detail: "Concurrent HTTP status verification checking 100 links/sec" },
        { layer: "API Service", tech: "Flask + Gunicorn", detail: "Lightweight JSON endpoints easily integrated into event dashboards" }
      ],
      metrics: [
        { label: "Parsing Accuracy", value: "94.2%" },
        { label: "Verification Speed", value: "100 links/sec" },
        { label: "Deployment", value: "Docker Ready" }
      ],
      chapters: [
        {
          number: "01",
          title: "Automating Proof-of-Work Verification",
          subtitle: "Focusing on genuine code commits instead of buzzwords",
          content: "Rather than screening candidates by their college brand name, our parser looks directly for proof-of-work: active GitHub repositories, deployed web apps, and verifiable code commits.",
          takeaway: "Direct artifact verification creates the most objective meritocracy for student builders."
        }
      ]
    }
  },
  {
    id: "proj_eventflow",
    slug: "eventflow-campus-hub",
    title: "EventFlow Campus Hub",
    tagline: "Real-time university hackathon, workshop, and club event discovery engine.",
    description: "A centralized campus events feed with RSVP management, team formation boards, and live notifications for college tech fests and guest lectures.",
    problemSolved: "College event notices get buried under spam in official college email inboxes.",
    category: "Web",
    featured: false,
    status: "Looking for Collaborators",
    stage: "In Development",
    leadId: "stu_005", // Karan Patel
    contributorIds: ["stu_005", "stu_004", "stu_001"],
    stack: ["React", "Node.js", "REST APIs", "SQL", "Docker"],
    collaborationNeeds: "Looking for 1 frontend engineer to build the interactive event schedule calendar.",
    openRoles: [
      { role: "Frontend Engineer", skill: "React & Calendar UI", description: "Build interactive agenda calendar with ICS export" }
    ],
    highlights: [
      "One-click calendar sync (Google / Apple Calendar)",
      "Built-in team formation matchmaking chat",
      "Verified club organizer verification checkmarks"
    ],
    visualTheme: {
      gradient: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #3b82f6 100%)",
      badgeColor: "#6366f1",
      accentBg: "#f5f3ff",
      svgPattern: "calendar"
    },
    caseStudy: {
      clientContext: "Student Council & Tech Clubs Consortium",
      timeline: "3 Months · Fullstack Prototype",
      role: "Lead Fullstack Developer",
      executiveSummary: "EventFlow consolidates scattered campus workshops, tech talks, and hackathon schedules into a unified real-time feed with built-in teammate matchmaking boards.",
      challenge: "University clubs post events across Instagram posters, WhatsApp forwards, and campus bulletin boards. Students often miss registration deadlines simply because announcement channels are fragmented.",
      solution: "A centralized campus events board with instant Google Calendar sync, RSVP attendee count tracking, and a dedicated team-formation channel for each hackathon.",
      architecture: [
        { layer: "Client Interface", tech: "React 19 + Tailwind", detail: "Filterable timetable grid with calendar export buttons" },
        { layer: "API Backend", tech: "Node.js Express", detail: "RESTful event ingestion and attendee RSVP counters" },
        { layer: "Database", tech: "PostgreSQL", detail: "Relational event schedules, club organizers, and registrations" }
      ],
      metrics: [
        { label: "Calendar Sync", value: "1-Click iCal/Google" },
        { label: "Event Ingestion", value: "Centralized" },
        { label: "Team Matchmaking", value: "Built-in" }
      ],
      chapters: [
        {
          number: "01",
          title: "Eliminating Campus Information Silos",
          subtitle: "One single source of truth for all college tech activities",
          content: "By centralizing tech club announcements into a clean, searchable directory, EventFlow doubled attendee turnouts for student-led developer workshops.",
          takeaway: "Centralized discovery amplifies campus club participation and peer learning."
        }
      ]
    }
  }
];

/**
 * Returns project by ID or slug.
 */
export function getProjectBySlugOrId(identifier) {
  if (!identifier) return null;
  return (
    projectsData.find((p) => p.slug === identifier || p.id === identifier) ||
    null
  );
}

/**
 * Returns the next project in the catalogue for case study footer navigation.
 */
export function getNextProject(currentId) {
  const currentIndex = projectsData.findIndex(
    (p) => p.id === currentId || p.slug === currentId
  );
  if (currentIndex === -1) return projectsData[0];
  const nextIndex = (currentIndex + 1) % projectsData.length;
  return projectsData[nextIndex];
}

/**
 * Resolves full student objects for given contributor IDs.
 */
export function getProjectContributors(contributorIds = []) {
  return contributorIds
    .map((id) => studentData.find((s) => s.id === id))
    .filter(Boolean);
}

/**
 * Returns the lead student object for a project.
 */
export function getProjectLead(leadId) {
  return studentData.find((s) => s.id === leadId) || null;
}

/**
 * Unique category list.
 */
export const PROJECT_CATEGORIES = [
  "All",
  "Web",
  "AI/ML",
  "Mobile",
  "Cloud",
  "Design"
];

/**
 * Popular technology tags extracted dynamically.
 */
export const POPULAR_TECH_TAGS = [
  "All Tech",
  "React",
  "Python",
  "Flutter",
  "Figma",
  "Node.js",
  "AWS",
  "Docker",
  "SQL"
];
