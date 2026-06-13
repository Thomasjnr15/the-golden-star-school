# Golden Star School Management System

A complete school management system built with **React + Supabase**, featuring a public website, student portal, admin dashboard, CBT exam system, result management, and AI-powered question generation.

## 🎯 Features

### Public Website (CMS)
- Landing page with hero section, about us, news feed, fees information
- Admission form and contact page
- Fully editable content via admin settings
- Responsive design for all devices

### Student Portal
- Student login/registration system
- Exam dashboard with available exams
- Full CBT (Computer-Based Test) exam interface with:
  - Question navigator
  - Countdown timer
  - Auto-save functionality
  - Answer review before submission
- Results page with score display and answer review
- Access control: Students see only published results

### Admin Dashboard
Complete management system with 10 tabs:

1. **Students**: Add, view, search, and delete students
2. **Exams**: Create exams, manage questions, publish/unpublish
3. **AI Questions**: Generate exam questions using Groq API
4. **Results**: Score grid, Excel import/export, individual/batch publish
5. **Report Cards**: Generate PDF report cards, publish by term/session
6. **News**: Create and manage school announcements
7. **Payments**: Track student fee payments
8. **Registrations**: Process student registration requests
9. **Settings**: Manage school info, website content, payment details
10. **Overview**: Dashboard statistics

### Security Features
- Role-based access control (Admin/Student)
- Row-Level Security (RLS) policies in Supabase
- Result visibility control (students see only published results)
- Secure password hashing with bcryptjs
- JWT token-based authentication
- Protected routes with role verification

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm package manager
- Supabase account (free tier available at supabase.com)
- Groq API key (optional, for AI question generation)

### 1. Environment Setup

Create a `.env.local` file in the `client/` directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these values from your Supabase project settings.

### 2. Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Run the SQL scripts in order:
   ```bash
   # In Supabase SQL Editor, run:
   # 1. supabase/schema.sql (creates all tables and functions)
   # 2. supabase/rls.sql (enables security policies)
   # 3. supabase/seed.sql (optional: adds demo data)
   ```

3. Enable Row-Level Security (RLS) on all tables in Supabase dashboard

### 3. Install Dependencies

```bash
cd /home/ubuntu/golden-star-school
pnpm install
```

### 4. Start Development Server

```bash
pnpm dev
```

The app will be available at `http://localhost:3000`

### 5. Demo Credentials

**Admin Login:**
- Email: `admin@goldenstarschool.edu.ng`
- Password: `Admin@1234`

**Student Login:**
- Registration: `GSS/2026/001`
- Password: `Admin@1234`

## 📁 Project Structure

```
client/
  src/
    pages/              # Page components (Home, Login, Dashboard, etc.)
    components/         # Reusable UI components
    admin/              # Admin dashboard components
    contexts/           # React contexts (Auth, Theme)
    lib/                # Utility functions (Supabase client, auth)
    index.css           # Global styles with Tailwind
supabase/
  schema.sql            # Database schema and functions
  rls.sql               # Row-Level Security policies
  seed.sql              # Demo data
```

## 🔐 Authentication Flow

1. **Admin Login**: Email-based authentication
2. **Student Login**: Registration number-based authentication
   - Registration numbers are converted to emails internally: `gss_GSS_2026_001@goldenstarschool.internal`
3. **Session Management**: Supabase handles JWT tokens automatically
4. **Role-Based Access**: AuthContext provides role information for route protection

## 📊 Database Schema

### Core Tables
- **profiles**: User accounts (admin/student)
- **students**: Student records with class and registration number
- **exams**: Exam definitions with schedule and duration
- **questions**: Exam questions with multiple choice options
- **exam_sessions**: Student exam attempts with auto-save
- **student_answers**: Individual question responses
- **exam_results**: Final scores and grades
- **score_components**: Subject-wise scores for report cards
- **report_cards**: Student report cards with grades
- **payments**: Fee payment tracking
- **registration_requests**: Student registration applications
- **school_settings**: CMS content for website
- **news**: School announcements
- **contact_messages**: Contact form submissions

### Security Functions
- `is_admin()`: Checks if user is admin
- `my_student_id()`: Gets current student's ID
- `submit_exam()`: Securely submits exam answers
- `approve_registration()`: Approves registration and creates account
- `calculate_class_positions()`: Calculates student rankings

## 🤖 AI Question Generator

The system includes an AI-powered question generator using Groq API:

1. **Get Groq API Key**: Sign up at https://console.groq.com (free tier available)
2. **Generate Questions**: 
   - Select exam, topic, and difficulty level
   - Specify number of questions (1-20)
   - AI generates questions with 4 options each
3. **Save to Exam**: Review and save generated questions directly to exam

## 📈 Results Management

### Publishing Results
- Individual publish: Publish one student's result
- Batch publish: Publish all results for an exam at once
- Students see results only after publishing

### Excel Import/Export
- **Export**: Download results as Excel file
- **Import**: Bulk upload scores from Excel template
- Automatic grade calculation (A-F based on percentage)

## 📄 Report Card Generation

### Features
- Generate PDF report cards with student info and scores
- Publish by term and session
- Student rankings in class
- Teacher remarks support
- Automatic grade calculation

### Workflow
1. Select term, session, and class
2. Review report cards
3. Add teacher remarks (optional)
4. Generate PDF (downloads automatically)
5. Publish for student access

## 🔄 GitHub Integration & Deployment

### Push to GitHub

```bash
# 1. Initialize git (if not already done)
cd /home/ubuntu/golden-star-school
git init
git add .
git commit -m "Initial commit: Golden Star School Management System"

# 2. Add GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/golden-star-school.git

# 3. Push to GitHub
git branch -M main
git push -u origin main
```

### Deploy to Manus

The project is already set up for deployment on Manus:

1. **Create Checkpoint**: Save your work
   ```bash
   # In Manus UI, click "Publish" button (requires checkpoint)
   ```

2. **Custom Domain** (optional):
   - In Manus Dashboard → Settings → Domains
   - Add your custom domain or use auto-generated domain

3. **Environment Variables**:
   - Manus automatically injects: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
   - No additional setup needed

### Deploy to Other Platforms

#### Vercel
```bash
# 1. Push to GitHub (see above)
# 2. Go to https://vercel.com
# 3. Import project from GitHub
# 4. Add environment variables:
#    - VITE_SUPABASE_URL
#    - VITE_SUPABASE_ANON_KEY
# 5. Deploy
```

#### Netlify
```bash
# 1. Push to GitHub
# 2. Go to https://netlify.com
# 3. Connect GitHub repository
# 4. Build settings:
#    - Build command: pnpm build
#    - Publish directory: dist
# 5. Add environment variables and deploy
```

#### Self-Hosted (Docker)
```bash
# 1. Build Docker image
docker build -t golden-star-school .

# 2. Run container
docker run -p 3000:3000 \
  -e VITE_SUPABASE_URL=your_url \
  -e VITE_SUPABASE_ANON_KEY=your_key \
  golden-star-school
```

## 🛠️ Development

### Available Scripts

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Type checking
pnpm check

# Format code
pnpm format
```

### Key Technologies

- **Frontend**: React 19, TypeScript, Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL + Auth)
- **UI Components**: shadcn/ui
- **Forms**: React Hook Form + Zod validation
- **Routing**: Wouter
- **PDF Generation**: jsPDF + jspdf-autotable
- **Excel**: SheetJS (xlsx)
- **AI**: Groq API (Mixtral 8x7B)
- **Notifications**: Sonner toasts

## 🔒 Security Best Practices

1. **Never commit `.env.local`**: It's in `.gitignore`
2. **Rotate Supabase keys**: Regularly update keys in Supabase dashboard
3. **Groq API Key**: Keep secure, don't share in public repos
4. **RLS Policies**: Ensure all tables have RLS enabled
5. **HTTPS**: Always use HTTPS in production
6. **Password Policy**: Enforce strong passwords for admin accounts

## 🐛 Troubleshooting

### "Failed to connect to Supabase"
- Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`
- Verify Supabase project is active
- Check network connectivity

### "Results not visible to students"
- Ensure results are published (not in draft)
- Check RLS policies allow student access
- Verify student is logged in

### "AI Question Generation fails"
- Verify Groq API key is valid
- Check API key has sufficient quota
- Ensure exam is selected before generating

### "PDF generation shows blank"
- Verify student has exam results
- Check score_components table has data
- Ensure report card is created

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Supabase documentation: https://supabase.com/docs
3. Check Groq API docs: https://console.groq.com/docs

## 📝 License

MIT License - Feel free to use for your school

## 🎓 Next Steps

1. **Customize**: Update school name, logo, and colors
2. **Add Teachers**: Create teacher accounts in admin panel
3. **Create Classes**: Add student classes in settings
4. **Upload Students**: Bulk import student data
5. **Create Exams**: Set up first exam with questions
6. **Go Live**: Deploy to production and share with students

---

**Built with ❤️ for Golden Star School**
