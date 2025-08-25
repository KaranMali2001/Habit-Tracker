# Progress Tracking Dashboard

A full-featured progress tracking dashboard for an 8-week coding bootcamp journey with daily task completion tracking and automatic weekly report generation.

## Features

### 🎯 Core Functionality
- **Daily Task Management**: Create, track, and complete daily tasks with categories (DSA, Project, Writing, Learning, etc.)
- **Smart Skip Tracking**: Track skipped tasks with reasons that auto-populate daily notes
- **Time Tracking**: Log actual vs expected time spent on tasks
- **Auto-generated Daily Notes**: Automatically compile skip reasons and calculate metrics
- **Weekly Report Generation**: Automatic weekly summaries with completion rates and insights
- **Analytics Dashboard**: Visual charts and trends for progress tracking

### 🔒 Authentication & Security
- JWT-based authentication with secure cookie management
- Password hashing with bcrypt
- Protected routes with server-side auth checks

### 📱 User Experience
- **Responsive Design**: Desktop-first but fully mobile responsive
- **Real-time Updates**: Auto-save functionality for notes and instant task updates
- **Date Navigation**: Easy navigation between days with quick "Today" access
- **Color-coded Categories**: Visual task organization with priority indicators

### 📊 Analytics & Reporting
- **Daily Completion Trends**: Line charts showing progress over time
- **Category Distribution**: Pie charts breaking down task types
- **Weekly Progress**: Bar charts comparing week-over-week performance
- **Mood & Energy Correlation**: Track personal metrics alongside productivity

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, React
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with email/password login
- **UI Components**: Tailwind CSS + Shadcn/ui
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React

## Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (or use Prisma's local Postgres)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Update `.env` with your JWT secrets (database URL is pre-configured for local development):
   ```env
   # JWT (change these in production!)
   JWT_SECRET="your-super-secret-jwt-key-here-make-it-long-and-secure-change-this-in-production"
   JWT_EXPIRES_IN="7d"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-nextauth-secret-here-change-this-in-production"
   ```

3. **Initialize database:**
   ```bash
   npm run setup
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

## Usage Guide

### Getting Started
1. **Register**: Create your account with bootcamp start date and goals
2. **Login**: Access your personalized dashboard
3. **Add Tasks**: Create daily tasks with categories, priorities, and time estimates

### Daily Workflow
1. **Check Today's Tasks**: View all tasks for the current date
2. **Complete Tasks**: Click checkboxes and log actual time spent
3. **Skip with Reason**: If skipping tasks, provide reason (auto-added to notes)
4. **Write Notes**: Add learnings, challenges, and tomorrow's plan
5. **Track Mood/Energy**: Log your daily mood and energy level

### Weekly Reviews
1. **Generate Reports**: Automatic weekly summaries with metrics
2. **Write Blog Drafts**: Use the weekly report as a base for blog posts
3. **Reflect & Plan**: Add personal reflections and next week's goals
4. **Publish**: Mark reports as published when ready

### Analytics
- **Track Trends**: View completion rates over time
- **Category Analysis**: See which areas you focus on most
- **Weekly Comparison**: Compare performance across bootcamp weeks
- **Mood Correlation**: Understand how mood affects productivity

## Key Features Explained

### Auto-generation Logic
1. **Skip Reasons**: When tasks are skipped with reasons, they're automatically added to daily notes
2. **Daily Metrics**: Completion rates and time totals are calculated in real-time
3. **Weekly Summaries**: Aggregate data from 7 days to generate insights and recommendations

### Task Categories
- **DSA**: Data Structures & Algorithms practice
- **PROJECT**: Coding projects and portfolio work
- **WRITING**: Blog posts, documentation, reflections
- **LEARNING**: Tutorials, courses, research
- **APPLICATION**: Job applications and networking
- **INTERVIEW_PREP**: Mock interviews, preparation

### Priority System
- **LOW**: Optional or nice-to-have tasks
- **MEDIUM**: Standard importance (default)
- **HIGH**: Critical tasks requiring immediate attention

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run setup` - Initialize database and generate Prisma client
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Create and run migrations

## Project Structure
```
src/
├── app/                 # Next.js app router pages
│   ├── api/            # API routes
│   ├── login/          # Login page
│   ├── register/       # Registration page
│   ├── weekly/         # Weekly reports page
│   ├── analytics/      # Analytics dashboard
│   └── dashboard.tsx   # Main dashboard component
├── components/         # Reusable UI components
│   ├── ui/            # Shadcn/ui components
│   ├── TaskChecklist.tsx
│   ├── DailyNotesEditor.tsx
│   └── MetricsSummary.tsx
└── lib/               # Utilities and configurations
    ├── prisma.ts      # Database client
    ├── auth.ts        # Authentication utilities
    └── utils.ts       # General utilities
```

## Production Deployment

### Environment Setup
1. Set up PostgreSQL database
2. Update environment variables with production values
3. Run database migrations: `npm run db:migrate`
4. Deploy to your preferred platform (Vercel, Railway, etc.)

### Security Considerations
- Change default JWT secrets in production
- Use strong passwords and secure database connections
- Enable HTTPS
- Set appropriate CORS policies

## Development

This project uses:
- **Next.js 14+** with App Router and Turbopack
- **TypeScript** for type safety
- **Prisma** for database management
- **Tailwind CSS** for styling
- **Shadcn/ui** for UI components
- **Recharts** for data visualization

## Support

For issues or questions, please create an issue in the repository.

---

**Built with ❤️ for coding bootcamp success**
