'use client'

import React, { useState, useEffect } from 'react'
import { Hero, Trusted } from '@/src/components/Hero'
import {
  CourseSlider,
  Catalog,
  UdemyGrid,
  WhyUs,
  Categories,
  Packages,
  Testimonials,
  FinalCTA
} from '@/src/components/Sections'

function PageSkeleton() {
  const box = (style = {}) => (
    <div
      style={{
        background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'home-shimmer 1.4s infinite',
        borderRadius: 12,
        ...style,
      }}
    />
  )

  return (
    <>
      <style>{`
        @keyframes home-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div>
              {box({ width: 180, height: 30, borderRadius: 999 })}
              <div style={{ height: 18 }} />
              {box({ width: '85%', height: 72, borderRadius: 16 })}
              <div style={{ height: 16 }} />
              {box({ width: '92%', height: 18 })}
              <div style={{ height: 24 }} />
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {box({ width: 160, height: 46, borderRadius: 12 })}
                {box({ width: 160, height: 46, borderRadius: 12 })}
              </div>
              <div style={{ height: 24 }} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12 }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} style={{ padding: 16, borderRadius: 16, border: '1px solid rgba(148,163,184,.22)' }}>
                    {box({ width: '60%', height: 28, borderRadius: 8 })}
                    <div style={{ height: 10 }} />
                    {box({ width: '80%', height: 14, borderRadius: 8 })}
                  </div>
                ))}
              </div>
            </div>
            <div className="hero-visual">
              {box({ width: '100%', height: 420, borderRadius: 24 })}
            </div>
          </div>
        </div>
      </section>
      <div className="trusted">
        <div className="container">
          {box({ width: 160, height: 14, borderRadius: 999 })}
          <div style={{ height: 16 }} />
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ width: 140, height: 40, borderRadius: 999, border: '1px solid rgba(148,163,184,.2)' }} />
            ))}
          </div>
        </div>
      </div>
      {Array.from({ length: 6 }).map((_, sectionIndex) => (
        <section key={sectionIndex} style={{ padding: '72px 0' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 280 }}>
                {box({ width: 140, height: 14, borderRadius: 999 })}
                <div style={{ height: 10 }} />
                {box({ width: '52%', height: 32, borderRadius: 10 })}
                <div style={{ height: 10 }} />
                {box({ width: '72%', height: 16, borderRadius: 8 })}
              </div>
              {box({ width: 140, height: 40, borderRadius: 10 })}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ borderRadius: 20, border: '1px solid rgba(148,163,184,.18)', padding: 16 }}>
                  {box({ width: '100%', height: 140, borderRadius: 16 })}
                  <div style={{ height: 14 }} />
                  {box({ width: '80%', height: 18, borderRadius: 8 })}
                  <div style={{ height: 10 }} />
                  {box({ width: '90%', height: 14, borderRadius: 8 })}
                  <div style={{ height: 10 }} />
                  {box({ width: '65%', height: 14, borderRadius: 8 })}
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}
    </>
  )
}

const ACCENTS = {
  blue:   { "--brand-50":"#eff6ff","--brand-100":"#dbeafe","--brand-200":"#bfdbfe","--brand-500":"#2563eb","--brand-600":"#1d4ed8","--brand-700":"#1e40af","--brand-900":"#0b1e4a" },
  indigo: { "--brand-50":"#eef2ff","--brand-100":"#e0e7ff","--brand-200":"#c7d2fe","--brand-500":"#6366f1","--brand-600":"#4f46e5","--brand-700":"#4338ca","--brand-900":"#1e1b4b" },
  teal:   { "--brand-50":"#f0fdfa","--brand-100":"#ccfbf1","--brand-200":"#99f6e4","--brand-500":"#14b8a6","--brand-600":"#0d9488","--brand-700":"#0f766e","--brand-900":"#042f2e" },
  slate:  { "--brand-50":"#f8fafc","--brand-100":"#e2e8f0","--brand-200":"#cbd5e1","--brand-500":"#64748b","--brand-600":"#334155","--brand-700":"#1e293b","--brand-900":"#020617" },
};

export default function Page() {
  const [accent, setAccent] = useState('blue');
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    courses:      null,
    categories:   null,
    testimonials: null,
    packages:     null,
    udemy:        null,
    siteConfig:   null,
  });

  useEffect(() => {
    const pal = ACCENTS[accent] || ACCENTS.blue;
    Object.entries(pal).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
  }, [accent]);

  useEffect(() => {
    let cancelled = false;
    let retryTimer = null;
    const BASE = '/api';
    const get = async (path) => {
      try {
        const res = await fetch(`${BASE}${path}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`Request failed: ${path}`);
        return await res.json();
      } catch {
        return { __error: true };
      }
    };

    const load = async () => {
      const [courses, cats, testimonials, packages, udemy, siteConfig] = await Promise.all([
        get('/courses?limit=50'),
        get('/categories?limit=50'),
        get('/testimonials?limit=50'),
        get('/packages?limit=50'),
        get('/udemy-courses?limit=50'),
        get('/globals/site-config'),
      ]);

      if (cancelled) return;

      const hadError = [courses, cats, testimonials, packages, udemy, siteConfig].some((item) => item?.__error);
      if (hadError) {
        retryTimer = setTimeout(load, 1800);
        return;
      }

      setData({
        courses:      courses?.docs?.length      ? courses.docs      : null,
        categories:   cats?.docs?.length         ? cats.docs         : null,
        testimonials: testimonials?.docs?.length ? testimonials.docs : null,
        packages:     packages?.docs?.length     ? packages.docs     : null,
        udemy:        udemy?.docs?.length        ? udemy.docs        : null,
        siteConfig:   siteConfig?.doc            ?? null,
      });
      setLoading(false);
    };

    load();

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, []);

  if (loading) {
    return (
      <div className="app-container">
        <main aria-busy="true">
          <PageSkeleton />
        </main>
      </div>
    )
  }

  return (
    <div className="app-container">
      <main>
        <Hero siteConfig={data.siteConfig}/>
        <Trusted siteConfig={data.siteConfig}/>
        <CourseSlider  courses={data.courses} loading={loading} siteConfig={data.siteConfig}/>
        <Catalog courses={data.courses} categories={data.categories}/>
        <UdemyGrid     udemy={data.udemy} siteConfig={data.siteConfig}/>
        <WhyUs siteConfig={data.siteConfig}/>
        <Categories    categories={data.categories} courses={data.courses} siteConfig={data.siteConfig}/>
        <Packages      packages={data.packages} siteConfig={data.siteConfig}/>
        <Testimonials  testimonials={data.testimonials} siteConfig={data.siteConfig}/>
        <FinalCTA siteConfig={data.siteConfig}/>
      </main>

      <div className={"tweaks" + (editMode ? " on" : "")}>
        <h5>Tweaks</h5>
        <div className="row">
          <span>Accent</span>
          <div className="swatches">
            {[
              {k: "blue",   c: "#2563eb"},
              {k: "indigo", c: "#4f46e5"},
              {k: "teal",   c: "#0d9488"},
              {k: "slate",  c: "#334155"},
            ].map(s => (
              <div key={s.k}
                   className={"sw" + (accent === s.k ? " active" : "")}
                   style={{background: s.c}}
                   onClick={() => setAccent(s.k)} />
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={() => setEditMode(!editMode)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
          padding: '8px 12px',
          background: 'var(--brand-600)',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px',
        }}
      >
        Toggle Tweaks
      </button>
    </div>
  )
}
