#!/bin/bash

sleep 3 # avoid database being unavailable

(
    # Migrate
    python /schedule_builder/manage.py migrate --noinput

    # Fixures
    # ./manage.py loaddata <fixture_file>

    # Collect static
    ## If there are new static files, you'll need to copy these out of
    ## the container, and onto the server, so Caddy can serve them up.
    python /schedule_builder/manage.py collectstatic --noinput

    # Start server
    uwsgi --ini server/uwsgi.ini
) || exit 1
