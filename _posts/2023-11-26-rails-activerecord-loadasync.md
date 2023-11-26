---
layout: post
title: "Carga Asíncrona en Active Record: Potenciando el Rendimiento de tu Aplicación Rails 🚀"
categories: [Rails, Active Record]
excerpt: "Optimiza el rendimiento en Rails 7.1 con carga asíncrona de datos utilizando Active Record y el método load_async. Reduce los tiempos de respuesta al ejecutar consultas en paralelo, mejorando la eficiencia de tu aplicación." 
image: /assets/images/load_async.webp
lang: es
time: 5 min
author: Andrés
comments: true
---

El rendimiento de tu aplicación web es crucial, ya que afecta aspectos que van desde el SEO hasta los costos que tendrás en tu servicio de alojamiento al final del mes y la huella de carbono que tu sitio web está dejando en el planeta🌍. Por lo tanto, es fundamental conocer cualquier herramienta que pueda ayudarte a mejorarlo, estar al tanto de su existencia y aplicarla cuando sea necesario.

Este tema es tan extenso que se podría escribir un libro respecto a la optimización del rendimiento de tu aplicación y sus efectos: tiempos de carga y percepción de performance del usuario, uso de caché, consultas n+1, implementación de CDN, escalabilidad y mucho más. Pero en esta ocasión, quiero ofrecer una breve introducción a lo que es la carga de datos de forma asíncrona en Active Record con el método [load_async](https://api.rubyonrails.org/classes/ActiveRecord/Relation.html#method-i-load_async) y sus amigos (introducidos en Rails 7.1).


## Problema

Supongamos que tenemos el siguiente seudo controlador:

```ruby
class ApplicationController < ActionController::Base
  def main
    @films = Film.slow # 2 seconds
    @reviews = Review.slow # 4 seconds

    sleep(2) # It could be another process like call an external API
  end
end

```

El scope slow será algo como: `scope :slow, -> { select('*, sleep(1)') }`, por lo que va a variar dependiendo de la cantidad de registros que tengamos en la base de datos. La ejecución en secuencia del método main tomaría un poco más de 8 segundos, como podemos ver en los logs:

```bash
Completed 200 OK in 8101ms
```

## Optimización del tiempo de respuesta con SQL asíncrono

Rails 7 introdujo el nuevo método [load_async](https://github.com/rails/rails/blob/6b93fff8af32ef5e91f4ec3cfffb081d0553faf0/activerecord/lib/active_record/relation.rb#L696) en Active Record para que la consulta se realice desde un grupo de hilos en segundo plano. Esto permite que tus consultas se ejecuten de forma paralela, optimizando el tiempo de respuesta de tu controlador.

El metodo `load_async` requiere de una configuracion previa que puedes encontrar [aqui](https://guides.rubyonrails.org/configuring.html#config-active-record-async-query-executor). Luego de eso pasaremos a la implementación y veremos el resultado:

```ruby
class ApplicationController < ActionController::Base
  def main
    @films = Film.slow.load_async # 2 seconds
    @reviews = Review.slow.load_async # 4 seconds

    sleep(2) # It could be another process like call an external API
  end
end

```

```bash
Completed 200 OK in 4052ms
```

### ¿Qué pasó?

Logramos reducir el tiempo de respuesta casi a la mitad porque nuestras consultas se ejecutaron en paralelo. ¿Por qué 4 segundos? Porque `Review.slow` es la consulta que toma más tiempo: 4 segundos; durante ese momento, el hilo principal termina de ejecutar la función `sleep(2)`, llama al resultado de `Film.slow`, que probablemente ya está listo debido a que toma dos segundos. Al llamar al resultado de `Review.slow`, se encuentra con que aún no ha terminado (le faltan 2 segundos), por lo que la pasa al hilo principal y la termina de ejecutar (2 segundos en sleep y luego 2 segundos más para terminar `Review.slow` llegamos a nuestros 4 segundos).

## Rails 7.1

Ya que `load_async` es específicamente un método de la clase `ActiveRecord::Relation`, no nos funcionaría para agregaciones o respuestas de un solo registro. Para eso, en Rails 7.1 se introducen una serie de métodos que nos van a ayudar a realizar este tipo de consultas en segundo plano:

- [`async_count`](https://api.rubyonrails.org/classes/ActiveRecord/Calculations.html#method-i-async_count)
- [`async_sum`](https://api.rubyonrails.org/classes/ActiveRecord/Calculations.html#method-i-async_sum)
- [`async_minimum`](https://api.rubyonrails.org/classes/ActiveRecord/Calculations.html#method-i-async_minimum)
- [`async_maximum`](https://api.rubyonrails.org/classes/ActiveRecord/Calculations.html#method-i-async_maximum)
- [`async_average`](https://api.rubyonrails.org/classes/ActiveRecord/Calculations.html#method-i-async_average)
- [`async_pluck`](https://api.rubyonrails.org/classes/ActiveRecord/Calculations.html#method-i-async_pluck)
- [`async_pick`](https://api.rubyonrails.org/classes/ActiveRecord/Calculations.html#method-i-async_pick)
- [`async_ids`](https://api.rubyonrails.org/classes/ActiveRecord/Calculations.html#method-i-async_ids)
- [`async_find_by_sql`](https://api.rubyonrails.org/v7.1.0/classes/ActiveRecord/Querying.html#method-i-async_find_by_sql)
- [`async_count_by_sql`](https://api.rubyonrails.org/v7.1.0/classes/ActiveRecord/Querying.html#method-i-async_count_by_sql)

A diferencia de `load_async`, estos métodos retornan un objeto del tipo [ActiveRecord::Promise](https://api.rubyonrails.org/classes/ActiveRecord/Promise.html) y para obtener el resultado deberemos ejecutar el método `value`:

```ruby
class ApplicationController < ActionController::Base
  def main
    @films_count = Film.slow.async_count 
    @reviews = Review.slow.load_async 

    sleep(2) # Podría ser otro proceso, como llamar a una API externa
  end
end
```

Y luego, en la vista, para acceder a los datos:

```erb
<span><%= @films_count.value %><span>
```

### Pensamientos finales

La carga asíncrona de datos puede ser tu gran aliado al momento de querer mejorar el rendimiento de tu aplicación. Lograrás mejorar los tiempos de respuesta con simples cambios en tu código. Creo que hasta aquí es una buena introducción al tema, pero no deberías quedarte solo con estos conocimientos. Si te interesó el tema, te recomiendo que leas el siguiente blog post:

- [The In-depth Guide to ActiveRecord load_async in Rails 7](https://pawelurbanek.com/rails-load-async)

Ahí podrás entender mejor el funcionamiento de la carga asíncrona, casos de uso y por qué no abusar de esto.

Hasta aquí por hoy, espero que hayas aprendido algo nuevo. Cualquier detalle, aporte o comentario, no dudes en escribirme.
