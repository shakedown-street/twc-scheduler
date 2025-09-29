# Schedule Builder

The Schedule Builder is a specialized web application designed to efficiently match therapy technicians with clients based on complex scheduling requirements. The system's core strength lies in its sophisticated matching algorithm that automatically finds available technicians who meet all client requirements, significantly reducing the time and effort needed for appointment scheduling.

## Core Functionality

### Intelligent Technician Matching

- **Automated Availability Matching**: Instantly finds technicians available during requested time slots
- **Skill Level Matching**: Ensures technicians meet or exceed client skill level requirements
- **Language Requirement Matching**: Automatically filters for Spanish-speaking technicians when required
- **Hours Optimization**: Prevents over-scheduling by tracking technician hours per day and week
- **Conflict Prevention**: Automatically detects and prevents scheduling conflicts

### Appointment Management

- Schedule appointments between matched technicians and clients
- Track technician and client availability
- Support for both in-clinic and remote appointments
- Appointment notes and documentation

### Technician Management

- Track technician skill levels (1-3)
- Manage Spanish-speaking requirements
- Set maximum hours per day and requested hours per week
- Customize technician display colors
- Track technician availability and scheduling

### Client Management

- Track client prescribed hours
- Manage client skill level requirements
- Track Spanish-speaking requirements
- Monitor client evaluation status
- Track client onboarding status

## Technical Architecture

### Backend Stack

- **Framework**: Django 4.2 with Django REST Framework
- **Database**: PostgreSQL
- **Authentication**: Django REST Knox
- **Containerization**: Docker support
- **Testing**: Comprehensive test suite

### Frontend Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **State Management**: React Context API
- **Routing**: React Router v7
- **Styling**: TailwindCSS and SCSS
- **UI Components**: shadcn/ui
- **HTTP Client**: Axios

## Key Technical Features

### Advanced Matching Algorithm

The system's matching algorithm is its most sophisticated and valuable component, designed to save significant time in finding suitable technicians. It:

1. **Multi-Factor Filtering**:

   - Filters technicians based on skill level requirements
   - Considers language requirements (Spanish-speaking)
   - Checks availability for specific time slots
   - Validates against maximum hours per day/week

2. **Conflict Prevention**:

   - Detects existing appointments that would conflict
   - Prevents double-booking of technicians
   - Ensures clients aren't scheduled for overlapping appointments
   - Validates against technician and client availability

3. **Hours Optimization**:

   - Tracks technician hours per day
   - Monitors weekly hour limits
   - Ensures compliance with requested hours
   - Prevents over-scheduling

4. **Validation Warnings**:
   - Provides detailed warnings about potential issues
   - Highlights hours limit violations
   - Identifies skill level mismatches
   - Flags language requirement conflicts

## Conclusion

The Schedule Builder's most significant contribution is its sophisticated matching algorithm, which dramatically reduces the time and effort required to find suitable technicians for appointments. By automatically considering multiple factors such as availability, skill levels, language requirements, and scheduling constraints, the system ensures efficient and accurate appointment scheduling while preventing conflicts and over-scheduling. This intelligent matching capability makes the system particularly valuable for therapy practices that need to manage complex scheduling requirements efficiently.
