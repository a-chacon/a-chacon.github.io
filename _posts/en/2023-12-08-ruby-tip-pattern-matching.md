---
layout: post
title: "\U0001F48ERuby Tip\U0001F48E Did you know that Ruby supports Pattern Matching?"
categories:
  - Just Ruby
excerpt: >-
  Pattern Matching in Ruby allows for concise data destructuring, making it easy
  to assign variables with clear syntax. From filtering values in arrays to
  customizing destructuring in classes, this feature simplifies data
  manipulation in an elegant way.
image: /assets/images/pattern_matching.avif
lang: en
time: 5 min
author: Andrés
comments: true
---
Pattern matching is a feature that was introduced in Ruby 2.7. From Ruby 3.0 onwards, it is no longer an experimental feature, and we can start using it without an annoying warning:

```
(irb):3: warning: Pattern matching is experimental, and the behavior may change in future versions of Ruby!
```

---

## But what is Pattern Matching?

Pattern matching is a feature that allows you to compare and understand the structure of organized information, such as data or variables. This is done by checking how the information is organized and assigning the matching parts to local variables for later use.

**Pattern Matching** is supported through the `case / in` syntax. Important not to confuse with `case / when` and not to mix. If there is no match with any expression and there is no `else` defined, then a `NoMatchingPatternError` exception is raised.

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

Patterns can be:

- **Value**: Any Ruby object (compared with the === operator, as in 'when').

- **Array**: Array pattern: `[<subpattern>, <subpattern>, <subpattern>, <subpattern>, ...]`.

- **Find**: Search pattern: `[*variable, <subpattern>, <subpattern>, <subpattern>, <subpattern>, ..., *variable]`.

- **Hash**: Hash pattern: `{key: <subpattern>, key: <subpattern>, ...}`.

- **Alternative**: Pattern combination with `|` (vertical bar).

- **Variable capture**: `<pattern> => variable` or `variable`.

## Pattern Matching in practice

Here we have a function that processes data:

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

In this example, we show how to perform a search based on a Hash pattern. We highlight one of the powerful features of Pattern Matching: **variable binding**. We manage to assign a value from the unstructured hash to a variable, which allows us to work with that value later in our code.

### Deconstruct and Deconstruct_keys

There are two special methods in pattern matching: `deconstruct`, called when evaluating on an Array, and `deconstruct_keys`, called when evaluating on a Hash. Let's see an example:

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

In the **Coordinate** class, we define a `deconstruct` and `deconstruct_key` method that return an Array and a Hash respectively.

So, when an instance of the **Coordinate** class is evaluated on an array, what happens is that the `deconstruct` method is called on the instance to be evaluated:

```ruby
c = Coordinates.new(32,50)

case c
in [a,b]
  p a #=> 32
  p b #=> 50
end
```

And when the same instance is evaluated on a Hash, then the `deconstruct_key` method is called:

```ruby
case c
in {x:, y:}
  p x #=> 32
  p y #=> 50
end
```

---

If you are interested in the topic, I invite you to look for more information in the [documentation](https://docs.ruby-lang.org/en/master/syntax/pattern_matching_rdoc.html). There are other interesting elements of pattern matching, such as the use of the pin operator (^) and _Guard clauses_ (`if` and `unless`).

---

So much for the short introduction to the topic. If you didn't know this syntax, I hope you leave with a new tool to further develop your Ruby projects.

Happy Coding!

