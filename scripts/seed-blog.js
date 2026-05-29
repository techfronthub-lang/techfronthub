#!/usr/bin/env node

import { config as loadEnv } from 'dotenv'
import { getPayloadHMR } from '@payloadcms/next/utilities'

loadEnv({ path: '.env.local' })
process.env.PAYLOAD_SECRET ||= 'local-blog-seed-secret'

const POST_SLUG = 'how-to-start-a-tech-career-in-nigeria'

const BLOG_POST = {
  title: 'How to Start a Tech Career in Nigeria Without Wasting Time',
  slug: POST_SLUG,
  status: 'published',
  featured: true,
  author: 'TECHFRONT HUB',
  category: 'Career Guide',
  readTime: '7 min read',
  excerpt:
    'A practical roadmap for beginners who want to move from interest to job-ready skills with a clear portfolio, learning path, and interview plan.',
  coverImage:
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80',
  tags: [
    { tag: 'Career' },
    { tag: 'Beginners' },
    { tag: 'Nigeria' },
    { tag: 'Tech Training' },
  ],
  bodySections: [
    {
      type: 'heading',
      heading: 'Start with one clear role',
      body:
        'The fastest way to get lost is to learn everything at once. Pick one role first: data analyst, frontend developer, UI/UX designer, DevOps engineer, cybersecurity analyst, or digital marketer.',
    },
    {
      type: 'paragraph',
      body:
        'Once the role is clear, your learning becomes easier to measure. You know the tools to practice, the projects to build, and the job descriptions to study. This also helps you avoid jumping between random courses without finishing anything useful.',
    },
    {
      type: 'bullet-list',
      heading: 'A simple 30-day start plan',
      body:
        'Read 10 job posts for your target role\nList the repeated tools and skills\nTake one structured beginner course\nBuild one small project every week\nPublish your work on LinkedIn or GitHub',
    },
    {
      type: 'callout',
      heading: 'Do not wait until you feel ready',
      body:
        'Confidence usually comes after visible work. Build small, public projects while you learn, then improve them as your skills get better.',
    },
    {
      type: 'heading',
      heading: 'Build proof, not just notes',
      body:
        'Employers and clients need proof that you can solve a problem. Your portfolio should show finished work, not only certificates.',
    },
    {
      type: 'paragraph',
      body:
        'For data analytics, publish dashboards and explain the decisions behind them. For web development, deploy websites that people can actually open. For design, share case studies that show research, wireframes, and final screens.',
    },
    {
      type: 'quote',
      body:
        'A small completed project is more useful than a long list of unfinished tutorials.',
    },
  ],
  content:
    'Start with one clear role, build proof through small public projects, and use real job descriptions to guide what you learn next.',
}

async function seedBlogPost() {
  const { default: config } = await import('../payload.config.ts')
  const payload = await getPayloadHMR({ config })

  const existing = await payload.find({
    collection: 'blog-posts',
    where: { slug: { equals: POST_SLUG } },
    limit: 1,
    depth: 0,
  })

  if (existing.docs.length > 0) {
    const current = existing.docs[0]
    const doc = await payload.update({
      collection: 'blog-posts',
      id: current.id,
      data: BLOG_POST,
    })
    console.log(`Updated blog post: ${doc.title}`)
    console.log(`/blog/${doc.slug}`)
    return
  }

  const doc = await payload.create({
    collection: 'blog-posts',
    data: BLOG_POST,
  })

  console.log(`Created blog post: ${doc.title}`)
  console.log(`/blog/${doc.slug}`)
}

seedBlogPost()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error.message)
    process.exit(1)
  })
