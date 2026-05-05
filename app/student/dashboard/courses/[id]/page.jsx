'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { pageBg, shell, card } from '../../_components/ui'

function lessonDurationLabel(value) {
  return value || 'Duration not set'
}

function splitContentSections(value) {
  return String(value || '')
    .split('\n\n')
    .map((section) => section.trim())
    .filter(Boolean)
}

export default function CourseLessonViewPage() {
  const params = useParams()
  const courseId = String(params.id)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [course, setCourse] = useState(null)
  const [activeLesson, setActiveLesson] = useState(0)
  const [accessDenied, setAccessDenied] = useState(false)
  const [isCompact, setIsCompact] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 980px)')
    const sync = () => setIsCompact(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    let active = true

    const token = typeof window !== 'undefined' ? localStorage.getItem('payload-token') : ''
    if (!token) {
      router.push('/login')
      return
    }

    const load = async () => {
      try {
        const res = await fetch(`/api/student/courses/${params.id}/lessons`, {
          headers: { Authorization: `JWT ${token}` },
        })
        const data = await res.json()

        if (!active) return
        if (res.status === 403) {
          setAccessDenied(true)
          setLoading(false)
          return
        }
        if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`)

        setCourse(data)
        setLoading(false)
      } catch (e) {
        if (!active) return
        setError(e.message || 'Failed to load lessons')
        setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [params.id, router])

  const lessons = useMemo(() => {
    const list = Array.isArray(course?.courseContent) ? course.courseContent : []
    return list.map((lesson, index) => ({
      id: index + 1,
      title: lesson?.title || `Lesson ${index + 1}`,
      duration: lessonDurationLabel(lesson?.duration),
      summary: lesson?.summary || '',
      content: lesson?.content || '',
      sections: splitContentSections(lesson?.content),
      videoUrls: Array.isArray(lesson?.videoUrls) ? lesson.videoUrls.map((v) => v?.url).filter(Boolean) : [],
      resources: Array.isArray(lesson?.resources) ? lesson.resources.map((r) => r?.url).filter(Boolean) : [],
    }))
  }, [course])

  const activeContent = lessons[activeLesson] || null
  const completionCount = Math.min(lessons.length, activeLesson + 1)
  const progressPercent = lessons.length ? Math.round((completionCount / lessons.length) * 100) : 0

  useEffect(() => {
    if (!courseId || lessons.length === 0) return
    persistCourseProgress(courseId, {
      lastLessonIndex: activeLesson,
      completedLessons: completionCount,
      totalLessons: lessons.length,
      updatedAt: new Date().toISOString(),
    })
  }, [activeLesson, completionCount, courseId, lessons.length])

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: 'var(--ink-400)' }}>Loading lessons...</div>
  }

  if (error || accessDenied) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
        <div style={{ ...card, borderRadius: 20, padding: 24, maxWidth: 560, width: '100%' }}>
          <h2 style={{ margin: 0, color: 'var(--ink-900)' }}>{accessDenied ? 'Access restricted' : 'Could not load lessons'}</h2>
          <p style={{ color: 'var(--ink-600)', lineHeight: 1.7 }}>{accessDenied ? 'You are not enrolled in this course yet.' : error}</p>
          <Link href="/student/dashboard/courses" style={{ color: 'var(--brand-600)', textDecoration: 'none', fontWeight: 700 }}>Back to My Courses</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: pageBg.background }}>
      <div className="container" style={{ padding: shell.padding }}>
        <Link href="/student/dashboard/courses" style={{ color: 'var(--brand-600)', textDecoration: 'none', fontSize: 14 }}>Back to My Courses</Link>

        <section style={heroStyle}>
          <div>
            <div style={heroEyebrowStyle}>Course Workspace</div>
            <h1 style={heroTitleStyle}>{course?.title || 'Course Lessons'}</h1>
            <p style={heroBodyStyle}>{course?.desc || 'Continue your lessons, review resources, and track your progress through the course content.'}</p>
          </div>
          <div style={heroStatsWrapStyle}>
            <div style={heroStatStyle}>
              <span style={heroStatValueStyle}>{lessons.length}</span>
              <span style={heroStatLabelStyle}>Lessons</span>
            </div>
            <div style={heroStatStyle}>
              <span style={heroStatValueStyle}>{progressPercent}%</span>
              <span style={heroStatLabelStyle}>Progress</span>
            </div>
            <div style={heroStatStyle}>
              <span style={heroStatValueStyle}>{course?.duration || 'Flexible'}</span>
              <span style={heroStatLabelStyle}>Course Length</span>
            </div>
          </div>
        </section>

        {lessons.length === 0 ? (
          <div style={{ ...card, borderRadius: 20, padding: 22, color: 'var(--ink-600)' }}>
            No lesson content has been added for this course yet.
          </div>
        ) : (
          <div style={getLayoutStyle(isCompact)}>
            <aside style={sidebarStyle}>
              <div style={sidebarHeaderStyle}>
                <div style={sidebarTitleStyle}>Lesson Outline</div>
                <div style={sidebarSubStyle}>Select a lesson to continue</div>
              </div>

              <div style={lessonListStyle}>
                {lessons.map((lesson, idx) => {
                  const active = idx === activeLesson
                  return (
                    <button
                      key={lesson.id}
                      type="button"
                      onClick={() => setActiveLesson(idx)}
                      style={getLessonButtonStyle(active)}
                    >
                      <div style={lessonButtonTopStyle}>
                        <span style={getLessonIndexStyle(active)}>{String(idx + 1).padStart(2, '0')}</span>
                        <span style={getLessonDurationStyle(active)}>{lesson.duration}</span>
                      </div>
                      <div style={getLessonTitleStyle(active)}>{lesson.title}</div>
                      {lesson.summary ? <div style={getLessonSummaryStyle(active)}>{lesson.summary}</div> : null}
                    </button>
                  )
                })}
              </div>
            </aside>

            <section style={contentShellStyle}>
              {activeContent ? (
                <>
                  <div style={contentHeaderStyle}>
                    <div>
                      <div style={contentEyebrowStyle}>Lesson {activeLesson + 1}</div>
                      <h2 style={contentTitleStyle}>{activeContent.title}</h2>
                    </div>
                    <div style={contentDurationPillStyle}>{activeContent.duration}</div>
                  </div>

                  <div style={lessonProgressBannerStyle}>
                    <div>
                      <strong style={lessonProgressTitleStyle}>You are on lesson {activeLesson + 1} of {lessons.length}</strong>
                      <div style={lessonProgressMetaStyle}>Your last opened lesson is saved on this device so you can continue where you stopped.</div>
                    </div>
                    <div style={lessonProgressTrackStyle}>
                      <div style={{ ...lessonProgressFillStyle, width: `${progressPercent}%` }} />
                    </div>
                  </div>

                  {activeContent.summary ? (
                    <div style={summaryCardStyle}>
                      <div style={sectionLabelStyle}>Overview</div>
                      <p style={summaryTextStyle}>{activeContent.summary}</p>
                    </div>
                  ) : null}

                  {activeContent.sections.length > 0 ? (
                    <div style={readingCardStyle}>
                      <div style={sectionLabelStyle}>Lesson Notes</div>
                      <div style={readingStackStyle}>
                        {activeContent.sections.map((section, index) => (
                          <p key={`${index}-${section.slice(0, 20)}`} style={readingParagraphStyle}>
                            {section}
                          </p>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div style={resourceGridStyle}>
                    <div style={resourceCardStyle}>
                      <div style={sectionLabelStyle}>Video Links</div>
                      {activeContent.videoUrls.length > 0 ? (
                        <ul style={linkListStyle}>
                          {activeContent.videoUrls.map((url, index) => (
                            <li key={`${url}-${index}`} style={linkItemStyle}>
                              <a href={url} target="_blank" rel="noreferrer" style={resourceLinkStyle}>
                                Watch lesson video {index + 1}
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p style={emptyLabelStyle}>No video links were added for this lesson.</p>
                      )}
                    </div>

                    <div style={resourceCardStyle}>
                      <div style={sectionLabelStyle}>Resources</div>
                      {activeContent.resources.length > 0 ? (
                        <ul style={linkListStyle}>
                          {activeContent.resources.map((url, index) => (
                            <li key={`${url}-${index}`} style={linkItemStyle}>
                              <a href={url} target="_blank" rel="noreferrer" style={resourceLinkStyle}>
                                Open resource {index + 1}
                              </a>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p style={emptyLabelStyle}>No supporting resources were added for this lesson.</p>
                      )}
                    </div>
                  </div>

                  <div style={navActionsStyle}>
                    <button
                      type="button"
                      onClick={() => setActiveLesson((current) => Math.max(0, current - 1))}
                      disabled={activeLesson === 0}
                      style={getNavButtonStyle(activeLesson === 0)}
                    >
                      Previous Lesson
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveLesson((current) => Math.min(lessons.length - 1, current + 1))}
                      disabled={activeLesson === lessons.length - 1}
                      style={getPrimaryNavButtonStyle(activeLesson === lessons.length - 1)}
                    >
                      {activeLesson === lessons.length - 1 ? 'Course Complete' : 'Next Lesson'}
                    </button>
                  </div>
                </>
              ) : null}
            </section>
          </div>
        )}
      </div>
    </div>
  )
}

function persistCourseProgress(courseId, progress) {
  if (typeof window === 'undefined' || !courseId) return
  try {
    const raw = localStorage.getItem('student-course-progress')
    const current = raw ? JSON.parse(raw) : {}
    current[String(courseId)] = progress
    localStorage.setItem('student-course-progress', JSON.stringify(current))
  } catch {
    // Ignore local storage write errors and keep the lesson view usable.
  }
}

const heroStyle = {
  ...card,
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: 18,
  alignItems: 'start',
  padding: 24,
  marginTop: 18,
  marginBottom: 22,
  borderRadius: 28,
  background: 'linear-gradient(135deg, rgba(255,255,255,0.98), rgba(239,246,255,0.98))',
}

const heroEyebrowStyle = {
  display: 'inline-flex',
  padding: '8px 12px',
  borderRadius: 999,
  background: 'rgba(37,99,235,0.1)',
  color: 'var(--brand-700)',
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '.12em',
  textTransform: 'uppercase',
}

const heroTitleStyle = {
  margin: '12px 0 10px',
  color: 'var(--ink-900)',
  fontSize: 'clamp(30px, 4vw, 46px)',
  lineHeight: 1.02,
}

const heroBodyStyle = {
  margin: 0,
  color: 'var(--ink-600)',
  lineHeight: 1.8,
  maxWidth: 720,
}

const heroStatsWrapStyle = {
  display: 'grid',
  gap: 12,
}

const heroStatStyle = {
  borderRadius: 20,
  padding: 18,
  background: '#0f172a',
  color: '#fff',
  display: 'grid',
  gap: 8,
}

const heroStatValueStyle = {
  fontSize: 28,
  fontWeight: 800,
  lineHeight: 1,
}

const heroStatLabelStyle = {
  fontSize: 13,
  color: 'rgba(226,232,240,0.72)',
}

function getLayoutStyle(isCompact) {
  return {
    display: 'grid',
    gridTemplateColumns: isCompact ? '1fr' : 'minmax(300px, 360px) minmax(0, 1fr)',
    gap: 18,
    alignItems: 'start',
  }
}

const sidebarStyle = {
  ...card,
  borderRadius: 22,
  padding: 14,
  position: 'sticky',
  top: 16,
}

const sidebarHeaderStyle = {
  padding: '8px 8px 14px',
}

const sidebarTitleStyle = {
  color: 'var(--ink-900)',
  fontWeight: 800,
  fontSize: 18,
}

const sidebarSubStyle = {
  marginTop: 6,
  color: 'var(--ink-500)',
  fontSize: 13,
}

const lessonListStyle = {
  display: 'grid',
  gap: 10,
}

function getLessonButtonStyle(active) {
  return {
    width: '100%',
    textAlign: 'left',
    background: active ? 'linear-gradient(135deg, rgba(37,99,235,0.12), rgba(14,165,233,0.12))' : '#fff',
    border: `1px solid ${active ? 'rgba(37,99,235,0.28)' : 'var(--ink-200)'}`,
    borderRadius: 16,
    padding: 14,
    cursor: 'pointer',
    boxShadow: active ? '0 12px 28px rgba(37,99,235,0.08)' : 'none',
  }
}

const lessonButtonTopStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  marginBottom: 10,
}

function getLessonIndexStyle(active) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 42,
    height: 32,
    borderRadius: 999,
    background: active ? '#1d4ed8' : '#f1f5f9',
    color: active ? '#fff' : 'var(--ink-700)',
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: '.08em',
  }
}

function getLessonDurationStyle(active) {
  return {
    fontSize: 12,
    color: active ? '#1d4ed8' : 'var(--ink-500)',
    fontWeight: 700,
  }
}

function getLessonTitleStyle(active) {
  return {
    color: 'var(--ink-900)',
    fontWeight: 800,
    fontSize: 15,
    lineHeight: 1.35,
    marginBottom: 8,
  }
}

function getLessonSummaryStyle(active) {
  return {
    color: active ? 'var(--ink-700)' : 'var(--ink-600)',
    fontSize: 13,
    lineHeight: 1.6,
  }
}

const contentShellStyle = {
  ...card,
  borderRadius: 24,
  padding: 24,
  minWidth: 0,
  display: 'grid',
  gap: 18,
}

const contentHeaderStyle = {
  display: 'flex',
  alignItems: 'start',
  justifyContent: 'space-between',
  gap: 16,
  paddingBottom: 14,
  borderBottom: '1px solid var(--ink-200)',
}

const contentEyebrowStyle = {
  display: 'inline-flex',
  padding: '8px 12px',
  borderRadius: 999,
  background: 'rgba(15,23,42,0.06)',
  color: 'var(--ink-700)',
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '.12em',
  textTransform: 'uppercase',
}

const contentTitleStyle = {
  margin: '12px 0 0',
  color: 'var(--ink-900)',
  fontSize: 'clamp(24px, 3vw, 34px)',
  lineHeight: 1.08,
}

const contentDurationPillStyle = {
  display: 'inline-flex',
  padding: '10px 14px',
  borderRadius: 999,
  background: '#0f172a',
  color: '#fff',
  fontWeight: 700,
  fontSize: 13,
  whiteSpace: 'nowrap',
}

const summaryCardStyle = {
  borderRadius: 20,
  padding: 18,
  background: 'linear-gradient(135deg, rgba(239,246,255,0.9), rgba(248,250,252,0.95))',
  border: '1px solid rgba(37,99,235,0.12)',
}

const sectionLabelStyle = {
  color: 'var(--ink-900)',
  fontSize: 14,
  fontWeight: 800,
  marginBottom: 10,
}

const summaryTextStyle = {
  margin: 0,
  color: 'var(--ink-700)',
  lineHeight: 1.8,
}

const readingCardStyle = {
  borderRadius: 20,
  padding: 20,
  background: '#fff',
  border: '1px solid var(--ink-200)',
}

const readingStackStyle = {
  display: 'grid',
  gap: 16,
}

const readingParagraphStyle = {
  margin: 0,
  color: 'var(--ink-700)',
  lineHeight: 1.9,
  fontSize: 15,
}

const resourceGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: 16,
}

const resourceCardStyle = {
  borderRadius: 20,
  padding: 18,
  background: '#f8fafc',
  border: '1px solid var(--ink-200)',
}

const linkListStyle = {
  margin: 0,
  paddingLeft: 18,
  display: 'grid',
  gap: 10,
}

const linkItemStyle = {
  color: 'var(--ink-700)',
}

const resourceLinkStyle = {
  color: 'var(--brand-600)',
  textDecoration: 'none',
  fontWeight: 700,
  lineHeight: 1.6,
}

const emptyLabelStyle = {
  margin: 0,
  color: 'var(--ink-500)',
  lineHeight: 1.7,
}

const lessonProgressBannerStyle = {
  borderRadius: 20,
  padding: 18,
  background: '#f8fafc',
  border: '1px solid var(--ink-200)',
  display: 'grid',
  gap: 12,
}

const lessonProgressTitleStyle = {
  display: 'block',
  color: 'var(--ink-900)',
  fontSize: 15,
}

const lessonProgressMetaStyle = {
  marginTop: 6,
  color: 'var(--ink-600)',
  lineHeight: 1.7,
  fontSize: 14,
}

const lessonProgressTrackStyle = {
  width: '100%',
  height: 12,
  borderRadius: 999,
  background: 'rgba(148,163,184,0.22)',
  overflow: 'hidden',
}

const lessonProgressFillStyle = {
  height: '100%',
  borderRadius: 999,
  background: 'linear-gradient(90deg, #2563eb, #06b6d4)',
}

const navActionsStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  flexWrap: 'wrap',
}

function getNavButtonStyle(disabled) {
  return {
    border: '1px solid var(--ink-200)',
    background: disabled ? '#e2e8f0' : '#fff',
    color: disabled ? 'var(--ink-500)' : 'var(--ink-900)',
    borderRadius: 14,
    padding: '13px 18px',
    fontWeight: 800,
    cursor: disabled ? 'not-allowed' : 'pointer',
  }
}

function getPrimaryNavButtonStyle(disabled) {
  return {
    border: 'none',
    background: disabled ? '#0f766e' : 'var(--brand-600)',
    color: '#fff',
    borderRadius: 14,
    padding: '13px 18px',
    fontWeight: 800,
    cursor: disabled ? 'default' : 'pointer',
  }
}
