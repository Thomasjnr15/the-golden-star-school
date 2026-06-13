# Supabase Setup Guide

This directory contains all the SQL files needed to set up the Golden Star School database on Supabase.

## Setup Instructions

### Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up
2. Click **"New Project"**
3. Name it: `golden-star-school`
4. Choose a strong database password (save it!)
5. Select the region closest to your location
6. Click **"Create new project"** and wait 2-3 minutes

### Step 2: Run the Database Schema

1. In Supabase, click **"SQL Editor"** on the left sidebar
2. Click **"New query"**
3. Copy the entire contents of `schema.sql`
4. Paste into the SQL editor
5. Click **"Run"** (green button)
6. You should see: *Success. No rows returned*

### Step 3: Enable Row-Level Security (RLS)

1. In Supabase, click **"SQL Editor"** on the left sidebar
2. Click **"New query"**
3. Copy the entire contents of `rls.sql`
4. Paste into the SQL editor
5. Click **"Run"**

### Step 4: Run Stream & Subject Migration

1. In Supabase, click **"SQL Editor"** on the left sidebar
2. Click **"New query"**
3. Copy the entire contents of `migration_streams_subjects.sql`
4. Paste into the SQL editor
5. Click **"Run"**

This migration is **idempotent** (safe to run multiple times). It adds:
- `stream` column to `students` and `registration_requests`
- `subjects`, `stream_subjects`, `student_subjects`, `promotion_history` tables
- `approve_registration` (updated 5-arg version with stream support)
- `auto_assign_stream_subjects`, `change_student_stream`, `promote_student` functions
- Seeds 20 subjects and stream assignments for Science, Arts, and Commercial

### Step 4b: Apply RLS Patch for Exam Eligibility

1. Copy the entire contents of `rls_patch_exam_eligibility.sql`
2. Paste into the SQL editor
3. Click **"Run"**

This patches the exam/question RLS policies so SSS students only see exams for their assigned subjects.
**Run this after the migration above** so that subjects are seeded first.

### Step 5: Seed Initial Data

1. In Supabase, click **"SQL Editor"** on the left sidebar
2. Click **"New query"**
3. Copy the entire contents of `seed.sql`
4. Paste into the SQL editor
5. Click **"Run"**

---

### ⚠️ Full Run Order (critical for new projects)

```
1. schema.sql
2. migration_streams_subjects.sql
3. rls.sql
4. rls_patch_exam_eligibility.sql
5. seed.sql
```

### Step 5: Get Your Supabase Credentials

1. Go to **Settings → API** in your Supabase project
2. Copy **Project URL** → this is your `VITE_SUPABASE_URL`
3. Copy **anon public key** → this is your `VITE_SUPABASE_ANON_KEY`

### Step 6: Configure Frontend Environment

1. In the `client/` directory, create a `.env.local` file
2. Add the following:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Default Credentials for Testing

| Role | Username/Email | Password |
|------|---------------|----------|
| Admin | admin@goldenstarschool.edu.ng | Admin@1234 |
| Student 1 | GSS/2026/001 | Admin@1234 |
| Student 2 | GSS/2026/002 | Admin@1234 |
| Student 3 | GSS/2026/003 | Admin@1234 |

⚠️ **Change all passwords after first login!**

## Database Schema Overview

### Core Tables

- **admins** - Admin user accounts
- **students** - Student records with registration numbers and classes
- **school_settings** - Editable school information (name, logo, colors, contact info)
- **news** - School announcements and news items

### Exam System

- **exams** - Exam definitions (title, subject, class, date, time, duration)
- **questions** - Multiple choice questions for exams
- **exam_sessions** - Tracks when students start exams (includes question snapshot)
- **student_answers** - Student's answers to questions (auto-saved)
- **exam_results** - Final scores and submission timestamps

### Other Features

- **payments** - Student fee payment records
- **registration_requests** - New student registration applications
- **contact_messages** - Messages from the contact form

## Security Features

### Row-Level Security (RLS)

All tables have RLS enabled with strict policies:

- **Students** can only see their own data
- **Exams** are only visible to students in the correct class
- **Results** are only visible if published
- **Admin actions** are restricted to admin accounts
- **School settings** are readable by everyone but editable only by admins

### Authentication

The system uses JWT-based authentication with two roles:
- **Admin** - Full access to all features
- **Student** - Limited access to their own data and assigned exams

## Troubleshooting

**"Permission denied" errors**
→ Make sure RLS policies are enabled and correctly configured

**"Invalid credentials"**
→ Verify the password hashes match the test credentials

**Exam not showing for student**
→ Ensure the student's class matches the exam's class exactly

**Questions not visible to student**
→ This is intentional - students get questions from the exam session snapshot, not directly from the questions table
