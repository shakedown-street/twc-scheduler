FROM    python:3.13

ENV     PYTHONUNBUFFERED=1 PYTHONPYCACHEPREFIX=/var/lib/pycache
RUN     mkdir /var/lib/pycache

WORKDIR /schedule_builder/
COPY    requirements.txt /schedule_builder/
RUN     pip install -r /schedule_builder/requirements.txt

ADD     . /schedule_builder/