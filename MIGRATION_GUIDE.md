# Next.js + Payload CMS Migration Guide

## ✅ What's Been Done

1. **Workspace Setup**
   - Created `pnpm-workspace.yaml` in `tech/` root
   - Created root `package.json` with workspace commands
   - Moved project to `tech/apps/web/`

2. **Next.js Configuration**
   - Created `next.config.js` with Payload integration
   - Created `tsconfig.json` for TypeScript support
   - Created App Router structure:
     - `app/layout.jsx` — Root layout (Header/Footer)
     - `app/page.jsx` — Home page with all sections
     - `app/globals.css` — Global styles (migrated from Vite)

3. **Payload CMS Setup**
   - Created `payload.config.ts` with all collections:
     - `courses` — Training programs
     - `testimonials` — Student reviews
     - `categories` — Course tracks
     - `packages` — Pricing models
     - `udemy-courses` — Self-paced courses
     - `site-config` — Global settings (hero badge, stats, etc.)
   - User authentication ready (Users collection)

4. **Updated Dependencies**
   - Removed Vite dependencies
   - Added Next.js 15, Payload CMS v3, and Postgres adapter
   - Ready for installation

## ⚙️ Next Steps (DO THIS NOW)

### Step 1: Update `.env.local` with your Supabase credentials

Edit `apps/web/.env.local`:
```bash
DATABASE_URL=postgresql://postgres.YOUR_REF:YOUR_PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres
PAYLOAD_SECRET=your-secure-random-string-here
```

Get your credentials from Supabase dashboard (Project Settings → Database).

### Step 2: Install dependencies

```bash
# From tech/ root
pnpm install

# This installs all deps in the workspace
```

### Step 3: Run migrations and create admin user

```bash
# From apps/web/
pnpm payload migrate

# Create first admin user:
pnpm payload create:user
```

### Step 4: Seed initial data

The current landing page has hardcoded data in `/src/constants/data.js`. This data needs to be migrated into Payload:

**Courses data** → `apps/web/src/constants/data.js` (COURSES array)
**Testimonials data** → Same file (TESTIMONIALS array)
**Categories data** → Same file (CATS array)
**Packages data** → Same file (PACKAGES array)
**Udemy courses data** → Same file (UDEMY array)

### Step 5: Start development server

```bash
# From tech/ root
pnpm dev

# Will start Next.js on localhost:3000
```

Then visit:
- **Frontend:** http://localhost:3000/
- **Payload Admin:** http://localhost:3000/admin

Login with the admin user you created in Step 3.

### Step 6: Manually seed the collections in Payload Admin

Open http://localhost:3000/admin and:

1. **Go to Courses** → Click "Create"
2. Copy each course from `src/constants/data.js` COURSES array:
- tag, tagHot, code, title, desc, duration, lessons, level, price, old

3. **Repeat for** Testimonials, Categories, Packages, UdemyCourses

4. **Edit Site Config** global:
   - heroBadge: "Live cohort · June 3 intake open"
   - heroHeadline: "Future-ready digital skills for career, business & innovation."
   - heroLede: (from Hero component)
   - statLearners: "12,400+"
   - statCourses: "48"
   - statPlacement: "87%"
   - statRating: "4.8★"
   - trustedCompanies: [list of company names]

## 🔄 Connecting Frontend to Payload API

Once data is in Payload, wire up the frontend. Update `src/lib/payload-client.ts`:

```typescript
// Example: getCourses() should call the Payload API
export async function getCourses() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/courses?limit=100`)
  return res.json()
}
```

Then update components to accept data as props:

**`src/components/Sections.jsx`**
```jsx
export function CourseSlider({ courses }) {
  // Map over courses instead of DATA.COURSES
}
```

**`app/page.jsx`**
```jsx
import { getCourses } from '@/src/lib/payload-client'

export default async function Page() {
  const courses = await getCourses()
  return <CourseSlider courses={courses.docs} />
}
```

## 📋 Current Limitations

1. **Components still use hardcoded DATA** — They work without Payload, but won't reflect updates from admin
2. **No image uploads yet** — Payload is configured but course/category images aren't wired
3. **Styling is fully migrated** — All CSS from Vite is in `app/globals.css`

## 🎯 After Initial Setup

1. Install all packages with `pnpm install`
2. Add your Supabase DATABASE_URL to `.env.local`
3. Run `pnpm dev` from root and seed data manually in Payload Admin
4. Then follow **"Connecting Frontend to Payload API"** section above to wire up live data

## 📚 Useful Commands

```bash
# Development
pnpm dev                    # Start Next.js

# Payload admin
pnpm payload migrate        # Run schema migrations
pnpm payload create:user    # Create admin user

# Building
pnpm build                  # Build for production
pnpm start                  # Start production server

# Linting
pnpm lint                   # Check code quality
```

## ❓ Common Issues

**"DATABASE_URL not found"**
- You didn't update `.env.local` with Supabase credentials

**"Payload admin won't load"**
- Make sure `PAYLOAD_SECRET` is set in `.env.local`
- Check that your DATABASE_URL is correct

**"Components aren't updating from admin"**
- Components still use hardcoded DATA — you need to wire up `payload-client.ts` to fetch from Payload API

---

Need help? Check the Next.js docs (next.dev) and Payload docs (payloadcms.com)
