---
layout: post
title: "docker-compose.yml para levantar PostgreSQL y pgAdmin."
categories: [Docker, pgAdmin, PostgreSQL]
excerpt: PostgreSQL y pgAdmin es un stack común de usar al momento de desarrollar un proyecto web. En este artículo veremos como levantar estas dos herramientas de forma facíl y rápida con docker compose.
image: /assets/images/postgresql.jpg
lang: es
time: 5 min
author: Andrés
comments: true
---

La base de datos [PostgreSQL](https://www.postgresql.org/) es un sistema de base de datos relacional de objetos y de código abierto. PostgreSQL tiene un control de administración de interfaz gráfica de usuario (GUI) para la administración de la base de datos llamada [pgAdmin](https://www.pgadmin.org/). pgAdmin es una interfaz de diseño y gestión para la base de datos PostgreSQL. Se pueden realizar operaciones, hojas de datos y bases de datos simples con pgAdmin interactuando con el sistema de archivos local de la base de datos permitido por el usuario.

[Docker](https://www.docker.com) será la herramienta que nos ayudará a correr estos dos servicios de forma fácil y rápida, con persistencia de datos. Así tendremos un ambiente listo en unos pocos minutos para seguir trabajando. 

## Docker compose up: PostgreSQL y pgAdmin

**Requiere docker instalado**

Crea una carpeta en tu directorio de proyectos y dentro de esta un archivo `docker-compose.yml` con el siguiente contenido:

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
- [Link](https://hub.docker.com/_/postgres/) a la documentación completa de la imagen usada para PostgreSQL. 
- [Link](https://hub.docker.com/r/dpage/pgadmin4/) a la documentación completa de la imagen usada para pgAdmin.

Guarda los cambios y luego levanta los contenedores con el siguiente comando:

```bash
docker compose up
```

Si quieres dejar corriendo los contenedores en background no olvides la flag `-d`. Podrás ingresar a pgAdmin en tu navegador en la dirección `http://localhost:5050`

Y eso es todo. **Importante**: Puedes usar las credenciales que quieras siempre que sea un ambiente de desarrollo local y no pretender usar esta definición de docker compose en un ambiente productivo.

