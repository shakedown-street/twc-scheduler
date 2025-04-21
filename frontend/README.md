# Schedule Builder Frontend

The frontend for the Schedule Builder application is built using React and TypeScript. It provides an intuitive user interface for managing technicians, clients, and appointments.

## Requirements

- Node.js 16+
- npm or yarn

## Setup

### Local Development

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd schedule-builder/frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm start
   ```

4. Access the application at `http://localhost:5173`.

### Using Docker

1. Build and start the containers:

   ```bash
   docker-compose up -d
   ```

2. Access the application at `http://localhost:5173`.

## Building for Production

1. Build the project:

   ```bash
   npm run build:production
   ```

2. The production-ready files will be in the `dist/` directory.

## Deployment

1. Use the production Docker Compose file:

   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

2. Ensure environment variables are set for production (e.g., API base URL).
