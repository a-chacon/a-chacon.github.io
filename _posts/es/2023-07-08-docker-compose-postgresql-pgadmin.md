---
layout: post
title: "PostgreSQL y pgAdmin en Docker Compose: Inicio Rápido"
categories:
  - Docker
excerpt: >-
  Descubre cómo poner en marcha PostgreSQL y pgAdmin de manera ágil con Docker
  Compose. Una guía rápida para tener tus herramientas listas en cuestión de
  minutos en tu entorno de desarrollo local.
image: /assets/images/postgresql.jpg
lang: es
time: 5 min
author: Andrés
comments: true
redirect_from:
  - /docker/pgadmin/postgresql/2023/07/08/docker-compose-postgresql-pgadmin.html
---

La base de datos [PostgreSQL](https://www.postgresql.org/) es un sistema de **base de datos relacional** de objetos y de código abierto. PostgreSQL tiene una interfaz gráfica de usuario (GUI) para la administración de la base de datos llamada [pgAdmin](https://www.pgadmin.org/). **pgAdmin** es una interfaz de diseño y gestión para la base de datos PostgreSQL. Se pueden realizar operaciones, hojas de datos y bases de datos simples con pgAdmin interactuando con el sistema de archivos local de la base de datos permitido por el usuario.

[Docker](https://www.docker.com) será la herramienta que nos ayudará a levantar estos dos servicios de forma fácil y rápida, con persistencia de datos. Así tendremos un ambiente listo en unos pocos minutos para seguir trabajando.

## Docker compose up: PostgreSQL y pgAdmin

**Requiere docker instalado**

Crea una carpeta en tu directorio de proyectos y dentro de esta un archivo `docker-compose.yml` con el siguiente contenido:

```yml
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

**Actualización: Eliminé la propiedad `version` del archivo debido a que ya esta obsoleta. [ref](https://github.com/compose-spec/compose-spec/blob/master/spec.md#version-top-level-element-obsolete)**

- [Link](https://hub.docker.com/_/postgres/) a la **documentación completa** de la imagen usada para PostgreSQL.
- [Link](https://hub.docker.com/r/dpage/pgadmin4/) a la **documentación completa** de la imagen usada para pgAdmin.

Guarda los cambios y luego levanta los contenedores con el siguiente comando:

```bash
docker compose up
```

Si quieres dejar corriendo los contenedores en background no olvides la flag `-d`. Podrás ingresar a pgAdmin en tu navegador en la dirección `http://localhost:5050`

![página principal de pgAdmin](/assets/images/pgadmin.png)

Y eso es todo. **Importante**: Puedes usar las credenciales que quieras siempre que sea un ambiente de desarrollo local y no pretender usar esta definición de docker compose en un ambiente productivo.

## Docker Compose Files For development

Acabo de publicar un repositorio incluyendo este archivo de docker compose (archivos que uso a diario para trabajar). Puedes clonarlo y levantar todos los contenedores que necesites para desarrollar tus aplicaciones. También está abierto a contribuciones:

<https://codeberg.org/a-chacon/docker-compose-for-development>
