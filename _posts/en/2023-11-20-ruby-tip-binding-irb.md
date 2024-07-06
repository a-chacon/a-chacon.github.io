---
layout: post
title: "\U0001F48ERuby Tip\U0001F48E Interactive debugging without the need to install gems."
categories:
  - Just Ruby
excerpt: >-
  Discover a simple and fast way to debug in Ruby without installing additional
  gems. With the Binding class and the integrated IRB console, you can explore
  and modify the execution context to resolve errors efficiently.
image: /assets/images/ruby-debugging.avif
lang: en
time: 5 min
author: Andrés
comments: true
redirect_from:
  - /ruby/irb/tip/2023/11/20/ruby-tip-binding-irb.html
---
There are different popular gems in the Ruby universe with various functionalities and different syntaxes to perform interactive debugging. Some of these gems can be [byebug](https://github.com/deivid-rodriguez/byebug) or [debug](https://github.com/ruby/debug). The problem with these gems is that sometimes they need to be installed, configured and have their own commands to learn. This takes some time and many times there is no need for something so complex for such a small bug.

For those cases, we will have the option of using the [Binding](https://docs.ruby-lang.org/en/master/Binding.html) class. This allows us to encapsulate the execution context at a given point and return it for future use. Binding objects can be created by calling the `Kernel#binding` method and the console will be raised using the public instance method `irb`.

With a little bit of code it will be more than clear:

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

Running our small script will open an IRB session ([Default gem](https://stdgems.org/irb/)) with which you can review the context and modify it:

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

And that's it, you can use it to debug your scripts, web scrappers or whatever you are building.

It is also very likely that you already have the [debug] gem (<https://github.com/ruby/debug>) installed, since it is automatically installed with your version of Ruby. IRB integrates excellently with this gem, so if you need more advanced features, just type `debug` in your IRB session and it will activate it.

For more information on the use of IRB, you can visit [this documentation](https://docs.ruby-lang.org/en/master/IRB.html#module-IRB-label-Usage) and on debug integration specifically [here](https://github.com/ruby/irb#debugging-with-irb).

---

If you liked it feel free to say hi in the comments, I'll be watching.

Happy coding!

