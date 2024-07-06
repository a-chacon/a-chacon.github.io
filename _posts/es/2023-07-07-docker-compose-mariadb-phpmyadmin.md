---
layout: post
title: Utilizando MariaDB y phpMyAdmin con Docker y Docker Compose
categories:
  - Docker
excerpt: >-
  Configura rápida y eficazmente MariaDB y phpMyAdmin en Docker Compose para
  simplificar la gestión de tus bases de datos en tu entorno de desarrollo.
image: /assets/images/mariadb-phpmyadmin-docker.webp
lang: es
time: 5 min
author: Andrés
comments: true
---
[MariaDB]("https://mariadb.org/es/") es uno de los sistemas de gestión de bases de datos relacionales de código abierto más populares en el mundo y, por otro lado, [PhpMyadmin](https://www.phpmyadmin.net/) es otra gran herramienta estable y también software libre escrita en PHP que sirve para administrar tanto bases de datos en un servidor MySQL como MariaDB.

Y [docker](https://www.docker.com") será la herramienta que nos ayudará a correr estos dos servicios de forma fácil y rápida, con persistencia de datos. Así tendremos un ambiente listo en unos pocos minutos para seguir trabajando.

## Docker compose up: MariaDB y PhpMyAdmin

**Se requiere tener Docker instalado. Si no lo tienes, puedes seguir las guías oficiales [aquí.](https://docs.docker.com/engine/install)**

Crea una carpeta en tu directorio de proyectos y dentro de esta un archivo `docker-compose.yml` con el siguiente contenido:

```yml
services:
  mysql:
    image: mariadb:latest
    ports:
      - 3306:3306
    environment:
      MYSQL_ROOT_PASSWORD: rootpass
      MYSQL_USER: abc
      MYSQL_PASSWORD: abc123
    volumes:
      - mysql:/var/lib/mysql
    restart: unless-stopped

  phpmyadmin:
    image: phpmyadmin:latest
    ports:
      - 8080:80
    environment:
      PMA_HOST: mysql
      PMA_USER: auser
      PMA_PASSWORD: pass12345
    restart: unless-stopped

volumes:
  mysql:
```

**Actualización: Eliminé la propiedad `version` del archivo debido a que ya esta obsoleta. [ref](https://github.com/compose-spec/compose-spec/blob/master/spec.md#version-top-level-element-obsolete)**

- [Link](https://hub.docker.com/_/mariadb) a la documentación completa de la imagen usada para MariaDB.
- [Link](https://hub.docker.com/_/phpmyadmin/) a la documentación completa de la imagen usada para PhpMyadmin.

Guarda los cambios y luego levanta los contenedores con el siguiente comando:

```bash
docker compose up
```

Si quieres dejar corriendo los contenedores en background no olvides la flag `-d`. Podrás ingresar a PhpMyadmin en tu navegador en la dirección `http://localhost:8080`

Y eso es todo. **Importante**: Puedes usar las credenciales que quieras siempre que sea un ambiente de desarrollo local y no pretender usar esta definición de docker compose en un ambiente productivo.

