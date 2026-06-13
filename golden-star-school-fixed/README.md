# 🏫 Golden Star School Website
### Complete School Management System with CBT Exams

---

## 📋 What's Included

- ✅ Public landing page (Hero, About, News, Fees, Admission, Contact, Footer)
- ✅ Student login & dashboard
- ✅ CBT exam system (works on phone & laptop)
- ✅ Auto-save & auto-submit exams
- ✅ Instant results with answer review
- ✅ Full admin panel (students, exams, news, payments, settings)
- ✅ All content editable from admin panel — no coding needed

---

## 🗂️ Folder Structure

```
golden-star-school/
├── frontend/          ← React.js website
├── backend/           ← Node.js + Express API
├── database/          ← SQL schema for Supabase
└── README.md
```

---

## 🚀 STEP-BY-STEP SETUP GUIDE

---

### STEP 1: Set Up Supabase (Free Database)

1. Go to **https://supabase.com** and create a free account
2. Click **"New Project"**
3. Name it: `golden-star-school`
4. Choose a strong database password (save it!)
5. Select the region closest to Nigeria (e.g. Frankfurt or Singapore)
6. Click **"Create new project"** and wait 2 minutes

**Run the database schema:**
1. In Supabase, click **"SQL Editor"** on the left sidebar
2. Click **"New query"**
3. Open the file `database/schema.sql` from this project
4. Copy everything and paste into Supabase SQL editor
5. Click **"Run"** (green button)
6. You should see: *Success. No rows returned*

**Get your Supabase credentials:**
1. Go to **Settings → API** in your Supabase project
2. Copy **Project URL** → this is your `SUPABASE_URL`
3. Copy **service_role secret** key → this is your `SUPABASE_SERVICE_KEY`
   ⚠️ Use the `service_role` key (not the `anon` key) for the backend

---

### STEP 2: Set Up the Backend

1. Open your terminal and navigate to the backend folder:
```bash
cd golden-star-school/backend
```

2. Install dependencies:
```bash
npm install
```

3. Create your environment file:
```bash
cp .env.example .env
```

4. Open `.env` and fill in your values:
```
PORT=5000
FRONTEND_URL=http://localhost:5173
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here
JWT_SECRET=any-long-random-string-you-create
```

5. Start the backend:
```bash
npm run dev
```

You should see: `✅ Golden Star School server running on port 5000`

---

### STEP 3: Set Up the Frontend

1. Open a **new terminal window** and navigate to the frontend folder:
```bash
cd golden-star-school/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create your environment file:
```bash
cp .env.example .env
```

4. Start the frontend:
```bash
npm run dev
```

5. Open your browser and go to: **http://localhost:5173**

🎉 Your website is now running locally!

---

### STEP 4: First Login

**Admin Login:**
- URL: http://localhost:5173/admin/login
- Email: `admin@goldenstarschool.edu.ng`
- Password: `Admin@1234`
- ⚠️ **Change this password immediately from Settings!**

**Sample Student Login:**
- URL: http://localhost:5173/student-login
- Registration Number: `GSS/2026/001`
- Password: `Admin@1234`

---

## 🌐 DEPLOYMENT (Make It Live Online - Free)

---

### Deploy Database: Already live on Supabase ✅

---

### Deploy Backend to Railway (Free)

1. Go to **https://railway.app** and sign up with GitHub
2. Click **"New Project" → "Deploy from GitHub repo"**
3. Connect your GitHub account and select this repo
4. Select the **backend** folder as the root
5. Railway will detect Node.js automatically
6. Go to **Variables** tab and add all your `.env` values:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `JWT_SECRET`
   - `FRONTEND_URL` (your Netlify URL — add this after deploying frontend)
7. Click **Deploy**
8. Copy your Railway URL (looks like: `https://golden-star-backend.up.railway.app`)

---

### Deploy Frontend to Netlify (Free)

1. Go to **https://netlify.com** and sign up with GitHub
2. Click **"Add new site" → "Import from Git"**
3. Connect GitHub and select your repo
4. Set **Base directory**: `frontend`
5. Set **Build command**: `npm run build`
6. Set **Publish directory**: `frontend/dist`
7. Click **"Add environment variable"** and add:
   - `VITE_API_URL` = your Railway backend URL
8. Click **Deploy site**
9. Your site is live! You'll get a URL like: `https://golden-star-school.netlify.app`

---

### Final Step: Connect Frontend URL to Backend

1. Go back to Railway
2. Add/update the `FRONTEND_URL` variable with your Netlify URL
3. Railway will redeploy automatically

---

## 🔑 Default Login Credentials

| Role | Username/Email | Password |
|------|---------------|----------|
| Admin | admin@goldenstarschool.edu.ng | Admin@1234 |
| Student 1 | GSS/2026/001 | Admin@1234 |
| Student 2 | GSS/2026/002 | Admin@1234 |
| Student 3 | GSS/2026/003 | Admin@1234 |

⚠️ **Change all passwords after first login!**

---

## 📱 How to Use the Admin Panel

1. Go to `/admin/login`
2. Log in with admin credentials
3. **Settings** → Update school name, logo, colors, contact info
4. **Students** → Add all your students with reg numbers and passwords
5. **Exams** → Create CBT exams and add questions per class
6. **News** → Post announcements for the landing page
7. **Payments** → Record and track fee payments

---

## 📝 How CBT Exams Work

1. Admin creates an exam (title, subject, class, date, time, duration)
2. Admin adds multiple choice questions
3. Exam is automatically assigned to all students in that class
4. Students log in → Dashboard shows their assigned exams
5. On exam date/time, "Start Exam Now" button appears
6. Student answers questions — answers auto-save every 30 seconds
7. Timer auto-submits when time runs out
8. Results shown immediately after submission

---

## 🆘 Common Issues & Fixes

**"Cannot connect to server"**
→ Make sure backend is running on port 5000

**"Invalid credentials"**
→ Make sure you ran the SQL schema in Supabase

**Exam not showing for student**
→ Make sure the student's class matches the exam's class exactly

**Images not showing**
→ Upload images to Supabase Storage and use the public URL

---

## 📞 Need Help?

Use Claude (claude.ai) to help you:
- Fix any errors (paste the error message)
- Add new features
- Customize colors or layout
- Deploy to production

---

*Built for Golden Star School — Primary and Secondary Education*
*© 2026 Golden Star School. All rights reserved.*
