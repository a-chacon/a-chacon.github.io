---
layout: post
title: "ActiveStorage: Evitar el problema de las consultas N+1"
categories: [Rails, ActiveStorage]
excerpt: "El problema N+1 es frecuente en la programación orientada a bases de datos y se da cuando se requiere una consulta adicional por cada relación entre objetos, generando un exceso de consultas. Este problema también afecta a Active Storage, que crea registros en la base de datos a través de relaciones polimórficas." 
image: /assets/images/n+1.avif
lang: es
time: 3 min
author: Andrés
comments: true
---

Supongamos que tenemos un modelo llamado Solution, donde cada solución debe tener un ícono adjunto en forma de imagen. Algo como esto:

```ruby
class Solution < ApplicationRecord
    has_one_attached :icon
end
```

La definición del model es simple y no deberíamos tener problemas al consultarlo. Ya sea con `Solution.first`, `Solution.limit(10)` u otra consulta relacionada con nuestro modelo, normalmente debería generar solo una petición a la base de datos. No obstante, la complicación se presenta al intentar generar una URL para cada uno de los íconos asociados a nuestro modelo. En este punto, ActiveStorage requiere consultar las tablas adicionales `active_storage_attachments` y `active_storage_blobs`. Si previamente no se han cargado estos datos, es cuando se produce el problema N+1.

Para mostrar el problema usaremos el siguiente codigo:

```ruby
icon_urls = Solution.all.map{|s| s.icon.url }
```

---

# Soluciones

La solución siempre será hacer una carga previa de los datos. Pero, ¿Cómo?

## Includes

La respuesta que nos ofrece ActiveRecord para este problema común de rendimiento es el método [includes](https://apidock.com/rails/ActiveRecord/QueryMethods/includes):

```ruby
icon_urls = Solution.all.includes(icon_attachment: :blob).map{|s| s.icon.url }
```

Y ya está, `includes` define si  cargar los datos mediante [preload](https://apidock.com/rails/ActiveRecord/Associations/Preloader/preload) (consultas por separado) o [eager_load](https://api.rubyonrails.org/classes/ActiveRecord/QueryMethods.html#method-i-eager_load) (todo en una única consulta).


## ActiveStorage scopes

Ahora bien, ActiveStorage está al tanto de este problema y es por eso que también ofrecen una solución por su lado: Un scope para hacer aún más fácil tu vida con Rails. 

Cada vez que usamos `has_one_attached` en nuestro modelo se nos agrega [este scope](https://github.com/rails/rails/blob/23938052acd773fa24068debe56cd892cbf8d868/activestorage/lib/active_storage/attached/model.rb#L117C22-L117C22) con el nombre de `with_attached_#{attachment_name}`. Para que se entienda mejor, en nuestro caso quedaría de la siguiente forma:

```ruby
icon_urls = Solution.all.with_attached_icon.map{|s| s.icon.url }
```

Esto realiza la misma acción que includes, pero nuestra consulta queda más simple de leer.

---

**Estos mismos métodos también están disponibles para cuando se usan variantes y/o `has_many_attachments`.** 

*Disfruta programando*
