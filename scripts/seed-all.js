#!/usr/bin/env node

const BASE = 'http://localhost:3001/api'

async function api(method, path, data) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(data ? { body: JSON.stringify(data) } : {}),
  })
  const json = await res.json()
  if (!res.ok) {
    const msg = json.message || json.error || `${method} ${path} → ${res.status}`
    throw new Error(msg)
  }
  return json
}

async function clearCollection(slug) {
  const res = await fetch(`${BASE}/${slug}?limit=200`, { headers: { 'Content-Type': 'application/json' } })
  const json = await res.json().catch(() => ({}))
  const docs = json.docs ?? []
  for (const doc of docs) {
    await fetch(`${BASE}/${slug}/${doc.id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' } })
  }
  if (docs.length) console.log(`  ✗ cleared ${docs.length} existing`)
}

async function seedCollection(slug, items) {
  console.log(`\nSeeding ${slug}…`)
  await clearCollection(slug)
  let created = 0, skipped = 0
  for (const item of items) {
    try {
      await api('POST', `/${slug}`, item)
      created++
    } catch (e) {
      console.warn(`  ⚠ ${e.message}`)
      skipped++
    }
  }
  console.log(`  ✓ ${created} created, ${skipped} skipped`)
}

// ── Users ──────────────────────────────────────────────────────────────────
const USERS = [
  { email: 'admin@techfronthub.com',      password: 'Admin@2026',      name: 'Admin User',      role: 'admin',      status: 'active', phone: '+234 800 000 0001' },
  { email: 'instructor@techfronthub.com', password: 'Instructor@2026', name: 'Instructor User', role: 'instructor', status: 'active', phone: '+234 800 000 0002' },
]


// ── Courses ────────────────────────────────────────────────────────────────
const COURSES = [
  { category: 24, tag: 'BOOTCAMP',    tagHot: true,  code: 'DA-201',   title: 'Data Analytics Bootcamp',        desc: 'Master Excel, SQL, Power BI and Python for real-world business analysis.',                    duration: '12 weeks', lessons: 86,  level: 'Intermediate', price: '₦185,000', old: '₦250,000' },
  { category: 23, tag: 'NEW',         tagHot: false, code: 'AI-110',   title: 'Applied AI & Automation',         desc: 'Build practical AI agents, prompt systems and automations for business.',                     duration: '8 weeks',  lessons: 62,  level: 'All levels',   price: '₦220,000', old: null },
  { category: 25, tag: 'POPULAR',     tagHot: true,  code: 'DVOP-305', title: 'DevOps Engineering Track',        desc: 'Linux, Git, Docker, Kubernetes, CI/CD and cloud deployment in one program.',                  duration: '14 weeks', lessons: 104, level: 'Advanced',     price: '₦265,000', old: '₦320,000' },
  { category: 27, tag: 'LIVE',        tagHot: false, code: 'WEB-140',  title: 'Full-Stack Web Development',      desc: 'HTML/CSS, JavaScript, React, Node and databases — ship a real product.',                      duration: '16 weeks', lessons: 120, level: 'Beginner',     price: '₦195,000', old: null },
  { category: 26, tag: 'BOOTCAMP',    tagHot: false, code: 'DM-070',   title: 'Digital Marketing Mastery',       desc: 'SEO, paid ads, content, email and analytics — end-to-end playbook.',                         duration: '6 weeks',  lessons: 48,  level: 'Beginner',     price: '₦95,000',  old: '₦130,000' },
  { category: 28, tag: 'BOOTCAMP',    tagHot: false, code: 'KIDS-020', title: 'Tech for Kids (Ages 8–14)',       desc: 'Scratch, Python and robotics fundamentals through projects and play.',                        duration: '10 weeks', lessons: 40,  level: 'Beginner',     price: '₦75,000',  old: null },
  { category: 29, tag: 'ADVANCED',    tagHot: false, code: 'HR-150',   title: 'HR Tech & People Analytics',      desc: 'Modern HR tooling, analytics dashboards and workforce reporting.',                             duration: '8 weeks',  lessons: 54,  level: 'Intermediate', price: '₦160,000', old: null },
  { category: 30, tag: 'NEW',         tagHot: true,  code: 'SEC-200',  title: 'Cybersecurity Fundamentals',      desc: 'Threat modelling, network defence, ethical hacking basics and compliance.',                   duration: '10 weeks', lessons: 72,  level: 'Intermediate', price: '₦210,000', old: '₦260,000' },
  { category: 31, tag: 'BOOTCAMP',    tagHot: false, code: 'CLD-180',  title: 'Cloud Computing (AWS)',           desc: 'EC2, S3, Lambda, RDS and serverless — architect and deploy on AWS.',                         duration: '12 weeks', lessons: 90,  level: 'Intermediate', price: '₦240,000', old: null },
  { category: 32, tag: 'POPULAR',     tagHot: true,  code: 'PY-130',   title: 'Python for Data Science',         desc: 'NumPy, Pandas, Matplotlib, Scikit-learn and real ML projects from scratch.',                  duration: '10 weeks', lessons: 78,  level: 'Beginner',     price: '₦155,000', old: '₦200,000' },
  { category: 33, tag: 'BOOTCAMP',    tagHot: false, code: 'UX-090',   title: 'UI/UX Design Fundamentals',       desc: 'Figma, design systems, user research and end-to-end product prototyping.',                    duration: '8 weeks',  lessons: 58,  level: 'Beginner',     price: '₦130,000', old: null },
]

// ── Categories ─────────────────────────────────────────────────────────────
const CATEGORIES = [
  { n: '01', title: 'AI & Automation',    desc: 'LLMs, agents, workflow automation',      count: '12 courses', icon: 'Cpu'       },
  { n: '02', title: 'Data Analytics',     desc: 'SQL, Power BI, Python, dashboards',      count: '18 courses', icon: 'BarChart'  },
  { n: '03', title: 'DevOps',             desc: 'Docker, Kubernetes, CI/CD, cloud',       count: '9 courses',  icon: 'GitBranch' },
  { n: '04', title: 'Digital Marketing',  desc: 'SEO, paid media, content, email',        count: '11 courses', icon: 'Megaphone' },
  { n: '05', title: 'Web Development',    desc: 'Frontend, backend, full-stack',          count: '16 courses', icon: 'Code'      },
  { n: '06', title: 'Tech for Kids',      desc: 'Scratch, Python, robotics',              count: '6 courses',  icon: 'Puzzle'    },
  { n: '07', title: 'HR Tech',            desc: 'People analytics, HRIS, reporting',      count: '5 courses',  icon: 'Users'     },
  { n: '08', title: 'Cybersecurity',      desc: 'Blue team, red team, compliance',        count: '7 courses',  icon: 'Target'    },
  { n: '09', title: 'Cloud Computing',    desc: 'AWS, Azure, GCP, serverless',            count: '8 courses',  icon: 'Zap'       },
  { n: '10', title: 'Python Programming', desc: 'Scripting, automation, data, ML',        count: '10 courses', icon: 'Code'      },
  { n: '11', title: 'UI/UX Design',       desc: 'Figma, design systems, user research',   count: '5 courses',  icon: 'Briefcase' },
]

// ── Testimonials ───────────────────────────────────────────────────────────
const TESTIMONIALS = [
  { name: 'Funke Adebisi',    role: 'Data Analyst, Sterling Bank',        initials: 'FA', quote: `I walked in with Excel basics and walked out running Power BI dashboards for my team. The bootcamp is relentless in the best way.` },
  { name: 'Tunde Olawale',    role: 'DevOps Engineer, Flutterwave',        initials: 'TO', quote: `The DevOps track mirrored exactly what we use in production. I shipped my first CI/CD pipeline three weeks in and got promoted in four months.` },
  { name: 'Amaka Okonkwo',    role: 'Founder, Trellis Studio',             initials: 'AO', quote: `As a non-technical founder, the AI & Automation course gave me leverage I didn't know existed. It quietly became the best business investment of the year.` },
  { name: 'Chidi Nwosu',      role: 'Software Engineer, Andela',           initials: 'CN', quote: `Full-Stack at TECHFRONT is no joke — 16 weeks, real deadlines, real code reviews. I shipped a product that's now live. Andela hired me two months later.` },
  { name: 'Ngozi Eze',        role: 'Digital Marketer, Paystack',          initials: 'NE', quote: `My ad ROAS went from 1.2x to 4.7x after finishing the Digital Marketing course. The instructors teach tactics that actually work right now, not last year.` },
  { name: 'Emeka Okafor',     role: 'Cloud Engineer, MTN Nigeria',         initials: 'EO', quote: `I passed my AWS Solutions Architect exam on the first attempt after the Cloud Computing track. The course maps directly to the certification objectives.` },
  { name: 'Aisha Mohammed',   role: 'People Analytics Lead, Access Bank',  initials: 'AM', quote: `HR Tech transformed how I present workforce data to the board. I built a live headcount dashboard in week four — it's now standard across our department.` },
  { name: 'Seun Adeyemi',     role: 'Python Developer, Interswitch',       initials: 'SA', quote: `Python for Data Science is the clearest path from zero to machine learning I've found. The project-based approach means you build something you can actually show.` },
  { name: 'Bola Fashola',     role: 'Cybersecurity Analyst, Zenith Bank',  initials: 'BF', quote: `The Cybersecurity course is intense and current. We covered real CVEs and live attack simulations. It prepared me for the job better than any cert prep course.` },
  { name: 'Kemi Adeoye',      role: 'UX Designer, Cowrywise',             initials: 'KA', quote: `I switched from graphic design to product UX after finishing the UI/UX track. Six months later I'm leading design for a fintech with 800k users.` },
]

// ── Packages ───────────────────────────────────────────────────────────────
const PACKAGES = [
  {
    icon: 'Briefcase', featured: false, badge: null,
    name: 'Professional Training', desc: 'Structured cohort programs with certification and career support.',
    price: 'from ₦185,000', per: 'per program',
    features: [
      { feature: 'Cohort-based with live instructors' },
      { feature: 'Industry certification on completion' },
      { feature: 'CV clinics & mock interviews' },
      { feature: 'Partner-company referrals' },
    ], sortOrder: 1,
  },
  {
    icon: 'User', featured: true, badge: 'MOST POPULAR',
    name: 'Private Lessons', desc: '1-on-1 coaching matched to your schedule and learning pace.',
    price: '₦25,000', per: 'per hour',
    features: [
      { feature: 'Dedicated senior instructor' },
      { feature: 'Flexible weekday/weekend slots' },
      { feature: 'Custom curriculum for your goal' },
      { feature: 'Recorded sessions & playbooks' },
    ], sortOrder: 2,
  },
  {
    icon: 'Building', featured: false, badge: null,
    name: 'Corporate Training', desc: 'Upskill full teams with programs tailored to your stack.',
    price: 'Custom quote', per: '10+ seats',
    features: [
      { feature: 'On-site or remote delivery' },
      { feature: 'Custom curriculum & materials' },
      { feature: 'Skills assessment reports' },
      { feature: 'Dedicated account manager' },
    ], sortOrder: 3,
  },
  {
    icon: 'ShoppingBag', featured: false, badge: null,
    name: 'Self-Paced Courses', desc: 'Buy any course once and keep lifetime access.',
    price: 'from ₦45,000', per: 'per course',
    features: [
      { feature: 'Lifetime updates & access' },
      { feature: 'Downloadable resources' },
      { feature: 'Certificate of completion' },
      { feature: 'Community Slack access' },
    ], sortOrder: 4,
  },
  {
    icon: 'Zap', featured: false, badge: 'FAST TRACK',
    name: 'Weekend Intensive', desc: '2-day deep-dive workshops on focused topics.',
    price: '₦55,000', per: 'per workshop',
    features: [
      { feature: 'Saturday & Sunday delivery' },
      { feature: 'Small groups (max 15)' },
      { feature: 'Hands-on project work' },
      { feature: 'Post-workshop resources' },
    ], sortOrder: 5,
  },
  {
    icon: 'Target', featured: false, badge: null,
    name: 'Certification Prep', desc: 'Targeted exam preparation for AWS, Google, Microsoft and more.',
    price: 'from ₦80,000', per: 'per certification',
    features: [
      { feature: 'Exam-aligned curriculum' },
      { feature: 'Mock exams with detailed feedback' },
      { feature: 'Study guides & cheat sheets' },
      { feature: 'Exam booking support' },
    ], sortOrder: 6,
  },
  {
    icon: 'Users', featured: false, badge: null,
    name: 'Group Bootcamp', desc: 'Join a cohort of peers and learn collaboratively.',
    price: 'from ₦120,000', per: 'per bootcamp',
    features: [
      { feature: 'Peer-driven learning environment' },
      { feature: 'Group projects & code reviews' },
      { feature: 'Weekly instructor-led sessions' },
      { feature: 'Graduation showcase event' },
    ], sortOrder: 7,
  },
  {
    icon: 'Crown', featured: false, badge: 'PREMIUM',
    name: 'Executive Workshop', desc: 'High-impact half-day sessions for C-suite and senior leaders.',
    price: '₦150,000', per: 'per person',
    features: [
      { feature: 'Max 8 participants per session' },
      { feature: 'Strategic, non-technical framing' },
      { feature: 'Case studies from Nigerian enterprises' },
      { feature: 'Private briefing materials' },
    ], sortOrder: 8,
  },
  {
    icon: 'Briefcase', featured: false, badge: null,
    name: 'Scholarship Programme', desc: 'Need-based funding covering up to 70% of course fees.',
    price: 'from ₦0', per: 'income-assessed',
    features: [
      { feature: 'Application open quarterly' },
      { feature: 'Merit + need assessment' },
      { feature: 'Full programme access when awarded' },
      { feature: 'Mentorship during the track' },
    ], sortOrder: 9,
  },
  {
    icon: 'Star', featured: false, badge: 'BEST VALUE',
    name: 'Combo Bundle', desc: 'Stack two or more courses at a significant combined discount.',
    price: 'from ₦280,000', per: 'for 2 courses',
    features: [
      { feature: '20–35% off second course' },
      { feature: 'Flexible scheduling across tracks' },
      { feature: 'Priority enrolment guarantee' },
      { feature: 'Joint certificate of achievement' },
    ], sortOrder: 10,
  },
]

// ── Udemy Courses ──────────────────────────────────────────────────────────
const UDEMY = [
  { title: 'The Complete Python Pro Masterclass',       author: 'Adebayo O. · TECHFRONT',  rating: 4.8, count: '12,840', hours: '38.5 hrs', price: '₦7,500',  udemyUrl: 'https://www.udemy.com/course/complete-python-pro-masterclass/', sortOrder: 1 },
  { title: 'Power BI for Business Analysts',            author: 'Chioma E. · TECHFRONT',   rating: 4.7, count: '6,210',  hours: '22 hrs',   price: '₦6,500',  udemyUrl: 'https://www.udemy.com/course/power-bi-for-business-analysts/',  sortOrder: 2 },
  { title: 'AWS Certified Solutions Architect',         author: 'Ibrahim K. · TECHFRONT',  rating: 4.9, count: '18,902', hours: '41 hrs',   price: '₦9,000',  udemyUrl: 'https://www.udemy.com/course/aws-certified-solutions-architect-associate/', sortOrder: 3 },
  { title: 'ChatGPT & AI Automation for Work',          author: 'Tola A. · TECHFRONT',     rating: 4.8, count: '9,470',  hours: '14.5 hrs', price: '₦6,000',  udemyUrl: 'https://www.udemy.com/course/chatgpt-ai-automation-for-work/',  sortOrder: 4 },
  { title: 'SQL for Absolute Beginners',                author: 'Chioma E. · TECHFRONT',   rating: 4.6, count: '4,380',  hours: '11 hrs',   price: '₦5,000',  udemyUrl: 'https://www.udemy.com/course/sql-for-absolute-beginners/',      sortOrder: 5 },
  { title: 'Docker & Kubernetes in Practice',           author: 'Ibrahim K. · TECHFRONT',  rating: 4.8, count: '7,650',  hours: '29 hrs',   price: '₦8,000',  udemyUrl: 'https://www.udemy.com/course/docker-kubernetes-in-practice/',   sortOrder: 6 },
  { title: 'Digital Marketing from Scratch',            author: 'Funmi B. · TECHFRONT',    rating: 4.5, count: '3,210',  hours: '18 hrs',   price: '₦5,500',  udemyUrl: 'https://www.udemy.com/course/digital-marketing-from-scratch/', sortOrder: 7 },
  { title: 'Excel for Data Analysis',                   author: 'Adebayo O. · TECHFRONT',  rating: 4.7, count: '8,940',  hours: '16 hrs',   price: '₦5,500',  udemyUrl: 'https://www.udemy.com/course/excel-for-data-analysis/',         sortOrder: 8 },
  { title: 'React & Next.js Full-Stack Bootcamp',       author: 'Seun K. · TECHFRONT',     rating: 4.8, count: '5,520',  hours: '34 hrs',   price: '₦7,500',  udemyUrl: 'https://www.udemy.com/course/react-nextjs-full-stack-bootcamp/', sortOrder: 9 },
  { title: 'Cybersecurity Essentials for Beginners',    author: 'Bayo M. · TECHFRONT',     rating: 4.6, count: '2,890',  hours: '20 hrs',   price: '₦6,500',  udemyUrl: 'https://www.udemy.com/course/cybersecurity-essentials-beginners/', sortOrder: 10 },
]

// ── Site Config ────────────────────────────────────────────────────────────
const SITE_CONFIG = {
  heroBadge:      'Live cohort · June 3 intake open',
  heroHeadline:   'Future-ready digital skills for career, business & innovation.',
  heroLede:       'TECHFRONT HUB trains Nigeria\'s next generation of data analysts, engineers and builders — through cohort-based bootcamps, 1-on-1 coaching and corporate programs designed around real hiring signals.',
  statLearners:   '12,400+',
  statCourses:    '48',
  statPlacement:  '87%',
  statRating:     '4.8★',
  trustedCompanies: [
    { name: 'Sterling Bank' }, { name: 'Flutterwave' }, { name: 'MTN' },
    { name: 'Access Holdings' }, { name: 'Paystack' }, { name: 'Andela' }, { name: 'Interswitch' },
  ],
  ctaHeadline: 'Start your tech journey today.',
  ctaBody:     'Join 12,400+ learners who traded uncertain futures for working careers in data, engineering and AI.',
}

// ── Instructors ───────────────────────────────────────────────────────────
const INSTRUCTORS = [
  { 
    email: 'instructor@techfronthub.ng', 
    password: 'Instructor123!',
    name: 'Main Instructor (NG)',
    expertise: 'Full-Stack Development, Data Science'
  },
  { 
    email: 'instructor@techfronthub.com', 
    password: 'Instructor123!',
    name: 'Main Instructor (COM)',
    expertise: 'Full-Stack Development, Data Science'
  },
]

async function run() {
  console.log('TECHFRONT HUB — Seed Script')
  console.log('============================')
  console.log('Target:', BASE)

  try {
    await seedCollection('users', USERS)
    await seedCollection('instructors', INSTRUCTORS)
    await seedCollection('categories', CATEGORIES)
    await seedCollection('courses', COURSES)
    await seedCollection('testimonials', TESTIMONIALS)
    await seedCollection('packages', PACKAGES)
    await seedCollection('udemy-courses', UDEMY)

    console.log('\nSeeding globals/site-config…')
    try {
      await api('POST', '/globals/site-config', SITE_CONFIG)
      console.log('  ✓ site-config updated')
    } catch (e) {
      console.warn('  ⚠', e.message)
    }

    console.log('\n✓ Seed complete.')
    console.log('\nAdmin login:      admin@techfronthub.com / Admin@2026')
    console.log('Instructor login: instructor@techfronthub.ng / Instructor123!')
  } catch (e) {
    console.error('\n✗ Fatal:', e.message)
    process.exit(1)
  }
}

run()
