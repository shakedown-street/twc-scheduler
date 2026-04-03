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
