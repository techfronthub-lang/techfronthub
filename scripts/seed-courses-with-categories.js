#!/usr/bin/env node

const BASE = 'http://localhost:3001/api'

const COURSES_BY_CATEGORY = {
  'Data Analytics': [
    { tag: 'BOOTCAMP', tagHot: true, code: 'DA-201', title: 'Data Analytics Bootcamp', desc: 'Master Excel, SQL, Power BI and Python for real-world business analysis.', duration: '12 weeks', lessons: 86, level: 'Intermediate', price: 'N185,000', old: 'N250,000' },
  ],
  'AI & Automation': [
    { tag: 'NEW', tagHot: false, code: 'AI-110', title: 'Applied AI & Automation', desc: 'Build practical AI agents, prompt systems and automations for business.', duration: '8 weeks', lessons: 62, level: 'All levels', price: 'N220,000', old: null },
  ],
  'DevOps': [
    { tag: 'POPULAR', tagHot: true, code: 'DVOP-305', title: 'DevOps Engineering Track', desc: 'Linux, Git, Docker, Kubernetes, CI/CD and cloud deployment in one program.', duration: '14 weeks', lessons: 104, level: 'Advanced', price: 'N265,000', old: 'N320,000' },
  ],
  'Web Development': [
    { tag: 'LIVE', tagHot: false, code: 'WEB-140', title: 'Full-Stack Web Development', desc: 'HTML/CSS, JavaScript, React, Node and databases - ship a real product.', duration: '16 weeks', lessons: 120, level: 'Beginner', price: 'N195,000', old: null },
  ],
  'Digital Marketing': [
    { tag: 'BOOTCAMP', tagHot: false, code: 'DM-070', title: 'Digital Marketing Mastery', desc: 'SEO, paid ads, content, email and analytics - end-to-end playbook.', duration: '6 weeks', lessons: 48, level: 'Beginner', price: 'N95,000', old: 'N130,000' },
  ],
  'Tech for Kids': [
    { tag: 'BOOTCAMP', tagHot: false, code: 'KIDS-020', title: 'Tech for Kids (Ages 8-14)', desc: 'Scratch, Python and robotics fundamentals through projects and play.', duration: '10 weeks', lessons: 40, level: 'Beginner', price: 'N75,000', old: null },
  ],
  'HR Tech': [
    { tag: 'ADVANCED', tagHot: false, code: 'HR-150', title: 'HR Tech & People Analytics', desc: 'Modern HR tooling, analytics dashboards and workforce reporting.', duration: '8 weeks', lessons: 54, level: 'Intermediate', price: 'N160,000', old: null },
  ],
  'Cybersecurity': [
    { tag: 'NEW', tagHot: true, code: 'SEC-200', title: 'Cybersecurity Fundamentals', desc: 'Threat modelling, network defence, ethical hacking basics and compliance.', duration: '10 weeks', lessons: 72, level: 'Intermediate', price: 'N210,000', old: 'N260,000' },
  ],
  'Cloud Computing': [
    { tag: 'BOOTCAMP', tagHot: false, code: 'CLD-180', title: 'Cloud Computing (AWS)', desc: 'EC2, S3, Lambda, RDS and serverless - architect and deploy on AWS.', duration: '12 weeks', lessons: 90, level: 'Intermediate', price: 'N240,000', old: null },
  ],
  'Python Programming': [
    { tag: 'POPULAR', tagHot: true, code: 'PY-130', title: 'Python for Data Science', desc: 'NumPy, Pandas, Matplotlib, Scikit-learn and real ML projects from scratch.', duration: '10 weeks', lessons: 78, level: 'Beginner', price: 'N155,000', old: 'N200,000' },
  ],
  'UI/UX Design': [
    { tag: 'BOOTCAMP', tagHot: false, code: 'UX-090', title: 'UI/UX Design Fundamentals', desc: 'Figma, design systems, user research and end-to-end product prototyping.', duration: '8 weeks', lessons: 58, level: 'Beginner', price: 'N130,000', old: null },
  ],
}

async function api(method, path, data) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(data ? { body: JSON.stringify(data) } : {}),
  })
  const json = await res.json()
  if (!res.ok) {
    const msg = json.message || json.error || `${method} ${path} -> ${res.status}`
    throw new Error(msg)
  }
  return json
}

async function run() {
  console.log('Seeding Courses with Category Links')
  console.log('====================================')
  console.log('Target:', BASE)

  try {
    const catsRes = await api('GET', '/categories?limit=100')
    const categoryMap = {}
    catsRes.docs.forEach(cat => {
      categoryMap[cat.title] = cat.id
    })

    const existingRes = await api('GET', '/courses?limit=100')
    if (existingRes.docs.length > 0) {
      console.log(`Clearing ${existingRes.docs.length} existing courses...`)
      for (const course of existingRes.docs) {
        await api('DELETE', `/courses/${course.id}`)
      }
    }

    let created = 0
    let failed = 0

    for (const [catTitle, courses] of Object.entries(COURSES_BY_CATEGORY)) {
      const categoryId = categoryMap[catTitle]
      if (!categoryId) {
        console.warn(`Category not found: ${catTitle}`)
        continue
      }

      for (const course of courses) {
        try {
          await api('POST', '/courses', { ...course, category: categoryId })
          created++
        } catch (e) {
          console.warn(`${course.title}: ${e.message}`)
          failed++
        }
      }
    }

    console.log(`Done! ${created} created, ${failed} failed`)
  } catch (e) {
    console.error('Error:', e.message)
    process.exit(1)
  }
}

run()
