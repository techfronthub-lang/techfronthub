#!/usr/bin/env node

const DEFAULT_BASE = process.env.SEED_BASE_URL || 'http://localhost:3001/api'

function parseArgs(argv) {
  const args = { base: DEFAULT_BASE, overwrite: false, ids: null, limit: 200 }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--overwrite' || a === '-o') args.overwrite = true
    else if (a === '--base') args.base = argv[++i] || args.base
    else if (a === '--limit') args.limit = Number(argv[++i] || args.limit)
    else if (a === '--ids') args.ids = String(argv[++i] || '').split(',').map(s => s.trim()).filter(Boolean)
  }
  return args
}

async function api(base, method, path, data) {
  const res = await fetch(`${base}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(data ? { body: JSON.stringify(data) } : {}),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = json.message || json.error || `${method} ${path} -> ${res.status}`
    throw new Error(msg)
  }
  return json
}

function cleanPriceToNairaString(value) {
  if (!value) return null
  // Handles mojibake variants ("â‚¦") and real Naira symbol.
  return String(value)
    .replace(/â‚¦/g, '₦')
    .replace(/Ã¢Â‚Â¦/g, '₦')
    .trim()
}

function pickTrack(course) {
  const title = String(course?.title || '').toLowerCase()
  const category = String(course?.category?.title || '').toLowerCase()
  const hay = `${title} ${category}`

  if (hay.includes('ui') || hay.includes('ux') || hay.includes('figma')) return 'uiux'
  if (hay.includes('python') || hay.includes('data science')) return 'python'
  if (hay.includes('data analytics') || hay.includes('power bi') || hay.includes('sql')) return 'data'
  if (hay.includes('devops') || hay.includes('kubernetes') || hay.includes('docker')) return 'devops'
  if (hay.includes('cloud') || hay.includes('aws') || hay.includes('azure')) return 'cloud'
  if (hay.includes('cyber') || hay.includes('security')) return 'security'
  if (hay.includes('marketing') || hay.includes('seo')) return 'marketing'
  if (hay.includes('kids') || hay.includes('scratch')) return 'kids'
  if (hay.includes('hr') || hay.includes('people')) return 'hr'
  if (hay.includes('web') || hay.includes('full-stack') || hay.includes('javascript') || hay.includes('react')) return 'web'
  if (hay.includes('ai') || hay.includes('automation') || hay.includes('agent')) return 'ai'
  return 'general'
}

function makeCourseMeta(course) {
  const price = cleanPriceToNairaString(course?.price)
  const level = course?.level || 'All levels'
  const duration = course?.duration || 'Flexible'
  return {
    format: 'Cohort-based online training with guided projects',
    certificate: 'Yes - certificate issued after successful completion',
    guarantee: 'Portfolio-ready capstone project and guided reviews',
    support: 'Weekly mentor feedback, peer community support, downloadable templates, and progress check-ins.',
    lessons: 6,
    whatYouLearn: [
      { benefit: 'Understand core concepts and apply them in practical exercises' },
      { benefit: 'Build a portfolio-ready mini project and a capstone deliverable' },
      { benefit: 'Develop a repeatable workflow you can use in real jobs' },
      { benefit: 'Prepare for assessments and certificate completion requirements' },
    ],
    whoThisIsFor: [
      { audience: 'Beginners starting this track' },
      { audience: 'Working professionals upskilling for better roles' },
      { audience: 'Career switchers building a portfolio' },
    ],
    programOverview: [
      { week: 'Week 1', title: 'Foundations', description: `Core concepts, tools, and setup. (${level})` },
      { week: 'Week 2', title: 'Practice', description: 'Hands-on exercises and guided walkthroughs.' },
      { week: 'Week 3', title: 'Build', description: 'Build a real mini-project with feedback.' },
      { week: 'Week 4', title: 'Ship', description: 'Polish, document, and prepare deliverables.' },
      { week: 'Week 5', title: 'Capstone', description: 'Capstone project scope and execution plan.' },
      { week: 'Week 6', title: 'Review', description: `Final review, iteration, and certificate criteria. (${duration})` },
    ],
    // Stored for reference in lesson content.
    _meta: { price, level, duration },
  }
}

function trackLessons(track, course) {
  const { _meta } = makeCourseMeta(course)
  const base = {
    videoUrls: [],
    resources: [],
  }

  // Keep this content platform-friendly and non-copyrighted.
  const byTrack = {
    uiux: [
      { title: 'Lesson 1: Product Design Foundations', duration: '40 min', summary: 'What UI/UX is and how product teams work.', content: 'Topics:\n- UI vs UX\n- Product thinking\n- Design process\n\nExercise:\nWrite a problem statement for a learning product.' },
      { title: 'Lesson 2: Research and Problem Framing', duration: '55 min', summary: 'Personas, pain points, and opportunities.', content: 'Topics:\n- Interview basics\n- Insights\n- Personas\n\nExercise:\nCreate a persona and list 5 pain points.' },
      { title: 'Lesson 3: Wireframes and Flows', duration: '60 min', summary: 'Information architecture and wireframing.', content: 'Topics:\n- User flows\n- Wireframe fidelity\n\nExercise:\nSketch onboarding + course browsing flow.' },
      { title: 'Lesson 4: Visual UI in Figma', duration: '70 min', summary: 'Typography, color, spacing, and components.', content: 'Topics:\n- Layout and hierarchy\n- Component basics\n\nExercise:\nCreate a home screen and course detail screen.' },
      { title: 'Lesson 5: Prototyping and Handoff', duration: '58 min', summary: 'Interactive prototypes and delivery.', content: 'Topics:\n- Prototype flows\n- Handoff notes\n\nExercise:\nBuild a clickable prototype for a full journey.' },
      { title: 'Lesson 6: Portfolio Case Study', duration: '45 min', summary: 'Present the work as a case study.', content: 'Topics:\n- Structure\n- Rationale\n- Outcomes\n\nDeliverable:\nA portfolio-ready case study.' },
    ],
    web: [
      { title: 'Lesson 1: Web Foundations', duration: '50 min', summary: 'How the web works, tooling, and fundamentals.', content: 'Topics:\n- HTTP basics\n- HTML/CSS structure\n- JavaScript overview\n\nExercise:\nBuild a simple landing page section.' },
      { title: 'Lesson 2: Modern Frontend Workflow', duration: '60 min', summary: 'Components, state, and UI patterns.', content: 'Topics:\n- Component thinking\n- State and props\n\nExercise:\nBuild a card list + detail view.' },
      { title: 'Lesson 3: Backend and APIs', duration: '70 min', summary: 'APIs, auth, and data flow.', content: 'Topics:\n- REST basics\n- Auth tokens\n\nExercise:\nDesign an API contract for courses + enrollments.' },
      { title: 'Lesson 4: Databases and Models', duration: '55 min', summary: 'Data modeling and persistence.', content: 'Topics:\n- Relationships\n- CRUD patterns\n\nExercise:\nModel users, courses, enrollments.' },
      { title: 'Lesson 5: Ship and Deploy', duration: '50 min', summary: 'Deployment, env vars, and basic ops.', content: `Topics:\n- Environments\n- CI basics\n\nExercise:\nWrite a deployment checklist.\n\nNote: duration=${_meta.duration}` },
      { title: 'Lesson 6: Capstone Build', duration: '80 min', summary: 'Plan and build a portfolio project.', content: 'Deliverable:\nA full-stack mini app with auth and a dashboard.' },
    ],
    data: [
      { title: 'Lesson 1: Data Foundations', duration: '45 min', summary: 'Data types, metrics, and business questions.', content: 'Topics:\n- Metrics vs dimensions\n- Data quality\n\nExercise:\nDefine KPIs for a learning platform.' },
      { title: 'Lesson 2: SQL Basics', duration: '60 min', summary: 'Queries, joins, and analysis patterns.', content: 'Topics:\n- SELECT\n- JOIN\n- GROUP BY\n\nExercise:\nWrite queries for enrollments and revenue.' },
      { title: 'Lesson 3: Dashboards and Reporting', duration: '55 min', summary: 'Storytelling with dashboards.', content: 'Topics:\n- Charts\n- Filters\n\nExercise:\nSketch a dashboard layout.' },
      { title: 'Lesson 4: Spreadsheet + BI Workflow', duration: '50 min', summary: 'Practical workflows for analysis.', content: 'Topics:\n- Cleaning\n- Aggregation\n\nExercise:\nCreate a cohort completion report.' },
      { title: 'Lesson 5: Case Study Build', duration: '70 min', summary: 'Build a report with narrative.', content: 'Deliverable:\nA complete analytics report.' },
      { title: 'Lesson 6: Interview Prep + Portfolio', duration: '45 min', summary: 'Presenting your work professionally.', content: 'Topics:\n- Tradeoffs\n- Assumptions\n\nDeliverable:\nA portfolio write-up.' },
    ],
    ai: [
      { title: 'Lesson 1: AI Systems Overview', duration: '45 min', summary: 'Where AI fits into products safely.', content: 'Topics:\n- Use cases\n- Limitations\n\nExercise:\nList 5 automations for a learning platform.' },
      { title: 'Lesson 2: Prompting and Evaluation', duration: '55 min', summary: 'Prompt patterns and testing.', content: 'Topics:\n- Inputs/outputs\n- Evaluation\n\nExercise:\nWrite prompts for course summarization.' },
      { title: 'Lesson 3: Automation Workflows', duration: '50 min', summary: 'Trigger-action pipelines.', content: 'Topics:\n- Webhooks\n- Schedulers\n\nExercise:\nDesign an enrollment follow-up automation.' },
      { title: 'Lesson 4: Guardrails and Safety', duration: '45 min', summary: 'Risk controls and monitoring.', content: 'Topics:\n- Policy\n- Logging\n\nExercise:\nDefine safe output constraints.' },
      { title: 'Lesson 5: Build a Small Agent', duration: '65 min', summary: 'Implement a scoped assistant.', content: 'Deliverable:\nA scoped helper for student support.' },
      { title: 'Lesson 6: Capstone Automation', duration: '70 min', summary: 'Ship a working automation.', content: 'Deliverable:\nA complete automation with reporting.' },
    ],
    devops: [
      { title: 'Lesson 1: Linux and Networking Basics', duration: '55 min', summary: 'Core ops concepts.', content: 'Topics:\n- Processes\n- Ports\n\nExercise:\nDiagnose a server port issue.' },
      { title: 'Lesson 2: Containers', duration: '60 min', summary: 'Docker fundamentals.', content: 'Topics:\n- Images\n- Volumes\n\nExercise:\nContainerize a small web app.' },
      { title: 'Lesson 3: CI/CD Pipelines', duration: '70 min', summary: 'Build pipelines and releases.', content: 'Topics:\n- Build/test\n- Deploy\n\nExercise:\nWrite a pipeline plan.' },
      { title: 'Lesson 4: Kubernetes Intro', duration: '60 min', summary: 'Deploy workloads.', content: 'Topics:\n- Pods\n- Services\n\nExercise:\nSketch a deployment topology.' },
      { title: 'Lesson 5: Observability', duration: '50 min', summary: 'Logs, metrics, alerts.', content: 'Topics:\n- Monitoring\n- Alerting\n\nExercise:\nDefine SLOs for an app.' },
      { title: 'Lesson 6: Capstone Deployment', duration: '80 min', summary: 'Ship a real deployment.', content: 'Deliverable:\nA deployed app with monitoring.' },
    ],
    cloud: [
      { title: 'Lesson 1: Cloud Core Concepts', duration: '45 min', summary: 'Regions, IAM, compute, storage.', content: 'Topics:\n- IAM\n- Networking\n\nExercise:\nMap resources for a web app.' },
      { title: 'Lesson 2: Compute + Storage', duration: '55 min', summary: 'EC2/S3 patterns.', content: 'Topics:\n- Instances\n- Buckets\n\nExercise:\nDesign a static + API setup.' },
      { title: 'Lesson 3: Databases', duration: '55 min', summary: 'Managed database basics.', content: 'Topics:\n- Backups\n- Scaling\n\nExercise:\nChoose a DB pattern for enrollments.' },
      { title: 'Lesson 4: Serverless', duration: '50 min', summary: 'Functions and events.', content: 'Topics:\n- Triggers\n- Costs\n\nExercise:\nDesign a webhook handler.' },
      { title: 'Lesson 5: Security and Best Practices', duration: '45 min', summary: 'Secure configurations.', content: 'Topics:\n- Secrets\n- Policies\n\nExercise:\nWrite a security checklist.' },
      { title: 'Lesson 6: Capstone Architecture', duration: '70 min', summary: 'Build the full architecture.', content: 'Deliverable:\nA complete architecture diagram.' },
    ],
    security: [
      { title: 'Lesson 1: Security Fundamentals', duration: '45 min', summary: 'Threats and controls.', content: 'Topics:\n- CIA triad\n- Common attacks\n\nExercise:\nThreat-model a login flow.' },
      { title: 'Lesson 2: Network Basics', duration: '55 min', summary: 'Ports, firewalls, and traffic.', content: 'Topics:\n- TCP/UDP\n- TLS\n\nExercise:\nList common ports and uses.' },
      { title: 'Lesson 3: App Security', duration: '60 min', summary: 'OWASP basics.', content: 'Topics:\n- Injection\n- Auth\n\nExercise:\nFind security risks in a simple form flow.' },
      { title: 'Lesson 4: Monitoring and Incident Response', duration: '50 min', summary: 'Logging and response.', content: 'Topics:\n- Logs\n- Triage\n\nExercise:\nWrite an incident checklist.' },
      { title: 'Lesson 5: Defensive Controls', duration: '55 min', summary: 'Hardening and policy.', content: 'Topics:\n- Least privilege\n- MFA\n\nExercise:\nDefine a hardening plan.' },
      { title: 'Lesson 6: Capstone Security Review', duration: '65 min', summary: 'Audit a system.', content: 'Deliverable:\nA security review report.' },
    ],
    marketing: [
      { title: 'Lesson 1: Marketing Foundations', duration: '40 min', summary: 'Goals, audiences, positioning.', content: 'Topics:\n- Positioning\n- Funnels\n\nExercise:\nWrite a value proposition.' },
      { title: 'Lesson 2: Content Strategy', duration: '50 min', summary: 'Content plan and distribution.', content: 'Topics:\n- Content calendar\n- Offers\n\nExercise:\nDraft a 4-week plan.' },
      { title: 'Lesson 3: Paid Ads Basics', duration: '55 min', summary: 'Campaign structure and testing.', content: 'Topics:\n- Targeting\n- Creatives\n\nExercise:\nDesign a simple ad test.' },
      { title: 'Lesson 4: SEO and Growth', duration: '45 min', summary: 'Search basics.', content: 'Topics:\n- Keywords\n- On-page\n\nExercise:\nList 10 keywords.' },
      { title: 'Lesson 5: Analytics', duration: '50 min', summary: 'Track outcomes.', content: 'Topics:\n- Attribution\n- KPIs\n\nExercise:\nDefine a tracking plan.' },
      { title: 'Lesson 6: Capstone Campaign', duration: '70 min', summary: 'Ship a campaign.', content: 'Deliverable:\nA complete campaign plan.' },
    ],
    kids: [
      { title: 'Lesson 1: Getting Started', duration: '30 min', summary: 'Intro to building with blocks.', content: 'Topics:\n- Basics\n- Projects\n\nActivity:\nBuild a simple animation.' },
      { title: 'Lesson 2: Logic and Loops', duration: '35 min', summary: 'Control flow.', content: 'Activity:\nMake a character move with loops.' },
      { title: 'Lesson 3: Variables', duration: '35 min', summary: 'Store values.', content: 'Activity:\nBuild a score counter.' },
      { title: 'Lesson 4: Simple Games', duration: '40 min', summary: 'Make a small game.', content: 'Activity:\nBuild a clicker game.' },
      { title: 'Lesson 5: Design and Creativity', duration: '35 min', summary: 'Add art and sound.', content: 'Activity:\nDesign your own characters.' },
      { title: 'Lesson 6: Final Project', duration: '45 min', summary: 'Create a project.', content: 'Deliverable:\nA finished mini game.' },
    ],
    hr: [
      { title: 'Lesson 1: HR Metrics', duration: '40 min', summary: 'Workforce metrics.', content: 'Exercise:\nDefine turnover and retention metrics.' },
      { title: 'Lesson 2: Data Sources', duration: '45 min', summary: 'HRIS and reporting.', content: 'Exercise:\nMap HR data sources.' },
      { title: 'Lesson 3: Dashboards', duration: '55 min', summary: 'Build dashboards.', content: 'Exercise:\nSketch a people dashboard.' },
      { title: 'Lesson 4: Analysis', duration: '55 min', summary: 'Analyze patterns.', content: 'Exercise:\nAnalyze absenteeism patterns.' },
      { title: 'Lesson 5: Communication', duration: '45 min', summary: 'Present insights.', content: 'Exercise:\nWrite an executive summary.' },
      { title: 'Lesson 6: Capstone', duration: '70 min', summary: 'Deliver a report.', content: 'Deliverable:\nA complete people analytics report.' },
    ],
    general: [
      { title: 'Lesson 1: Foundations', duration: '45 min', summary: 'Core concepts and setup.', content: 'Topics:\n- Fundamentals\n- Workflow\n\nExercise:\nSet up your environment.' },
      { title: 'Lesson 2: Practice', duration: '55 min', summary: 'Hands-on learning.', content: 'Exercise:\nComplete guided practice tasks.' },
      { title: 'Lesson 3: Build', duration: '60 min', summary: 'Build something real.', content: 'Deliverable:\nA mini project.' },
      { title: 'Lesson 4: Improve', duration: '50 min', summary: 'Refine and iterate.', content: 'Exercise:\nImprove your project quality.' },
      { title: 'Lesson 5: Capstone', duration: '70 min', summary: 'Capstone scope and plan.', content: 'Deliverable:\nCapstone plan and outline.' },
      { title: 'Lesson 6: Review', duration: '45 min', summary: 'Finalize and present.', content: 'Deliverable:\nA portfolio-ready submission.' },
    ],
  }

  const lessons = byTrack[track] || byTrack.general
  const courseTitle = String(course?.title || 'Course')
  return lessons.map((l) => ({
    ...base,
    ...l,
    content: `${l.content}\n\nCourse: ${courseTitle}${_meta?.price ? `\nPrice: ${_meta.price}` : ''}`.trim(),
  }))
}

function normalizeLessonItems(lessons) {
  return lessons.map((l) => ({
    title: l.title,
    duration: l.duration,
    summary: l.summary,
    content: l.content,
    videoUrls: (l.videoUrls || []).map((url) => ({ url })),
    resources: (l.resources || []).map((url) => ({ url })),
  }))
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const base = args.base.replace(/\/$/, '')

  const coursesRes = await api(base, 'GET', `/courses?limit=${args.limit}`)
  const courses = coursesRes.docs || []

  const targets = courses.filter((course) => {
    if (args.ids && !args.ids.includes(String(course.id))) return false
    const existing = Array.isArray(course.courseContent) ? course.courseContent : []
    if (args.overwrite) return true
    return existing.length === 0
  })

  if (!targets.length) {
    console.log('No courses need seeding.')
    return
  }

  console.log(`Seeding lesson content for ${targets.length} course(s)...`)

  let updated = 0
  let skipped = 0

  for (const course of targets) {
    const track = pickTrack(course)
    const meta = makeCourseMeta(course)
    const lessons = normalizeLessonItems(trackLessons(track, course))
    const payload = {
      format: meta.format,
      certificate: meta.certificate,
      guarantee: meta.guarantee,
      support: meta.support,
      lessons: lessons.length,
      whatYouLearn: meta.whatYouLearn,
      programOverview: meta.programOverview,
      whoThisIsFor: meta.whoThisIsFor,
      courseContent: lessons,
    }

    try {
      await api(base, 'PATCH', `/courses/${course.id}`, payload)
      updated++
      console.log(`  ✓ ${course.id} ${course.title} (${track})`)
    } catch (e) {
      skipped++
      console.warn(`  ⚠ ${course.id} ${course.title}: ${e.message}`)
    }
  }

  console.log(`Done. Updated=${updated}, skipped=${skipped}`)
  console.log('Tip: pass --overwrite to replace existing content; pass --ids "89,88" to seed specific courses.')
}

main().catch((err) => {
  console.error('Seed failed:', err.message)
  process.exit(1)
})

