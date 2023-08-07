---
layout: post
title: "docker-compose.yml para levantar MariaDB (MySQL) y phpMyAdmin."
categories: [Docker, MariaDB, PhpMyAdmin, MySQL]
excerpt: Es común desarrollar un proyecto que utilice MySQL como base de datos relacional y que necesites un administrador gráfico para gestionar tus BBDD. Aquí te mostraré como levanto MariaDB y phpMyAdmin de una vez con un docker compose file con persistencia.  
image: /assets/images/mariadb.jpg
lang: es
time: 5 min
author: Andrés
comments: true
---

[MariaDB]("https://mariadb.org/es/") es uno de los sistemas de gestión de bases de datos relacionales de código abierto más populares en el mundo y, por otro lado, [PhpMyadmin](https://www.phpmyadmin.net/) es otra gran herramienta estable y también software libre escrita en PHP que sirve para administrar tanto bases de datos en un servidor MySQL como MariaDB.

Y [docker](https://www.docker.com") será la herramienta que nos ayudará a correr estos dos servicios de forma fácil y rápida, con persistencia de datos. Así tendremos un ambiente listo en unos pocos minutos para seguir trabajando. 

## Docker compose up: MariaDB y PhpMyAdmin

**Requiere docker instalado**

Crea una carpeta en tu directorio de proyectos y dentro de esta un archivo `docker-compose.yml` con el siguiente contenido:

```yml
version: "3.8"

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
- [Link](https://hub.docker.com/_/mariadb) a la documentación completa de la imagen usada para MariaDB. 
- [Link](https://hub.docker.com/_/phpmyadmin/) a la documentación completa de la imagen usada para PhpMyadmin.

Guarda los cambios y luego levanta los contenedores con el siguiente comando:

```bash
docker compose up
```

Si quieres dejar corriendo los contenedores en background no olvides la flag `-d`. Podrás ingresar a PhpMyadmin en tu navegador en la dirección `http://localhost:8080`

Y eso es todo. **Importante**: Puedes usar las credenciales que quieras siempre que sea un ambiente de desarrollo local y no pretender usar esta definición de docker compose en un ambiente productivo.

