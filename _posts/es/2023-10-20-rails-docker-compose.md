---
layout: post
title: "\U0001F680Guía general para correr Ruby on Rails con Docker\U0001F680"
category:
  - On Rails
excerpt: >-
  Montar Ruby on Rails en Docker ofrece aislamiento para evitar conflictos,
  portabilidad para llevar tu aplicación a cualquier lugar, escalabilidad sin
  esfuerzo, mantenimiento sencillo y colaboración eficiente en equipo.
image: /assets/images/railsdocker.png
lang: es
time: 3 min
author: Andrés
comments: true
---
Probablemente, ya conoces las ventajas de usar Docker, ya lo hemos escuchado o evidenciado en proyectos. Aquí te mostraré como llevar eso a tu aplicación Ruby on Rails. Para realizar lo que se propone necesitas una aplicación Rails, Docker instalado en tu computador y/o tu servidor y motivación para un par de pruebas y error.

**Esto es una explicación general y no una guía paso a paso. Puede que algunas definiciones necesiten más trabajo dependiendo de tu proyecto.**

## Dockerfile

Necesitarás un archivo `Dockerfile` en la raíz de tu proyecto con el siguiente contenido:

```Dockerfile
FROM ruby:3.2.2

RUN apt-get update && apt-get install -y libsodium-dev

WORKDIR /app

COPY Gemfile Gemfile.lock ./

RUN gem install bundler && bundle install

COPY . .

COPY entrypoint.sh /usr/bin/
RUN chmod +x /usr/bin/entrypoint.sh
ENTRYPOINT ["entrypoint.sh"]

```

Explicación paso a paso:

1. El comando FROM se utiliza para especificar la imagen base sobre la cual correrá el proyecto. En mi caso me sirve la imagen `ruby:3.2.2` porque mi proyecto utiliza esa versión de Ruby.
2. Si la imagen que eliges no viene con todos los paquetes que tu aplicación necesita, entonces tendrás que instalarlos. Eso es lo que pasa en la línea:

```
RUN apt-get update && apt-get install -y libsodium-dev
```

Por ejemplo, si tu aplicación utiliza libvips para el procesamiento de imágenes, entonces tendrás que agregar el comando correspondiente para instalarla aquí.
**Puedes fijarte si la imagen que eliges contiene el paquete que necesitas en la [página](<https://hub.docker.com/layers/library/ruby/3.2.2/images/sha256-cd6e6798429527289a12f541f75f2e632164>
9b5195bd88a0d97415bbc58cd45c?context=explore) de la imagen**

3. Definimos un directorio de trabajo
4. Copiamos el Gemfile al directorio de trabajo.
5. Instalamos las gemas de las que depende nuestro proyecto.
6. Copiamos el resto del proyecto.
7. Copiamos y definimos nuestro `ENTRYPOINT`

### ENTRYPOINT

¿Por qué un entrypoint? Básicamente, porque hay comandos que deben correr al momento de levantar un contenedor con nuestra imagen y no al momento de la construcción de la imagen. Un claro ejemplo de esto es el comando `db:migrate`.

Entonces necesitaremos de otro archivo en la raíz de nuestro proyecto llamado `entrypoint.sh` con el siguiente contenido:

```bash
#!/bin/bash

if [ -f tmp/pids/server.pid ]; then
  rm tmp/pids/server.pid
fi

RAILS_ENV=$RAILS_ENV bundle exec rails db:migrate

RAILS_ENV=$RAILS_ENV bundle exec rails s -b 0.0.0.0
```

Explicación paso a paso:

1. Definición de bash script para que corra como tal al momento de la ejecución.
2. Eliminamos cualquier server.pid previo.
3. Ejecutamos cualquier migración pendiente de nuestra aplicación.
4. Corremos nuestro servidor web.

**Puede que según tus necesidades tengas que crear diferentes entrypoints**. Imaginemos el caso de que estás usando [whenever](https://github.com/javan/whenever). Tu entrypoint deberá actualizar el crontab cada vez que se ejecute, pero tampoco quieres que todos tus contenedores corran los cronjobs al mismo tiempo. Entonces ahí es cuando necesitas de un contenedor que corra tu servicio web y otro con tus cronjobs. O sea, dos entrypoints diferentes para el mismo proyecto.

Para resolver ese caso puedes crear una carpeta en tu proyecto con el nombre `entrypoints` y dejar tus diferentes entrypoints ahi. Tu Dockerfile queda con un entrypoint por "defecto" y cuando necesites lo [sobreescribes](https://docs.docker.com/engine/reference/builder/#entrypoint) al momento de correr un contenedor con el flag `--entrypoint`.

### ENVs

Dependiendo del entorno en que estamos ejecutando nuestro proyecto, es importante agregar algunas ENVs al contenedor:

1. **RAILS_MASTER_KEY** a mi parecer es la forma más fácil de permitirle a la app leer el archivo `credentials.yml.enc`.
2. **DATABASE_URL** url completa a tu base de datos, ya sea mysql o postgresql.
3. **RAILS_SERVE_STATIC_FILES** si tus archivos javascript y css serán servidos por tu app y no un CDN.
4. **RAILS_LOG_TO_STDOUT** así tus logs podrán ser vistos por el servicio que uses y por ti.

## Test en local

Si quieres probar tu imagen puedes construirla en local con el siguiente comando:

```
docker build -t rubyapp .
```

Luego puedes correr un contenedor a partir de tu imagen:

```
docker run -p 3000:3000 -e DATABASE_URL={YOUR_DATABASE_URL_HERE} rubyapp
```

Observación: Aquí es donde necesitaras agregar las variables de entorno, al menos la base de datos.

---

Nuestro Dockerfile puede volverse más complejo según nuestras necesidades, pero siempre que se comprenda su funcionamiento, no resultará difícil adaptarlo y realizar modificaciones. Espero que estas indicaciones sean de utilidad, y si consideras que falta algún tema importante, no dudes en dejarme un comentario al respecto.

_disfruta programando_

