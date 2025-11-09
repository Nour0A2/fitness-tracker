# 📄 Pages Guide

## Available Pages

Your fitness tracker app now has the following pages:

### 1. 🏠 Landing Page (`/`)
**URL**: http://localhost:3000

The main landing page with:
- Hero section
- Feature cards (Groups, Streaks, Prizes)
- "How It Works" section
- **Get Started** button → Links to `/signup`
- **Login** button → Links to `/login`

---

### 2. 🔐 Login Page (`/login`)
**URL**: http://localhost:3000/login

Features:
- Email and password login form
- Error handling
- Link to signup page
- Link back to home
- **Warning banner** when Supabase is not configured

**What happens when you click Login:**
- If Supabase is configured: Authenticates user and redirects to `/dashboard`
- If Supabase is NOT configured: Shows warning message and disables the button

---

### 3. ✍️ Signup Page (`/signup`)
**URL**: http://localhost:3000/signup

Features:
- Full name, email, and password registration
- Creates user account in Supabase
- Creates user profile in database
- Link to login page
- Link back to home
- **Warning banner** when Supabase is not configured

**What happens when you click Sign Up:**
- If Supabase is configured: Creates account and redirects to `/dashboard`
- If Supabase is NOT configured: Shows warning message and disables the button

---

### 4. 📊 Dashboard (`/dashboard`)
**URL**: http://localhost:3000/dashboard

Features:
- Stats cards showing:
  - Current streak (placeholder: 0 days)
  - Number of groups (placeholder: 0)
  - Active days this month (placeholder: 0)
- Quick action buttons:
  - Mark Today Active
  - Create New Group
- Empty state with call-to-action

**Note**: This is currently a static page. It will be connected to real data once Supabase is configured.

---

## Current State

### ✅ What Works Now:
- All pages are accessible and render correctly
- Navigation between pages works
- Forms are functional (UI-wise)
- Responsive design works on mobile and desktop
- Dark mode support

### ⚠️ What Needs Supabase:
- Actual user authentication
- Creating user accounts
- Storing user data
- Accessing the dashboard with real data

### 🔧 To Enable Full Functionality:

1. **Set up Supabase** (see `SETUP_GUIDE.md`)
2. **Update `.env.local`** with your real credentials
3. **Run the database schema** from `DATABASE_SCHEMA.md`
4. **Restart the dev server**

---

## Testing the Pages

### Without Supabase (Current State):
1. Click "Get Started" on home page → Goes to signup page ✅
2. Click "Login" on home page → Goes to login page ✅
3. See warning banner on auth pages ✅
4. Navigate back to home ✅
5. Visit `/dashboard` directly → See empty dashboard ✅

### With Supabase (After Setup):
1. Sign up with email/password → Creates account ✅
2. Login with credentials → Authenticates user ✅
3. Redirects to dashboard after auth ✅
4. Protected routes work ✅

---

## Page Flow Diagram

```
┌─────────────┐
│   Home (/)  │
└──────┬──────┘
       │
       ├─── "Get Started" ──→ ┌──────────────┐
       │                      │ Signup       │
       │                      │ (/signup)    │
       │                      └──────┬───────┘
       │                             │
       │                             ↓
       │                      ┌──────────────┐
       └─── "Login" ─────────→│ Login        │
                              │ (/login)     │
                              └──────┬───────┘
                                     │
                                     ↓
                              ┌──────────────┐
                              │ Dashboard    │
                              │ (/dashboard) │
                              └──────────────┘
```

---

## Next Steps

To continue building the app, you can:

1. **Set up Supabase** to enable authentication
2. **Build group management** features
3. **Add activity tracking** functionality
4. **Create the leaderboard** view
5. **Add user profile** management

Just ask for help with any of these features! 🚀

