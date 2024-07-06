---
layout: post
title: 'Crea Tu Sitio Web Gratis: Jekyll y GitHub Pages te Lo Hacen Posible'
category:
  - Jekyll
excerpt: >-
  Descubre cómo montar tu propio sitio web sin costo alguno utilizando Jekyll y
  GitHub Pages.
image: /assets/images/jekyll.png
lang: es
time: 5 min
author: Andrés
comments: true
redirect_from:
  - /web/jekyll/2023/10/02/make-your-wersite-with-jekyll-githubpages.html
---
[Jekyll](https://jekyllrb.com/) es un motor de generación de sitios web estáticos y [GitHub Pages](https://pages.github.com/) es un servicio de alojamiento gratuito proporcionado por GitHub. Combinando estas dos herramientas, puedes crear fácilmente un sitio web estático para mostrar tus proyectos, blogs o cualquier otro contenido que desees compartir.

## Jekyll

### Instalando Jekyll

Para instalar jekyll necesitas Ruby en tu computadora. Puedes verificar si Ruby está instalado ejecutando:

```shell
ruby --version
```

Si no tienes Ruby instalado, sigue las instrucciones en [ruby-lang.org](https://www.ruby-lang.org/en/documentation/installation/) para instalarlo.

Luego instala jekyll:

```
gem install jekyll
```

### Nuevo proyecto con jekyll

Crearemos nuestro proyecto con Jekyll usando el siguiente comando:

```
jekyll new mysite
```

### Agregaremos un poco de contenido

Jekyll es un generador de sitios web estáticos que convierte contenido escrito en **Markdown** o **HTML** en páginas web estáticas precompiladas. Para entender un poco mas como funciona agregaremos algo de contenido a nuestra pagina `index.markdown` que se encuentra en la raiz de nuestro proyecto. Abre el archivo con tu editor favorito y agrega el siguiente contenido:

```markdown
---
layout: home
---

# This is mysite

I will show you amazings things.

## Hello world

This is an aweson jekyll site created by me.

`def main; end`

A wise man says:

> > To be, or not to be
```

### Probamos nuestra página en local

Ejecutamos el servidor local con el siguiente comando :

```
bundle exec jekyll serve
```

Luego, abre tu navegador web e ingresa a `http://localhost:4000` para ver tu sitio web en desarrollo. Te podrás dar cuenta que nuestro markdown termina convertido en html. Para produndizar mas sobre como funciona jekyll y todo lo que puedes lograr te recomiendo que leas la documentación.

## Github

Si es que ya tienes cuenta en GitHub entonces puedes usar esa y si no te creas una nueva.

Para hacer esto mismo con GitLab puedes mirar [aquí](/web/jekyll/2023/11/01/jekyll-gitlab-pages.html)

### Nuevo repositorio

![](/assets/images/newrepogithub.png)

Creamos un **repositorio en blanco** para nuestro proyecto. El nombre del repositorio debe ser el nombre de nuestro usuario en github si que es queremos que nuestro sitio quede en la raiz del dominio que nos entrega github. Ejemplo: Si tu username es `luisito123` entonces tu respositorio debe llamarse `luisito123.github.io`. Y el repositorio debe ser **público**.

![](/assets/images/reponame.png)

## Agregamos una clave ssh

Para lograr subir cambios a nuestro repositorio debemos agregar nuestra clave ssh en GitHub. Para esto puede mirarte esta [guía](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent).

## Subimos nuestros cambios

### Por primera vez

Despues de crear nuestro proyecto debemos inicializar el repositorio git y subir nuestros cambios ejecutando los siguientes comandos en la raíz de nuestro proyecto y tomando en cuenta que la url **debe ser la de tu repositorio**:

```
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/{YOUR_ACCOUNT}/{YOUR_ACCOUNT}.github.io.git
git push -u origin main
```

### Despues

Para una siguiente ves solo tendras que agregar tus cambios, realizar el commit y hacer el push:

```
git add .
git commit -m "A message here!"
git push origin main
```

## Configuramos el despliegue

Para lograr que nuestra pagina se publique debemos configurar nuestro repositorio con github pages.

Seleccionamos la pestaña configuraciones de nuestro repositorio.

![](/assets/images/githubsettings.png)

Luego seleccionamos Pages.

![](/assets/images/githubpages.png)

Y finalmente en el apartado de `branch` seleccionamos nuestra rama `main` y le damos a guardar.

![](/assets/images/githubbranch.png)

Con esto deberia empezar a correr el primer pipeline que va a hacer un despliegue del codigo que esta actualmente en el respositorio. Despues de uno o dos minutos podrás ver tu sitio en la url del mismo nombre de tu respositorio, en mi caso: `m̀ysiteduck.github.io`.

# Últimos detalles

Como podemos ver, hacer tu sitio con Jekyll y desplegarlo en GitHub pages puede ser una buena opción sobre todo si es que ya sabes algo de markdown y versionamiento con git. Este mismo sitio tambien funciona de la misma forma.

Algunos tips que te pueden interesar si seguiras trabajando con Jekyll y GitHub Pages:

- [Cómo configurar tu dominio en github pages](https://docs.github.com/es/pages/configuring-a-custom-domain-for-your-github-pages-site)
- [Usar jekyll-admin para editar tus paginas mediante una UI.](https://jekyll.github.io/jekyll-admin/)
- [Instalar un tema en jekyll.](https://jekyllrb.com/docs/themes/)

