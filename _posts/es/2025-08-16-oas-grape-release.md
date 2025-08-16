---
layout: post
title: "OasGrape: Una alternativa para generar la documentación de tu API"
category:
  - Just Ruby
excerpt: "Grape también merece los beneficios de OasCore: OAS 3.1 y una interfaz de usuario integrada."
image: https://a-chacon.com/oas_rails/assets/rails_theme.png
author: Andrés
comments: true
---

Y nuevamente con Open API Specification, pero esta vez para Grape.

Grape es un framework potente y específico para la creación de APIs en Ruby. Hace un par de años lo utilizamos sobre Rails para crear la API de una aplicación web, y en ese momento nos dimos cuenta de que la única alternativa para generar una documentación interactiva era la gema `grape-swagger`, que hasta el momento solo genera OAS 2.0. Esto es un problema para muchos, ya que además no ofrece una interfaz de usuario (UI), por lo que también tienes que encargarte de eso. Demasiada configuración para algo que debería ser simple y potente.

Con el paso de los años y con [OasCore](https://github.com/a-chacon/oas_core) ya funcionando para [Rails](https://github.com/a-chacon/oas_rails), [Hanami](https://github.com/a-chacon/oas_hanami) y [Rage](https://github.com/a-chacon/oas_rage), ¿por qué no hacerlo funcionar para Grape? Así que me puse a buscar la forma de integrarlo en Grape y llegué a una solución técnicamente un poco diferente a las anteriores, pero funcional.

### Obteniendo los endpoints disponibles

Lo primero era obtener un listado de los endpoints disponibles en la aplicación. Para esto, me fijé en el código de [grape-rails-routes](https://github.com/pmq20/grape-rails-routes), que aunque es algo antiguo, aún sirve. Llegué a un código como este:

```ruby
def extract_grape_routes
  grape_klasses = ObjectSpace.each_object(Class).select { |klass| klass < Grape::API }
  routes = grape_klasses.flat_map(&:routes).uniq { |r| r.path + r.request_method.to_s }

  routes = routes.map { |route| OasRouteBuilder.build_from_grape_route(route) }
  filter_routes(routes)
end
```

Con esto, ya tenía todas las rutas de las clases que heredan de Grape y que contienen todos los endpoints. Sin embargo, había otro problema: los endpoints no están definidos como métodos de instancia, sino como `Procs`, por lo que acceder a los comentarios para parsearlos como documentación iba a ser casi imposible (aunque lo intenté en un principio).

### Solución: Utilizar `desc` y `detail` de Grape

Para esto, no encontré una solución mejor y más simple que utilizar lo que ya ofrece Grape: el bloque `desc` y la etiqueta `detail`. Dentro de `detail`, incluí todas las etiquetas de OasCore para generar la documentación. Así, un endpoint documentado se vería de la siguiente forma:

```ruby
desc "Returns a list of Users." do
  detail <<~OAS_GRAPE
    # @summary Returns a list of Users.
    # @parameter offset(query) [Integer] Used for pagination of response data. default: (0) minimum: (0)
    # @parameter limit(query) [Integer] Maximum number of items per page. default: (25) minimum: (1) maximum: (100)
    # @parameter status(query) [Array<String>] Filter by status. enum: (active,inactive,deleted)
    # @parameter X-front(header) [String] Header for identifying the front. minLength: (1) maxLength: (50)
    # @response Success response(200) [Array<Hash{ id: Integer}>]
    # @response_example Success(200)
    #   [ JSON
    #     [
    #       { "id": 1, "name": "John", "email": "john@example.com" },
    #       { "id": 2, "name": "Jane", "email": "jane@example.com" }
    #     ]
    #   ]
  OAS_GRAPE
end
get do
  { users: @@users }
end
```

La verdad es que la solución no me convenció del todo, pero fue la implementación de OasCore más simple que logré encontrar para Grape, y así ofrecer una opción para generar un OAS 3.1 con UI incluida para las APIs creadas con Grape.

### Documentación y repositorio

Para ver la documentación completa sobre cómo instalarla y usarla, puedes visitar:  
🔗 [Documentación de OasGrape](https://a-chacon.com/oas_core/oas_grape/index.html)  
🔗 [Repositorio en GitHub](https://github.com/a-chacon/oas_grape)
