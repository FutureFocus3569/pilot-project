<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Childcare Dashboard Project Instructions

This is a Next.js 14 TypeScript project for managing 6 childcare centres with the following features:

## Project Structure
- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with role-based access (MASTER, ADMIN, USER)
- **AI Integration**: OpenAI API for the AI assistant

## Key Components
- **Dashboard**: Shows occupancy data (U2, O2, Total) for all 6 centres
- **Xero**: Financial integration page
- **Marketing**: Campaign management and analytics
- **Assistant**: AI-powered chat assistant for data insights

## Database Schema
- **Users**: Authentication and role management
- **Organizations**: Multi-tenant structure
- **Centres**: 6 childcare centres with capacity and metadata
- **OccupancyData**: Daily occupancy tracking (U2, O2, Total counts)
- **StaffHours**: Weekly staff hour tracking by type
- **ImportLog**: CSV import tracking

## UI Guidelines
- Use Tailwind CSS for styling
- Mobile-first responsive design
- Consistent color scheme: Blue primary (#3B82F6), Gray neutrals
- Lucide React icons for UI elements
- Cards and shadows for data presentation

## Data Patterns
- All data is scoped by organization (multi-tenant)
- Historical data from Jan 2024 - July 2025
- CSV import functionality for occupancy data
- Real-time dashboard updates

## Code Style
- Use TypeScript for type safety
- Server/Client component separation
- Prisma for database operations
- Zod for validation
- Custom hooks for data fetching

When generating code, prioritize:
1. Type safety with TypeScript
2. Mobile responsiveness
3. Accessibility (ARIA labels, keyboard navigation)
4. Performance (lazy loading, optimization)
5. Consistent styling patterns
