---
layout: post
title: Using MariaDB and phpMyAdmin with Docker and Docker Compose
categories:
  - Docker
excerpt: >-
  Quickly and efficiently configure MariaDB and phpMyAdmin in Docker Compose to
  simplify the management of your databases in your development environment.
image: /assets/images/mariadb-phpmyadmin-docker.webp
lang: en
time: 5 min
author: Andrés
comments: true
---
[MariaDB]("https://mariadb.org/es/") is one of the most popular open source relational database management systems in the world, and on the other hand, [PhpMyadmin](https://www.phpmyadmin.net/) is another great stable and also free software tool written in PHP that serves to manage both databases on a MySQL server and MariaDB.

And [docker](https://www.docker.com") will be the tool that will help us to run these two services in an easy and fast way, with data persistence. So we will have an environment ready in a few minutes to continue working.

## Docker compose up: MariaDB and PhpMyAdmin

**Installation of Docker is required. If you haven't done so already, please follow the official guides provided [here.](https://docs.docker.com/engine/install)**

Create a folder in your project directory and inside it a `docker-compose.yml` file with the following content:

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

**Update: I removed the version property from the file because it is now deprecated. [ref](https://github.com/compose-spec/compose-spec/blob/master/spec.md#version-top-level-element-obsolete)**

- [Link](https://hub.docker.com/_/mariadb) to the complete documentation of the image used for MariaDB.
- [Link](https://hub.docker.com/_/phpmyadmin/)to the full documentation of the image used for PhpMyadmin.

Save the changes and then raise the containers with the following command:

```bash
docker compose up
```

If you want to leave the containers running in background don't forget the `-d` flag. You will be able to access PhpMyadmin in your browser at `http://localhost:8080`.

And that's it. **Important**: You can use whatever credentials you want as long as it is a local development environment and do not pretend to use this docker compose definition in a productive environment.

