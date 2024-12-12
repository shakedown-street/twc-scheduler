#! /bin/bash
python /schedule_builder/manage.py migrate --noinput
python /schedule_builder/manage.py collectstatic --noinput
python /schedule_builder/manage.py runserver 0.0.0.0:8000
