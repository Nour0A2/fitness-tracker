# 🏋️ Fitness Tracker

A social fitness tracking app where you can create groups with friends and family, track your active days, build streaks, and compete for monthly prizes!

## ✨ Features

- 👥 **Create Groups**: Form groups with family, friends, or workout buddies
- 🔥 **Track Streaks**: Mark your active days and build impressive streaks
- 📊 **Leaderboards**: See who's the most consistent in your group
- 💰 **Prize Pool**: Monthly winner takes the prize pool (5DT per member)
- 📱 **Mobile Responsive**: Works seamlessly on all devices
- 🔐 **Secure Authentication**: Powered by Supabase Auth

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works great!)

### 1. Clone and Install

```bash
cd Fitness-Tracker
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for your database to be ready
3. Go to Project Settings > API
4. Copy your project URL and anon/public key

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Set Up Database

1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Open the `DATABASE_SCHEMA.md` file in this project
4. Copy and run each SQL script in order:
   - Create all tables (profiles, groups, group_members, activity_logs, streaks, monthly_winners)
   - Create the update_user_streak function

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

## 📖 How It Works

1. **Sign Up/Login**: Create an account or log in
2. **Create a Group**: Start a new group or join an existing one
3. **Contribute to Prize Pool**: Each member contributes 5DT to the monthly prize
4. **Track Your Activity**: Mark days when you work out
5. **Build Streaks**: Consecutive active days build your streak
6. **Compete**: Check the leaderboard to see rankings
7. **Win Prizes**: Most consistent member at month's end wins the prize pool!

## 🏗️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel (recommended)

## 📁 Project Structure

```
fitness-tracker/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── lib/
│   └── supabase/          # Supabase client utilities
│       ├── client.ts      # Browser client
│       ├── server.ts      # Server client
│       └── middleware.ts  # Auth middleware
├── middleware.ts          # Next.js middleware
├── DATABASE_SCHEMA.md     # Database setup instructions
└── README.md             # This file
```

## 🔜 Next Steps

The basic structure is set up! Here's what you can build next:

- [ ] Authentication pages (login/signup)
- [ ] Dashboard to view your groups
- [ ] Group creation and management
- [ ] Activity tracking interface
- [ ] Streak visualization
- [ ] Monthly leaderboard
- [ ] Winner announcement system
- [ ] User profile management
- [ ] Invite system for groups

## 🤝 Contributing

This is a personal project, but feel free to fork and customize it for your needs!

## 📝 License

MIT License - feel free to use this for your own fitness tracking needs!

## 🎯 Motivation

Stay consistent with your fitness goals by adding social accountability and friendly competition. When there's money on the line and your friends are watching, you're more likely to show up! 💪

