---
layout: post
title: " 💎Ruby Tip💎 Depuración interactiva sin necesidad de gemas. "
categories: [Ruby,  IRB, Tip]
excerpt: "Descubre una forma sencilla y rápida de depurar en Ruby sin instalar gemas adicionales. Con la clase Binding y la consola IRB integrada, podrás explorar y modificar el contexto de ejecución para resolver errores de manera eficiente." 
image: /assets/images/ruby-debugging.avif
lang: es
time: 5 min
author: Andrés
comments: true
---

Existen diferentes gemas populares en el universo de Ruby con diversas funcionalidades y diferentes sintaxis para realizar una depuración interactiva. Algunas de estas gemas pueden ser [byebug](https://github.com/deivid-rodriguez/byebug) o [debug](https://github.com/ruby/debug). El problema con estas gemas es que, a veces, necesitan ser instaladas, configuradas y con comandos propios que debemos aprender. Esto toma algo de tiempo y muchas veces no hay necesidad de algo tan complejo para un error tan pequeño.

Para esos casos, tendremos la opción de usar la clase [Binding](https://docs.ruby-lang.org/en/master/Binding.html). Esta nos permite encapsular el contexto de ejecución en un punto determinado y retornarlo para usos futuros. Los objetos Binding pueden ser creados llamando al método `Kernel#binding` y la consola se levantará mediante el método de instancia público `irb`. 

Con un poco de código nos quedará más que claro:

```ruby
# door.rb
class Door
  def initialize
    @open = false
    binding.irb
    puts "Is the door open: #{@open}"
  end
end

Door.new
```

Al correr nuestro pequeño script se nos abrirá una sesión IRB con la cual podrás revisar el contexto y modificarlo:

```ruby
Documentos/scripts/ruby via 💎 v3.2.2
❯ ruby door.rb

From: door.rb @ line 4 :

    1: class Door
    2:   def initialize
    3:     @open = false
 => 4:     binding.irb
    5:     puts "Is the door open: #{@open}"
    6:   end
    7: end
    8:
    9: Door.new

irb(#<Door:0x00007fa9a0f367a8>):001> @open
=> false
irb(#<Door:0x00007fa9a0f367a8>):002> @open=true
=> true
irb(#<Door:0x00007fa9a0f367a8>):003> exit
Is the door open: true

```

Y eso es todo, puedes usarlo para depurar tus scripts, web scrappers o lo que sea que estés construyendo.

Para saber más sobre el uso de IRB puedes visitar [esta documentación](https://docs.ruby-lang.org/en/master/IRB.html#module-IRB-label-Usage)

Si te ha gustado puedes pasar a saludar en los comentarios, estare atento.

Happy coding!
