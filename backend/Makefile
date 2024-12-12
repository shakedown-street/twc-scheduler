run:
	./manage.py runserver
lint:
	black .
	isort .
	flake8 .
sec:
	bandit -r apps/ schedule_builder/
test:
	./manage.py test
coverage:
	coverage run
	coverage report
htmlcov:
	coverage run
	coverage html
static:
	./manage.py collectstatic
makemig:
	./manage.py makemigrations
mig:
	./manage.py migrate
super:
	./manage.py createsuperuser
shell:
	./manage.py shell_plus
urls:
	./manage.py show_urls
celery_worker:
	DJANGO_SETTINGS_MODULE=schedule_builder.settings.dev celery -A schedule_builder worker -l info
