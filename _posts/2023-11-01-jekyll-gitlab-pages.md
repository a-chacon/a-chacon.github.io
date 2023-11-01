---
layout: post
title: "Crea Tu Sitio Web Gratis: Jekyll y GitLab Pages te Lo Hacen Posible"
categories: [Web, Jekyll]
excerpt: "Descubre cómo montar tu propio sitio web sin costo alguno utilizando Jekyll y GitLab Pages." 
image: /assets/images/gitlabpages.jpg
lang: es
time: 5 min
author: Andrés
comments: true
---

Este post tiene como objetivo mostrar cómo realizar el despliegue de tu sitio Jekyll en GitLab Pages. Es la continuación de la versión anterior, [Crea Tu Sitio Web Gratis: Jekyll y GitHub Pages te Lo Hacen Posible](/web/jekyll/2023/10/02/make-your-wersite-with-jekyll-githubpages.html). Si aún no has tenido la oportunidad de revisar los pasos anteriores, te recomendamos hacerlo antes de continuar. Luego, podrás regresar y seguir estos pasos para desplegar tu sitio en GitLab Pages. Esta plataforma ofrece la ventaja de permitirte mantener tus repositorios privados mientras tu página web sigue siendo pública, una opción que en GitHub solo está disponible en cuentas Enterprise.

Entonces continuando con nuestro proyecto `mysite`:

## 1. GitLab CI

Deberás crear un archivo en la raíz de tu proyecto llamado `.gitlab-ci.yml` y agregar el siguiente contenido: 

```yaml
image: ruby:3.2.2

workflow:
  rules:
    - if: $CI_COMMIT_BRANCH

cache:
  paths:
    - vendor/

before_script:
  - gem install bundler
  - bundle install --path vendor

pages:
  stage: deploy
  script:
    - bundle exec jekyll build -d public
  artifacts:
    paths:
      - public
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
  environment: production

test:
  stage: test
  script:
    - bundle exec jekyll build -d test
  artifacts:
    paths:
      - test
  rules:
    - if: $CI_COMMIT_BRANCH != "main"

```

# GitLab

Si ya tienes cuenta en GitLab entonces bien, si no puedes crearte una [aquí](https://gitlab.com/users/sign_up)

## Repositorio

Le damos a crear un nuevo proyecto, luego a `Create a blank project`:

![New project in gitlab](/assets/images/gitlab_new_project.png)

**Desmarcamos la opción initialize with a README**

Completamos el resto del formulario y le damos a crear.

Luego seguiremos los pasos que se indican en la sección `Push an existing Git repository`, en mi caso serían los siguientes:

```
cd mysite
git remote rename origin old-origin
git remote add origin git@gitlab.com:a-chacon/mysite.git
git push --set-upstream origin --all
git push --set-upstream origin --tags
```

**No olvides hacer commit del archivo .gitlab-ci.yml que creamos en los pasos anteriores**

Despues de nuestro push podremos ver nuestro primer Job corriendo.

![Gitlab pages jobs](/assets/images/gitlab_pages_jobs.png)

## Pages

Cuando el Job termine, podrás ir en la sección del costado derecho de tu repositorio al tab `Deploy` y seleccionar `Pages` para encontrar la url que le asigno GitLab Pages a tu proyecto:

![Gitlab pages url](/assets/images/gitlab_pages.png)

## Visibilidad

Si creaste tu repositorio como `privado` deberás ajustar la visibilidad de tu página para que esta pueda ser vista por todos siguiendo las instrucciones que te da gitlab:

> Para poner su sitio web a disposición del público, vaya a Configuración del proyecto > General > Visibilidad y seleccione Todos en la sección de páginas

---

Y eso es todo por este mini post. Cualquier duda o comentario puedes dejarlo acá abajo👇.
