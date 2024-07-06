---
layout: post
title: 'Explorando las Posibilidades de WebAssembly: Ruby en el Navegador'
category:
  - Just Ruby
excerpt: >-
  WebAssembly (abreviado como Wasm) es un formato de instrucciones binarias
  diseñado para ser interpretado por máquinas virtuales basadas en pilas.
image: /assets/images/ruby-wasm.avif
lang: es
time: 5 min
author: Andrés
comments: true
---
## ¿Qué es WebAssembly?

WebAssembly (abreviado como Wasm) es un formato de instrucciones binarias diseñado para ser interpretado por máquinas virtuales basadas en pilas (que realizan operaciones utilizando pilas).

Este formato se creó con el propósito de servir como un objetivo de compilación portátil para diversos lenguajes de programación. ¿Qué significa esto? Básicamente, permite que el código escrito en diferentes lenguajes se compile en un formato común que puede ejecutarse tanto en el lado del cliente como en el servidor a una velocidad similar a las aplicaciones nativas.

Si bien su principal objetivo es ejecutarse en navegadores web, también es posible extender su uso a otros tipos de dispositivos, como aplicaciones móviles, dispositivos IoT o incluso programas de gran escala. WebAssembly está principalmente enfocado en empaquetar código C/C++ para su uso en la web, pero también puede ser utilizado por lenguajes interpretados como Ruby o Python.

## Ruby en WebAssembly

Ruby es un lenguaje interpretado, y como tal, necesita una implementación/interprete que lo lea y lo transforme a lenguaje de máquinas, en pocas palabras. Por lo tanto, para que sea posible su ejecución en un navegador web, es necesario que esta implementación/interprete esté presente en el navegador web. Y eso es precisamente lo que se intenta hacer: enviar una versión compilada del intérprete al navegador web en formato Wasm que sirva de máquina virtual para correr el código escrito en Ruby.

### Implementaciones

Algunas implementaciones que encontré:

- [ruby.wasm](https://github.com/ruby/ruby.wasm/) **Oficial**: CRuby portado a WebAssembly.
- [wmware](https://github.com/vmware-labs/webassembly-language-runtimes/tree/main/ruby): Proporciona un entorno de ejecución para Ruby portado a wasm.
- [Ruvy](https://github.com/Shopify/ruvy): Por Shopify.
- [Artichoke](https://www.artichokeruby.org/): Intérprete de Ruby hecho en Rust.

De aquí en adelante nos enfocaremos solo en la implementación oficial.

## Ejecutando Ruby en el navegador

Tomando el ejemplo que aparece en la documentación de ruby.wasm, ejecutar código Ruby es tan simple como esto:

```html
<html>
  <script src="https://cdn.jsdelivr.net/npm/@ruby/3.3-wasm-wasi@2.5.0/dist/browser.script.iife.js"></script>
  <script type="text/ruby">
    require "js"

    puts RUBY_VERSION # => Hello, world! (printed to the browser console)
    JS.global[:document].write "Hello, world!"
  </script>
</html>
```

Haciendo uso del intérprete compilado en Wasm y cargado a través de un CDN se puede ejecutar código Ruby. Esta es la forma más simple que tenemos para correr Ruby en el navegador.

**Exploremos un poco más**

Escribamos nuestro código Ruby en un archivo .rb y luego incluyámoslo en nuestra página web. De esta manera:

```ruby
# script.rb
require "js"

document = JS.global[:document]
button = document.getElementById "draw"
result = document.getElementById "result"
button.addEventListener "click" do |e|
  p e
  luckiness = ["Lucky", "Unlucky"].sample
  result[:innerText] = luckiness
end
```

Y nuestra página web:

```html
<html>
  <script src="https://cdn.jsdelivr.net/npm/@ruby/head-wasm-wasi@2.5.0/dist/browser.script.iife.js"></script>
  <script type="text/ruby" src="script.rb"></script>
  <button id="draw">Draw Omikuji</button>
  <div id="result"></div>
</html>
```

¡Funciona! Pero, ¿y si necesito usar una gema? Bueno, recientemente `ruby.wasm` [incluyó](https://github.com/ruby/ruby.wasm/pull/358) la posibilidad de compilar tu propio módulo Ruby Wasm a partir de un archivo `Gemfile.lock`. Puedes revisar [esta](https://evilmartians.com/chronicles/first-steps-with-ruby-wasm-or-building-ruby-next-playground) publicación sobre cómo utilizarlo.

Esta historia continuará...

---

¿Será el futuro del desarrollo web? No lo sé, pero es un tema interesante de explorar y seguir el desarrollo que va teniendo en el tiempo. Hasta el momento, no creo que represente una gran ventaja sobre JavaScript o lenguajes compilados, puesto que tener que cargar todo el intérprete no resulta en archivos livianos para la web. Hasta aquí por ahora, espero que hayas aprendido algo nuevo.

Proyectos interesantes con WASM:

- [https://mame.github.io/emirb/](https://mame.github.io/emirb/)
- [https://largo.github.io/ruby.wasm-quickstart/](https://largo.github.io/ruby.wasm-quickstart/)
- [https://irb-wasm.vercel.app/](https://irb-wasm.vercel.app/)

