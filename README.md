# Childcare Dashboard

A comprehensive management platform for 6 childcare centres, featuring occupancy tracking, AI-powered insights, and integrated financial reporting.

## Features

- **Dashboard**: Real-time occupancy tracking (U2, O2, Total) for all centres
- **Xero Integration**: Financial data synchronization
- **Marketing**: Campaign management and analytics
- **AI Assistant**: Intelligent insights and data analysis
- **Multi-tenant**: Role-based access control (Master, Admin, User)
- **Mobile-friendly**: Responsive design for all devices

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **AI**: OpenAI API integration
- **Icons**: Lucide React
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- OpenAI API key (for AI assistant)

### Installation

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Copy `.env` and update with your credentials:
   ```bash
   DATABASE_URL="postgresql://username:password@localhost:5432/childcare_dashboard"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   OPENAI_API_KEY="your-openai-api-key"
   ```

3. **Set up the database**:
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

4. **Seed the database** (optional):
   ```bash
   npx prisma db seed
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```

6. **Open the application**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── (dashboard)/       # Dashboard layout group
│   │   ├── dashboard/     # Main dashboard page
│   │   ├── xero/         # Xero integration
│   │   ├── marketing/    # Marketing tools
│   │   └── assistant/    # AI assistant
│   └── api/              # API routes
├── components/           # Reusable UI components
│   ├── layout/          # Navigation, header, sidebar
│   └── dashboard/       # Dashboard-specific components
├── lib/                 # Utilities and configurations
└── types/              # TypeScript type definitions
```

## Database Schema

### Core Models
- **User**: Authentication and roles
- **Organization**: Multi-tenant structure
- **Centre**: Childcare centre information
- **OccupancyData**: Daily occupancy tracking
- **StaffHours**: Weekly staff hour records
- **ImportLog**: CSV import tracking

### Key Features
- Row Level Security (RLS) for multi-tenancy
- Historical data tracking (Jan 2024 - July 2025)
- CSV import functionality
- Audit logging

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open database GUI
- `npx prisma migrate dev` - Run database migrations

### CSV Data Import

The application supports importing historical occupancy data via CSV. Expected format:

```csv
date,centre_code,u2_count,o2_count,total_count,capacity
2024-01-01,CC1,12,28,40,50
2024-01-01,CC2,15,35,50,60
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy automatically

### Environment Variables for Production

```bash
DATABASE_URL="your-production-database-url"
NEXTAUTH_SECRET="your-production-secret"
NEXTAUTH_URL="https://yourdomain.com"
OPENAI_API_KEY="your-openai-api-key"
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is private and proprietary.
