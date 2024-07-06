---
layout: post
title: 'Web Scraping con Ruby: Una Guía rápida'
categories:
  - Just Ruby
excerpt: >-
  Descubre cómo realizar web scraping en Ruby con Nokogiri, la destacada
  biblioteca de análisis de documentos HTML y XML. Aprende las técnicas clave en
  este artículo sobre web scraping en Ruby.
image: /assets/images/nokogiri.png
lang: es
time: 5 min
author: Andrés
comments: true
---
Nokogiri es una de las gemas más famosas dentro del ecosistema de Ruby. Incluso tiene más descargas registradas en [rubygems.org](https://rubygems.org) que Rails (693.378.140 hasta el momento de escribir esto. Rails solo tiene 460.230.689). Sirve para trabajar con documentos tanto XML como HTML, provee una API simple para leer, escribir y consultar sobre documentos.

Veremos como utilizarla para realizar un simple web scraping. Si conocemos los ids, las clases o los tipos de elementos HTML donde están guardados los datos que necesitamos, entonces podremos extraerlos. El primer paso será consultar la página web que contiene los datos que necesitamos, luego buscar nuestra información y por último escribirlos en un archivo CSV.

## Obtener la pagina web

![](/assets/images/scraping_projects.png)

Vamos a suponer que haremos un web scraping de mi propia página web con el fin de obtener un listado de proyectos. Para esto, la forma más sencilla de consultar nuestra página será de la siguiente forma:

```ruby
require 'nokogiri'
require 'open-uri'
require 'csv'

html_doc = Nokogiri::HTML(URI.open("https://a-chacon.com/projects"))
```

Con esto ya tendremos nuestro documento HTML listo para consultar a través del objeto `html_doc`.

## Realizando consultas con Nokogiri

Para consultar el documento utilizaremos el selector `css` que siempre retorna un [NodeSet](https://nokogiri.org/rdoc/Nokogiri/XML/NodeSet), algo muy parecido a un Array. Este NodeSet contiene una lista de objetos [Node](https://nokogiri.org/rdoc/Nokogiri/XML/NodeSet). Los métodos de cada una de estas clases los iremos viendo más adelante.

### Definir que queremos extraer

Para saber lo que estamos buscando haremos uso de una estructura:

```ruby
Project = Struct.new(:title, :description, :image, :tags)

projects = []
```

Ahora que sabemos lo que buscamos, vamos por ello.

### Obtener todas las cards mediante atributo HTML y clase CSS

![](/assets/images/scraping_div.png)

Para obtener las cards lo haremos mediante la selección de atributo y clase. Esto se vería de la siguiente forma:

```ruby
cards = html_doc.css("div.shadow-indigo-200")
```

Esto nos retornará un NodeSet de todas las coincidencias que se den para un `div` que contenga la clase css `shadow-indigo-200`.

En este caso, el NodeSet debería contener elementos HTML con la siguiente estructura:

```html
...
<div
  class="mb-10 overflow-hidden rounded-lg bg-white shadow-lg shadow-indigo-200"
>
  <img
    src="assets/images/comocambio.jpg"
    alt="image"
    class="object-cover w-full max-h-48"
  />
  <div class="px-6 pt-4 flex justify-center">
    <span class="inline-block px-2 py-1 text-sm mr-2 mb-2">#Rails</span>
    <span class="inline-block px-2 py-1 text-sm mr-2 mb-2">#AWS</span>
  </div>
  <div class="text-center mx-8 mb-8">
    <h3
      class="text-black font-medium hover:text-primary mb-4 block text-xl sm:text-[22px] md:text-xl lg:text-[22px] xl:text-xl 2xl:text-[22px]"
    >
      ComoCambio
    </h3>
    <p class="text-body-color mb-7 text-base md:text-lg leading-relaxed">
      ComoCambio: Impulsando una cultura saludable como parte del programa de
      Cencosud. Proyecto en desarrollo desde hace dos años, donde contribuyo
      como desarrollador back-end y DevOps freelance para Zeeers.
    </p>
    <div class="flex justify-center">
      <a
        class="pr-3 transition hover:scale-110 duration-300"
        href="https://comocambio.com"
        target="_blank"
      >
        <img src="/assets/images/link.png" alt class="h-6" />
      </a>
    </div>
  </div>
</div>
...
```

### Iteramos sobre las cards para extraer lo que necesitamos

Ahora que tenemos lista de nodos podemos iterarlo de la misma forma que un Array.

```ruby
cards.each do |c|
    title = c.at_css("h3").content
    description = c.at_css("p").content
    image = c.at_css("img.object-cover")["src"]
    tags = c.css("span").map{|t| t.content}

    projects << Project.new(title, description, image, tags)
end
```

`at_css` se usa para obtener un único resultado y no un NodeSet y sí, un NodeSet también se puede iterar con `map`. Cuando obtenemos un nodo podemos extraer los valores de sus atributos de la misma forma que si accediéramos a un Hash.

### Escribir los resultados

Y por último escribes tus resultados donde tú quieras y de la forma que tú quieras. Aquí te mostraré como sería si quieres escribirlos en un CSV.

```ruby
CSV.open("myfile.csv", "w") do |csv|
    projects.each {|p| csv << p.to_a}
end
```

Esto es un ejemplo bien simple y claro que se puede mejorar.

## Formas de buscar

Ahora que sabemos como es el proceso en general mostraré un par de ejemplos mas sobre como podemos buscar en el documento.

1. Para buscar por elemento, clase y nuevamente un elemento:

```ruby
titles = html_doc.css("div.shadow-indigo-200 h3").map(&:text).map(&:strip)
# ["CalendarioChileno", "ComoCambio", "Paso App", ...]
```

2. Para buscar por valor de un atributo de un elemento:

```ruby
images = html_doc.css('img[alt="image"]').map{|i| i['src'] }
# ["assets/images/calendariochileno.png", ... ]
```

## Últimas reflexiones

Nokogiri es una excelente herramienta para obtener información de páginas webs, su uso es fácil y cuando se entiende el uso de los selectores no toma mucho tiempo realizar un simple web scraping.

Puede que en el camino encuentres problemas como bloqueos de tu ip por muchas consultas seguidas o que tengas que resolver algún captcha. Pero no eres el primero en enfrentarte a esos problemas y ya hay gente que ha trabajado en soluciones: puedes utilizar servicios de terceros como [Apify](https://apify.com/) o correr proyectos como [CloudflareSolverRe](https://github.com/FlareSolverr/FlareSolverr) que resolverán las captchas de cloudflare por ti.

