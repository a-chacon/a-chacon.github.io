---
layout: post
title: Automatiza Tus Lanzamientos de Ruby Gems
categories:
  - RubyGem
excerpt: >-
  Descubre cómo automatizar los lanzamientos y la publicación de tus gemas en
  RubyGems usando release-please y GitHub Actions.
image: /assets/images/ruby.webp
author: Andrés
comments: true
---
Hace unos días lancé [OasRails](https://github.com/a-chacon/oas_rails), un engine de Rails para generar **documentación interactiva** y de forma simple para tus **APIs**. Un motor de Rails es una gema, y como tal debe ser empaquetada y subida a un servicio de alojamiento de gemas, en este caso [RubyGems](https://rubygems.org/). Así que me topé con la necesidad de automatizar el proceso de lanzamientos y fue así como llegué a [release-please](https://github.com/googleapis/release-please).

Release Please, como su repositorio dice, es una herramienta para automatizar la **generación del CHANGELOG**, la creación de **releases en GitHub**, y los **incrementos de versión** para tus proyectos. Y la mejor forma de correr Release Please es mediante [GitHub Actions](https://docs.github.com/en/actions).

**¿Por qué este blog post si ya existen varios?** La verdad es que no encontré ninguno que hable sobre cómo configurar la versión 4 de Release Please.

Con esto dicho, aquí te dejo los pasos a seguir:

1. Crear el archivo con la definición del workflow en la ruta `.github/workflows/release-please.yml` y dentro del archivo agregar esto:

   ```yml
   on:
     push:
       branches:
         - main

   permissions:
     contents: write
     pull-requests: write
     id-token: write

   name: release-please

   jobs:
     release-please:
       runs-on: ubuntu-latest
       steps:
         - uses: googleapis/release-please-action@v4
           id: release
           with:
             token: ${{ secrets.RELEASE_PLEASE_TOKEN }}
             config-file: .release-please-config.json
         - uses: actions/checkout@v4
           if: ${{ steps.release.outputs.release_created }}
         - name: Set up Ruby
           uses: ruby/setup-ruby@v1
           with:
             bundler-cache: true
           if: ${{ steps.release.outputs.release_created }}
         - uses: rubygems/release-gem@v1
           if: ${{ steps.release.outputs.release_created }}
   ```

   Elige tu **rama principal** desde la cual deseas realizar los lanzamientos. Luego, para que esto funcione, debemos realizar los siguientes pasos, así que espera y no hagas el commit aún.

2. Crea un **secret** en tu repositorio con el nombre de `RELEASE_PLEASE_TOKEN` o el que tú prefieras, solo no te olvides de actualizar el nombre que está definido en el archivo anterior. Si no sabes cómo agregar un secret, [aquí te dejo una guía.](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)

3. Habilita la opción para que **GitHub Actions** pueda crear **PR** en tu repositorio. Esto lo realizas en **Settings -> Actions -> General** y habilitas la opción que dice más o menos así: Permitir que las acciones de GitHub creen y aprueben **pull requests**.

   ![Ejemplo de dónde encontrar la configuración para permitir que GitHub Actions cree PR](https://jhale.dev/assets/img/posts/auto_merging_prs/org_actions_prs_permissions.png)

4. Release Please se encarga de documentar el release, pero la publicación de la gema en **RubyGems** es hecha por la action [rubygems/release-gem](https://github.com/rubygems/release-gem). Para que pueda hacerlo, debes agregarlo a [Trusted Publishing](https://guides.rubygems.org/trusted-publishing/).

5. Finalmente, los archivos de configuración que necesita Release Please y que debes agregar a la raíz de tu repositorio:

   - `.release-please-config.json` con un contenido como el siguiente:

   ```yml
   {
     "release-type": "ruby",
     "packages":
       {
         ".":
           {
             "release-type": "ruby",
             "package-name": "YOUR RUBY GEM NAME",
             "version-file": "lib/YOUR RUBY GEM NAME/version.rb",
           },
       },
   }
   ```

   - `.release-please-manifest.json` con la version de tu gema:

   ```yml
   { ".": "0.3.0" }
   ```

**Te recomiendo que leas las documentaciones oficiales de cada herramienta que se usa en el proceso.**

Release Please sigue las indicaciones de [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) para crear tu changelog y saber cuándo pasar de versión, por lo que debes seguir esta convención para que todo funcione de forma correcta.

Con estos simples pasos podrás tener un **release automático**, donde lo único que necesitarás es aprobar el PR cuando consideres que está listo. El proceso será: El workflow corre una vez y genera un PR, si ya está, lo actualiza. Segundo paso, apruebas el PR y se ejecutará la segunda parte del workflow, la parte de publicar la gema. Y con eso se termina el proceso.

Espero que te sirva de ayuda. Para mí fue un día completo de investigación para llegar a hacerlo funcionar, puesto que los posts que encontré lo hacían con la versión 2 y la publicación de la gema era de una forma menos segura. Pero valió la pena, se hace bastante simple el proceso, puedes hacer los releases que necesites y no tendrás que preocuparte de mantener el changelog actualizado o construir la gema para publicarla.

