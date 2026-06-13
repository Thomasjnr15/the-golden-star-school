# Golden Star School Management System - Setup Guide

## Overview

Golden Star School Management System is a comprehensive, React + Supabase-based school management platform designed to handle student management, CBT exams, results tracking, and school administration.

## Architecture

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Routing**: Wouter
- **State Management**: React Context + Hooks
- **Database Client**: Supabase JavaScript SDK

### Backend
- **Database**: Supabase PostgreSQL
- **Authentication**: JWT-based with role-based access control
- **Security**: Row-Level Security (RLS) policies

## Features

### Public Website
- ✅ Landing page with hero section
- ✅ School information & about section
- ✅ News & announcements feed
- ✅ Fees information with payment details
- ✅ Student admission form
- ✅ Contact form & social media links
- ✅ Responsive design

### Student Portal
- ✅ Student login with registration number
- ✅ Dashboard showing assigned exams
- ✅ CBT Exam interface with:
  - Question navigator
  - Real-time timer with auto-submission
  - Auto-save functionality
  - Question shuffling for randomization
  - Multiple choice options (A, B, C, D)
- ✅ Results page with score display and grading
- ✅ Answer review capability

### Admin Dashboard
- ✅ Student Management
  - Add/view/delete students
  - Filter by class
  - Search functionality
- ✅ Exam Management
  - Create exams with date/time/duration
  - Add multiple questions per exam
  - Question shuffling
  - Publish/unpublish exams
  - Delete questions
- ✅ News Management
  - Create announcements
  - Delete news items
  - Timestamp tracking
- ✅ Payment Tracking
  - Record student fee payments
  - Filter by status (pending/completed/failed)
  - Track payment references
  - Total amount calculation
- ✅ Registration Request Processing
  - Review student applications
  - Approve with auto account creation
  - Reject applications
  - Generate registration numbers
- ✅ Settings & CMS
  - School information management
  - Website content editing
  - Payment account details
  - Social media links
  - Fees table configuration

## Database Schema

### Core Tables
- **admins**: Admin user accounts
- **students**: Student records with registration numbers
- **exams**: Exam definitions with date/time/duration
- **questions**: Multiple choice questions for exams
- **exam_sessions**: Tracks exam attempts and question snapshots
- **student_answers**: Stores student responses during exams
- **exam_results**: Final exam scores and results
- **news**: School announcements and news items
- **payments**: Student fee payment records
- **registration_requests**: Pending student applications
- **school_settings**: CMS configuration and school information
- **contact_messages**: Contact form submissions

### Security
All tables have Row-Level Security (RLS) policies:
- **Students** can only view their own data
- **Admins** can view all data
- **Public** can submit registration requests and contact forms

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the `client/` directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Database Setup

1. Create a new Supabase project
2. Run the SQL scripts in order:
   - `supabase/schema.sql` - Create tables and indexes
   - `supabase/rls.sql` - Enable Row-Level Security
   - `supabase/seed.sql` - Add demo data (optional)

### 3. Install Dependencies

```bash
cd /home/ubuntu/golden-star-school
pnpm install
```

### 4. Start Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## Default Credentials

### Admin Account
- **Email**: admin@goldenstarschool.edu.ng
- **Password**: Admin@1234

### Demo Student Account
- **Registration Number**: GSS/2026/001
- **Password**: Admin@1234

## File Structure

```
client/
├── src/
│   ├── pages/
│   │   ├── Home.tsx                 # Public landing page
│   │   ├── StudentLogin.tsx         # Student login
│   │   ├── StudentRegister.tsx      # Student registration info
│   │   ├── AdminLogin.tsx           # Admin login
│   │   ├── StudentDashboard.tsx     # Student portal
│   │   ├── ExamPage.tsx             # CBT exam interface
│   │   ├── Results.tsx              # Results page
│   │   └── AdminDashboard.tsx       # Admin panel
│   ├── components/
│   │   ├── Hero.tsx                 # Landing page hero
│   │   ├── About.tsx                # About section
│   │   ├── News.tsx                 # News feed
│   │   ├── Fees.tsx                 # Fees information
│   │   ├── Admission.tsx            # Admission form
│   │   ├── Contact.tsx              # Contact form
│   │   ├── Footer.tsx               # Footer
│   │   ├── ProtectedRoute.tsx       # Auth guard
│   │   └── ui/                      # shadcn/ui components
│   ├── admin/
│   │   ├── ManageStudents.tsx       # Student management
│   │   ├── ManageExams.tsx          # Exam management
│   │   ├── ManageNews.tsx           # News management
│   │   ├── ManagePayments.tsx       # Payment tracking
│   │   ├── RegistrationRequests.tsx # Application processing
│   │   └── Settings.tsx             # CMS & settings
│   ├── contexts/
│   │   ├── AuthContext.tsx          # Authentication state
│   │   └── ThemeContext.tsx         # Theme management
│   ├── lib/
│   │   ├── supabase.ts              # Supabase client config
│   │   ├── auth.ts                  # Auth utilities
│   │   └── utils.ts                 # Helper functions
│   ├── App.tsx                      # Main routing
│   ├── main.tsx                     # React entry point
│   └── index.css                    # Global styles
├── public/
│   └── favicon.ico
└── index.html

supabase/
├── schema.sql                       # Database schema
├── rls.sql                          # Row-Level Security policies
├── seed.sql                         # Demo data
└── README.md                        # Supabase setup guide
```

## User Roles & Permissions

### Admin Role
- Full access to all admin features
- Can create/edit/delete exams, students, news
- Can approve student registrations
- Can manage school settings and CMS content
- Can view all payments and results

### Student Role
- Can view assigned exams
- Can take CBT exams during scheduled time
- Can view own exam results
- Can view own profile information
- Cannot access admin features

### Public (Unauthenticated)
- Can view public website
- Can submit admission applications
- Can submit contact form messages
- Cannot access student or admin portals

## Key Features Explained

### CBT Exam System
1. **Question Randomization**: Questions are shuffled for each student to prevent cheating
2. **Question Snapshots**: Exam questions are stored at exam start to ensure consistency
3. **Auto-Save**: Student answers are automatically saved every 2 seconds
4. **Timer**: Countdown timer with auto-submission when time expires
5. **Question Navigator**: Visual indicator showing answered/unanswered questions

### Exam Results
- Automatic score calculation based on correct answers
- Grade assignment (A-F) based on percentage
- Result display with breakdown of correct/incorrect answers
- Timestamp tracking of exam submission

### Registration Workflow
1. Student submits admission form on public website
2. Admin reviews pending applications
3. Admin approves and creates student account with:
   - Generated registration number
   - Initial password
   - Assigned class
4. Student can then login with credentials

## Deployment

### Manus Platform
1. Click "Publish" button in the Management UI
2. Select custom domain or use auto-generated domain
3. System will build and deploy automatically

### Manual Deployment
```bash
pnpm build
# Deploy dist/ folder to your hosting provider
```

## Troubleshooting

### Login Issues
- Ensure credentials are correct (case-sensitive)
- Check that user account exists in database
- Verify Supabase connection is working

### Exam Not Appearing
- Ensure exam is published (not in draft)
- Check exam date/time matches current time
- Verify student is in the correct class for exam

### Auto-Save Not Working
- Check browser console for errors
- Verify Supabase connection
- Ensure student has write permissions in RLS

### Payment Recording Issues
- Verify student ID exists
- Check amount is valid number
- Ensure payment date is valid

## Support & Maintenance

### Regular Tasks
- Review pending registration requests weekly
- Monitor exam results and student performance
- Update news/announcements regularly
- Verify payment records monthly

### Database Maintenance
- Regular backups (handled by Supabase)
- Monitor database usage
- Archive old exam data if needed

### Security
- Change admin password regularly
- Review RLS policies periodically
- Monitor access logs
- Update dependencies regularly

## Future Enhancements

Potential features for future versions:
- Report card generation (PDF export)
- Student attendance tracking
- Parent portal for viewing student progress
- SMS notifications for exam schedules
- Payment gateway integration
- Advanced analytics and dashboards
- Multi-language support
- Mobile app version

## License

This project is proprietary to Golden Star School. All rights reserved.

## Contact

For technical support or questions about the system, contact the school administration.
