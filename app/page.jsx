'use client'

import React, { useEffect, useState } from 'react'
import { Hero, Trusted } from '@/src/components/Hero'
import {
  CourseSlider,
  Catalog,
  UdemyGrid,
  WhyUs,
  Categories,
  Packages,
  EventsSection,
  Testimonials,
  FinalCTA
} from '@/src/components/Sections'

function PageSkeleton() {
  return (
    <div>
      <section className="border-b border-white/8 pt-14 pb-14 sm:pt-18 sm:pb-18 lg:pt-20 lg:pb-20 xl:pt-24 xl:pb-24">
        <div className="site-container grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,1.05fr)]">
          <div>
            <div className="shimmer-block h-8 w-44 rounded-full" />
            <div className="mt-5 shimmer-block h-20 w-4/5 rounded-[24px]" />
            <div className="mt-4 shimmer-block h-5 w-11/12 rounded-full" />
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <div className="shimmer-block h-12 w-40 rounded-2xl" />
              <div className="shimmer-block h-12 w-40 rounded-2xl" />
            </div>
            <div className="mt-8 shimmer-block h-28 rounded-[24px]" />
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="surface-card-soft px-5 py-5">
                  <div className="shimmer-block h-8 w-16 rounded-full" />
                  <div className="mt-3 shimmer-block h-4 w-24 rounded-full" />
                </div>
              ))}
            </div>
          </div>
          <div className="surface-card shimmer-block min-h-[320px] rounded-[24px] lg:min-h-[420px]" />
        </div>
      </section>
      <div className="site-container py-6 sm:py-8">
        <div className="shimmer-block mx-auto h-4 w-40 rounded-full" />
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="shimmer-block h-12 w-36 rounded-full" />
          ))}
        </div>
      </div>
      {Array.from({ length: 6 }).map((_, sectionIndex) => (
        <section key={sectionIndex} className="section-space pt-0">
          <div className="site-container">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4 sm:mb-10">
              <div className="min-w-0 flex-1">
                <div className="shimmer-block h-4 w-28 rounded-full" />
                <div className="mt-4 shimmer-block h-10 w-1/2 rounded-[18px]" />
                <div className="mt-4 shimmer-block h-5 w-2/3 rounded-full" />
              </div>
              <div className="shimmer-block h-12 w-36 rounded-2xl" />
            </div>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="surface-card overflow-hidden">
                  <div className="shimmer-block aspect-[16/10]" />
                  <div className="space-y-3 px-5 py-5">
                    <div className="shimmer-block h-5 w-3/4 rounded-full" />
                    <div className="shimmer-block h-4 w-11/12 rounded-full" />
                    <div className="shimmer-block h-4 w-4/5 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  )
}

export default function Page() {
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
    <div>
      <main>
        <Hero siteConfig={data.siteConfig}/>
        <Trusted siteConfig={data.siteConfig}/>
        <CourseSlider  courses={data.courses} loading={loading} siteConfig={data.siteConfig}/>
        <Catalog courses={data.courses} categories={data.categories}/>
        <UdemyGrid     udemy={data.udemy} siteConfig={data.siteConfig}/>
        <WhyUs siteConfig={data.siteConfig}/>
        <Categories    categories={data.categories} courses={data.courses} siteConfig={data.siteConfig}/>
        <Packages      packages={data.packages} siteConfig={data.siteConfig}/>
        <EventsSection siteConfig={data.siteConfig}/>
        <Testimonials  testimonials={data.testimonials} siteConfig={data.siteConfig}/>
        <FinalCTA siteConfig={data.siteConfig}/>
      </main>
    </div>
  )
}
