FROM postgres:18.1

RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-18-cron \
    postgresql-18-tds-fdw \
    freetds-dev \
    && rm -rf /var/lib/apt/lists/*

RUN echo "shared_preload_libraries = 'pg_cron'" >> /usr/share/postgresql/postgresql.conf.sample \
    && echo "cron.database_name = 'badminton'" >> /usr/share/postgresql/postgresql.conf.sample

COPY BADMINTON.sql /docker-entrypoint-initdb.d/BADMINTON.sql
COPY seeds.sql /docker-entrypoint-initdb.d/seeds.sql

EXPOSE 5432
