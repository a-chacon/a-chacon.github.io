---
layout: post
title: ' ActiveRecord::Enum persistido en un campo string. ¿Es una mala idea?'
category:
  - On Rails
excerpt: >-
  Campos string vs int en ActiveRecord::Enum: ¿Cuál es la mejor opción para tu
  base de datos Rails?
image: /assets/images/enum.webp
lang: es
time: 5 min
author: Andrés
comments: true
redirect_from:
  - /ruby/rails/benchmark/2024/06/30/rails-enum-persisted-on-string-field.html
---
Hubo un momento en mis aplicaciones en el que dejé de persistir los campos que iba a definir como enum en campos `int` y comencé a hacerlo en `strings`. Tomé esta decisión porque, en varias ocasiones, me pidieron un volcado de la base de datos para su análisis, y cada vez que se encontraban con un campo `status` (o cualquier otro usando `enum`) con valores como 0, 1 o 2 me terminaban preguntando sobre su significado. Por lo que, en vez de usar valores numéricos que carecen de sentido y contexto, los cambié directamente por un `string` que en sí mismo tiene sentido y da contexto.

Pero hace unos días volví a revisar la [documentación](https://api.rubyonrails.org/classes/ActiveRecord/Enum.html) y encontré una frase que me hizo cuestionarme esto:

> Finally it’s also possible to use a string column to persist the enumerated value. **Note that this will likely lead to slower database queries**

¡Usarlo terminaría en consultas más lentas a la base de datos!

Así que, como buen programador, preocupado de la eficiencia y el rendimiento de mis aplicaciones 🤓, me cuestioné lo que estaba haciendo y, antes de realizar algún cambio, quise comprobar esto. Creé una [aplicación](https://gitlab.com/a-chacon/api-benchmark) simple en Rails conectada a MySQL con dos modelos, uno con un enum persistido en `int` y otro persistido como `varchar` con 100,000 registros cada uno. Cerré todas las aplicaciones que podían molestar y ejecuté un benchmark:

```bash
                                       user     system      total        real
String Enum Count:                 0.477732   0.052428   0.530160 ( 21.794783)
Integer Enum Count:                0.374897   0.030260   0.405157 ( 21.639400)
String Enum Paginated Index:       0.351621   0.017249   0.368870 (  0.639043)
Integer Enum Paginated Index:      0.317277   0.022936   0.340213 (  0.524883)
String Enum Single Record Fetch:   0.294010   0.031218   0.325228 (  0.489015)
Integer Enum Single Record Fetch:  0.297743   0.015502   0.313245 (  0.497845)
```

Todos los resultados fueron muy parecidos, las variaciones de tiempo en las 1,000 ejecuciones de consultas simples fueron pequeñas. Si entiendo bien, podríamos tomar el caso de las consultas `count`. Tuvieron una diferencia de 0.155383s, o sea, 0.1ms de ventaja para `int` por consulta aproximadamente. Pero para un `select` con `limit(1)` ganó el `string`. Entonces me pregunto, ¿realmente un `enum` persistido como `string` terminará en consultas más lentas?

<iframe src="https://giphy.com/embed/Dh5q0sShxgp13DwrvG" width="480" height="298" style="" frameBorder="0" class="giphy-embed" allowFullScreen></iframe><p><a href="https://giphy.com/gifs/scaler-official-dogs-computer-typing-Dh5q0sShxgp13DwrvG">via GIPHY</a></p>

Bueno, sea más lento o no, creo que en el común de las aplicaciones terminará con diferencias de milisegundos que no serán tan importantes. Por lo que mi razón inicial de comenzar a usar `enums` persistidos como `strings` se mantiene como lo más importante. Y no soy el único que tiene una razón para hacerlo, estas dos preguntas en Stack Overflow también buscaban algo similar hace varios años ya:

- <https://stackoverflow.com/questions/24105813/possibility-of-mapping-enum-values-to-string-type-instead-of-integer>
- <https://stackoverflow.com/questions/32938729/how-to-store-enum-as-string-to-database-in-rails>

¿Qué opinas tú? ¿Sabías que un `enum` puede persistirse como `string`?

