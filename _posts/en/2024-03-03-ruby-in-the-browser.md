---
layout: post
title: 'Exploring the Possibilities of WebAssembly: Ruby in the Browser'
categories:
  - Just Ruby
excerpt: >-
  WebAssembly (abbreviated as Wasm) is a binary instruction format designed to
  be interpreted by stack-based virtual machines.
image: /assets/images/ruby-wasm.avif
lang: en
time: 3 min
author: Andrés
comments: true
---
## What is WebAssembly?

WebAssembly (abbreviated as Wasm) is a binary instruction format designed to be interpreted by stack-based virtual machines (which perform operations using stacks).

This format was created with the purpose of serving as a portable compilation target for various programming languages. What does this mean? Basically, it allows code written in different languages to be compiled into a common format that can be executed both on the client and server side at a speed similar to native applications.

While its main goal is to run in web browsers, it's also possible to extend its use to other types of devices, such as mobile applications, IoT devices, or even large-scale programs. WebAssembly is primarily focused on packaging C/C++ code for use on the web, but it can also be used by interpreted languages like Ruby or Python.

## Ruby in WebAssembly

Ruby is an interpreted language, and as such, it needs an implementation/interpreter to read and transform it into machine language, in short. Therefore, for it to be possible to execute it in a web browser, it's necessary for this implementation/interpreter to be present in the web browser. And that's precisely what is attempted: to send a compiled version of the interpreter to the web browser in Wasm format that serves as a virtual machine to run Ruby code.

### Implementations

Some implementations I found:

- [ruby.wasm](https://github.com/ruby/ruby.wasm/) **Official**: CRuby ported to WebAssembly.
- [wmware](https://github.com/vmware-labs/webassembly-language-runtimes/tree/main/ruby): Provides a runtime environment for Ruby ported to wasm.
- [Ruvy](https://github.com/Shopify/ruvy): By Shopify.
- [Artichoke](https://www.artichokeruby.org/): Ruby interpreter made in Rust.

From here on, we will focus only on the official implementation.

## Running Ruby in the Browser

Taking the example from the ruby.wasm documentation, running Ruby code is as simple as this:

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

Using the interpreter compiled in Wasm and loaded via a CDN, Ruby code can be executed. This is the simplest way we have to run Ruby in the browser.

**Let's explore a bit more**

Let's write our Ruby code in a .rb file and then include it in our web page. Like this:

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

And our website:

```html
<html>
  <script src="https://cdn.jsdelivr.net/npm/@ruby/head-wasm-wasi@2.5.0/dist/browser.script.iife.js"></script>
  <script type="text/ruby" src="script.rb"></script>
  <button id="draw">Draw Omikuji</button>
  <div id="result"></div>
</html>
```

¡It works! But, what if I need to use a gem? Well, recently `ruby.wasm` [included](https://github.com/ruby/ruby.wasm/pull/358) the possibility of compiling your own Ruby Wasm module from a `Gemfile.lock` file. You can check [this](https://evilmartians.com/chronicles/first-steps-with-ruby-wasm-or-building-ruby-next-playground) post on how to use it.

This story will continue...

---

Will it be the future of web development? I don't know, but it's an interesting topic to explore and follow the development it's having over time. So far, I don't think it represents a major advantage over JavaScript or compiled languages, as having to load the entire interpreter doesn't result in lightweight files for the web. That's it for now, I hope you've learned something new.

Interesting projects with WASM:

- [https://mame.github.io/emirb/](https://mame.github.io/emirb/)
- [https://largo.github.io/ruby.wasm-quickstart/](https://largo.github.io/ruby.wasm-quickstart/)
- [https://irb-wasm.vercel.app/](https://irb-wasm.vercel.app/)

