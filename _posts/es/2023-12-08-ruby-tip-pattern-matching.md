---
layout: post
title: " \U0001F48ERuby Tip\U0001F48E ¿Sabías que Ruby Soporta Coincidencia de Patrones?"
category:
  - Just Ruby
excerpt: >-
  La Coincidencia de Patrones en Ruby permite desestructurar datos de manera
  concisa, facilitando la asignación de variables con sintaxis clara y de forma
  elegante.
image: /assets/images/pattern_matching.avif
lang: es
time: 5 min
author: Andrés
comments: true
redirect_from:
  - /ruby/tip/2023/12/08/ruby-tip-pattern-matching.html
---
Coincidencia de patrones es una funcionalidad que fue introducida en Ruby 2.7. Desde Ruby 3.0 en adelante, ya no es una funcionalidad experimental, y podemos empezar a usarla sin un molesto warning:

```
(irb):3: warning: Pattern matching is experimental, and the behavior may change in future versions of Ruby!
```

---

## Pero, ¿Qué es Pattern Matching?

La coincidencia de patrones es una característica que permite comparar y entender la estructura de información organizada, como datos o variables. Esto se hace verificando cómo está organizada la información y asignando las partes coincidentes a variables locales para su uso posterior.

**Pattern Matching** es soportado mediante la sintaxis `case / in`. Importante no confundir con `case / when` ni tampoco mezclar. Si no existe match con ninguna expresión y tampoco hay un `else` definido, entonces se levanta una excepción del tipo `NoMatchingPatternError`.

```ruby
case <expression>
in <pattern1>
  # ...
in <pattern2>
  # ...
else
  # ...
end
```

Los patrones pueden ser:

- **Valor**: Cualquier objeto de Ruby (se compara con el operador ===, como en 'when').

- **Array**: Patrón de arreglo: `[<subpatrón>, <subpatrón>, <subpatrón>, ...]`.

- **Find**: Patrón de búsqueda: `[*variable, <subpatrón>, <subpatrón>, <subpatrón>, ..., *variable]`.

- **Hash**: Patrón de hash: `{clave: <subpatrón>, clave: <subpatrón>, ...}`.

- **Alternativa**: Combinación de patrones con `|` (barra vertical).

- **Captura de variable**: `<patrón> => variable` o `variable`.

## Pattern Matching en la práctica

Aquí tenemos una función que procesa datos:

```ruby
# Define a method that uses pattern matching with case/in
def process_data(data)
  case data
  in { type: "number", value: Integer => num }
    puts "Received a number: #{num}"
  in { type: "string", value: String => str }
    puts "Received a string: #{str}"
  in { type: "array", value: Array => arr }
    puts "Received an array: #{arr}"
  in { type: "hash", value: Hash => hash }
    puts "Received a hash: #{hash}"
  else
    puts "Received something else."
  end
end

# Test the method with different data structures
process_data({ type: "number", value: 42 })               # Output: Received a number: 42
process_data({ type: "string", value: "Hello, Ruby!" })   # Output: Received a string: Hello, Ruby!
process_data({ type: "array", value: [1, 2, 3] })         # Output: Received an array: [1, 2, 3]
process_data({ type: "hash", value: { key: "value" } })   # Output: Received a hash: {:key=>"value"}
process_data({ type: "unknown", value: "unknown data" })  # Output: Received something else.
```

En este ejemplo, mostramos cómo realizar una búsqueda basada en un patrón de Hash. Destacamos una de las potentes funciones de Pattern Matching: la **asignación de variables**. Logramos asignar un valor del hash desestructurado a una variable, lo que nos permite trabajar con ese valor de manera posterior en nuestro código.

### Deconstruct y Deconstruct_keys

Existen dos métodos especiales en coincidencia de patrones: `deconstruct`, llamado cuando se trata de evaluar sobre un Array, y `deconstruct_keys`, llamado cuando se trata de evaluar sobre un Hash. Veamos un ejemplo:

```ruby
class Coordinate
  attr_accessor :x, :y

  def initialize(x, y)
    @x = x
    @y = y
  end

  def deconstruct
    [@x, @y]
  end

  def deconstruct_key
    {x: @x, y: @y}
  end
end
```

En la clase **Coordinate**, se define un método `deconstruct` y `deconstruct_key` que retornan un Array y un Hash respectivamente.

Entonces, cuando una instancia de la clase **Coordinate** es evaluada sobre un array, lo que sucede es que el método `deconstruct` es llamado en la instancia a evaluar:

```ruby
c = Coordinates.new(32,50)

case c
in [a,b]
  p a #=> 32
  p b #=> 50
end
```

Y cuando la misma instancia es evaluada sobre un Hash, entonces el método `deconstruct_key` es llamado:

```ruby
case c
in {x:, y:}
  p x #=> 32
  p y #=> 50
end
```

---

Si te ha interesado el tema, te invito a buscar más información en la [documentación](https://docs.ruby-lang.org/en/master/syntax/pattern_matching_rdoc.html). Existen otros elementos interesantes de la coincidencia de patrones, como el uso del operador pin (^) y _Guard clauses_ (`if` y `unless`).

---

Hasta aquí con la pequeña introducción al tema. Si no conocías esta sintaxis, espero que te vayas con una nueva herramienta para seguir desarrollando tus proyectos con Ruby.

Happy Coding!

