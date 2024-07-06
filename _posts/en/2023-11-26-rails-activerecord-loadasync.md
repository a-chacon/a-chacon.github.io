---
layout: post
title: "Asynchronous Loading in Active Record: Boosting the Performance of your Rails Application \U0001F680"
categories:
  - On Rails
excerpt: >-
  Optimize performance in Rails 7.1 with asynchronous data loading using Active
  Record and the load_async method. Reduce response times by running queries in
  parallel, improving the efficiency of your application.
image: /assets/images/load_async.webp
lang: en
time: 5 min
author: Andrés
comments: true
---
The performance of your web application is crucial, as it affects aspects ranging from SEO to the costs you will have in your hosting service at the end of the month and the carbon footprint your website is leaving on the planet🌍. Therefore, it is essential to know any tool that can help you improve it, be aware of its existence and apply it when necessary.

This topic is so extensive that a book could be written regarding the performance optimization of your application and its effects: load times and user performance perception, cache usage, n+1 queries, CDN implementation, scalability and much more. But this time, I want to give a brief introduction to what is asynchronous data loading in Active Record with the [load_async](https://api.rubyonrails.org/classes/ActiveRecord/Relation.html#method-i-load_async) method and its friends (introduced in Rails 7.1).

## Problem

Suppose we have the following pseudo controller:

```ruby
class ApplicationController < ActionController::Base
  def main
    @films = Film.slow # 2 seconds
    @reviews = Review.slow # 4 seconds

    sleep(2) # It could be another process like call an external API
  end
end

```

The scope slow will be something like: `scope :slow, -> { select('*, sleep(1)') }`, so it will vary depending on the amount of records we have in the database. The execution in sequence of the main method would take a little more than 8 seconds, as we can see in the logs:

```bash
Completed 200 OK in 8101ms
```

## Response time optimization with asynchronous SQL

Rails 7 introduced the new [load_async](https://github.com/rails/rails/blob/6b93fff8af32ef5e91f4ec3cfffb081d0553faf0/activerecord/lib/active_record/relation.rb#L696) method in Active Record so that the query is performed from a thread pool in the background. This allows your queries to run in parallel, optimizing the response time of your controller.

The `load_async` method requires a previous configuration that you can find [here](https://guides.rubyonrails.org/configuring.html#config-active-record-async-query-executor). After that we will move on to the implementation and see the result:

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

### What happened?

We managed to cut the response time almost in half because our queries were executed in parallel. Why 4 seconds? Because `Review.slow` is the query that takes the longest time: 4 seconds; during that time, the main thread finishes executing the `sleep(2)` function, calls the result of `Film.slow`, which is probably already ready because it takes two seconds. When it calls the result of `Review.slow`, it finds that it has not finished yet (2 seconds to go), so it passes it to the main thread and finishes executing it (2 seconds into sleep and then 2 more seconds to finish `Review.slow` we get to our 4 seconds).

## Rails 7.1

Since `load_async` is specifically a method of the `ActiveRecord::Relation` class, it would not work for aggregations or single record responses. For that, Rails 7.1 introduces a number of methods that will help us to perform these types of queries in the background:

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

Unlike `load_async`, these methods return an object of type [ActiveRecord::Promise](https://api.rubyonrails.org/classes/ActiveRecord/Promise.html) and to obtain the result we must execute the `value` method:

```ruby
class ApplicationController < ActionController::Base
  def main
    @films_count = Film.slow.async_count
    @reviews = Review.slow.load_async

    sleep(2) # Could be another process, such as calling an external API
  end
end
```

And then, in the view, to access the data:

```erb
<span><%= @films_count.value %><span>
```

### Final thoughts

Asynchronous data loading can be your greatest ally when you want to improve the performance of your application. You will be able to improve response times with simple changes in your code. I think this is a good introduction to the topic, but you should not stay with this knowledge alone. If you are interested in the topic, I recommend you to read the following blog post:

- [The In-depth Guide to ActiveRecord load_async in Rails 7](https://pawelurbanek.com/rails-load-async)

There you can get a better understanding of how asynchronous loading works, use cases and why not to abuse it.

So far for today, I hope you have learned something new. Any detail, contribution or comment, don't hesitate to write me.

