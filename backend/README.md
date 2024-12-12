# Schedule Builder Backend

- [Django](https://www.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)

## Setting up a development environment

### [Recommended development tools][recommended-development-tools]

[recommended-development-tools]: https://dev.izeni.net/izeni/izeni-django-template/-/wikis/recommended-development-tools

### Classic method

Install python requirements

```bash
pip install -r requirements.txt
```

Migrate the database

```bash
./manage.py migrate
```

Create a superuser to access the admin

```bash
./manage.py createsuperuser
```

Start a development webserver

```bash
./manage.py runserver
```

### Docker method

Build and start the stack:

```bash
docker-compose up -d
```

Create a superuser to access the admin:

```bash
docker-compose exec backend ./manage.py createsuperuser
```

## Typical development tasks

### Admin

Visit the admin in your browser at: [http://localhost:8000/admin](http://localhost:8000/admin)

### Lint

```bash
make lint
```

-or-

```bash
docker-compose exec backend make lint
```

### Test

```bash
make test
```

-or-

```bash
docker-compose exec backend make test
```

### Coverage

```bash
make coverage
```

-or-

```bash
docker-compose exec backend make coverage
```

### Django shell

Enter a Django shell:

```bash
make shell
```

-or-

```bash
docker-compose exec backend make shell
```

### Postgres shell

Enter a PostgresQL shell connected to the project database:

```bash
su postgres -c "psql schedule_builder"
```

-or-

```bash
docker exec -it schedule_builder_database_1 su postgres -c "psql schedule_builder"
```
