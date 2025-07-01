---
layout: post
title: "OasRails: From a Rails Engine to a Framework-Agnostic Solution"
category:
  - Just Ruby
  - On Rails
excerpt: "Ruby is not just Rails, which is why I split my gem for API documentation, and now it could work with multiple frameworks."
image: /assets/images/ecosystem.png
author: Andrés
comments: true
---

Ruby is a language that is easy to understand, fun to write, and performs well, but unfortunately, its popularity hasn't grown over time. **Worse yet, this popularity is almost entirely based on a single framework: [Ruby on Rails](https://rubyonrails.org/).** **Therefore, it is essential for those of us who develop in Ruby to diversify the ecosystem and create solutions that work regardless of the framework** to ensure Ruby's longevity as a programming language that endures over time and isn't controlled by a handful of companies.

Following this line, I discovered a framework called [Rage](https://github.com/rage-rb/rage) for API creation. I had already tried Grape and knew about [Padrino](https://padrinorb.com/), Sinatra, and [Hanami](https://hanamirb.org/). But Rage seemed simple to me, and I also realized they had taken a very similar (almost identical) approach to the one I had taken in creating [OasRails](https://github.com/a-chacon/oas_rails) for API documentation: they used Yard tags to generate an OAS.

**And at that moment, I wondered: What if OasRails didn't just work for Rails?** So I started looking at my gem's code and realized that **most of the engine's code was in the `lib` folder, so my gem didn't need to be a Rails Engine.** It had no models, just one controller and one view.

The first attempt was to create a single gem with different adapters for different frameworks, but if I had taken that path, I would have had to rename my gem, and the tests would have been hard to maintain. Just setting up two dummy apps to test the adapters for the two frameworks I wanted to start with was already a headache.

**Then, one of OasRails' contributors enlightened me and suggested that I could extract the reusable code from OasRails into another gem, later named [OasCore](https://github.com/a-chacon/oas_core), and have each framework have its own independent adapter that would depend on OasCore.** **This way, I could keep the name OasRails for Ruby on Rails, and for other frameworks, gems with the nomenclature `"Oas#{Framework Here}"` would emerge.**

And that's the path I followed: I split my gem and created two more adapters: [OasRage](https://github.com/a-chacon/oas_rage) and [OasHanami](https://github.com/a-chacon/oas_hanami). Along the way, I also added functionality to support references and use a base file to declare common, reusable structures. And a lot of code refactoring, as Clean Code says:

> Leave Code Better than You Found It.

**Now, regarding the ecosystem, if you're thinking about developing a Rails engine, I suggest you think carefully: Is this something specific to Rails? Or can I create a framework-agnostic solution that helps everyone?** **Ruby is not just Ruby on Rails; it's a language with much more to offer.**
