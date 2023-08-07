---
layout: post
title: "docker-compose.yml for raise up PostgreSQL and pgAdmin."
categories: [Docker, pgAdmin, PostgreSQL]
excerpt: PostgreSQL and pgAdmin is a common stack to use when developing a web project. In this article, we will see how to easily and quickly deploy these two tools with docker compose.
image: /assets/images/postgresql.jpg
lang: en
time: 5 min
author: Andrés
comments: true
---

Translated with www.DeepL.com/Translator

The [PostgreSQL](https://www.postgresql.org/) database is an open source object-relational database system. PostgreSQL has a graphical user interface (GUI) administration control for database administration called [pgAdmin](https://www.pgadmin.org/). pgAdmin is a design and management interface for the PostgreSQL database. Simple operations, datasheets and databases can be performed with pgAdmin by interacting with the local file system of the database allowed by the user.

[Docker](https://www.docker.com) will be the tool that will help us to run these two services easily and quickly, with data persistence. This way we will have an environment ready in a few minutes to continue working.


## Docker compose up: PostgreSQL y pgAdmin

**Requires docker installed**

Create a folder in your project directory and inside it a `docker-compose.yml` file with the following content:

```yml
version: '3.8'
services:
  db:
    container_name: pg_container
    image: postgres
    restart: always
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: admin
      POSTGRES_DB: my_db
      PGDATA: /var/lib/postgresql/data
    ports:
      - 5432:5432
    volumes:
      - pgdata:/var/lib/postgresql/data
  pgadmin:
    container_name: pgadmin4_container
    image: dpage/pgadmin4
    restart: always
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@admin.com
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    volumes:
      - pgadmin-data:/var/lib/pgadmin

volumes:
  pgdata:
  pgadmin-data:

```
- [Link](https://hub.docker.com/_/postgres/) to the full documentation of the image used for PostgreSQL.
- [Link](https://hub.docker.com/r/dpage/pgadmin4/) to the full documentation of the image used for pgAdmin.

Save the changes and then raise the containers with the following command:

```bash
docker compose up
```
If you want to leave the containers running in the background don't forget the `-d` flag. You will be able to access pgAdmin in your browser at `http://localhost:5050`.

And that's it. **Important**: You can use whatever credentials you want as long as it is a local development environment and do not pretend to use this definition of docker compose in a productive environment.
