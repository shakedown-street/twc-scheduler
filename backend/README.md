# Schedule Builder Backend

The backend for the Schedule Builder application is built using Django and Django REST Framework. It provides the core functionality for managing technicians, clients, appointments, and intelligent scheduling.

## Requirements

- Python 3.9+
- Django 4.2
- PostgreSQL
- Docker (optional, for containerized development)

## Setup

### Local Development

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd schedule-builder/backend
   ```

2. Create a virtual environment and activate it:

   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Apply migrations:

   ```bash
   python manage.py migrate
   ```

5. Run the development server:
   ```bash
   python manage.py runserver
   ```

### Using Docker

1. Build and start the containers:

   ```bash
   docker-compose up -d
   ```

2. Access the application at `http://localhost:8000`.

## Testing

Run the test suite using:

```bash
make test
```

## Linting

Ensure code quality with:

```bash
make lint
```

## Deployment

1. Use the production Docker Compose file:

   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

2. Ensure environment variables are set for production (e.g., database credentials, secret keys).
