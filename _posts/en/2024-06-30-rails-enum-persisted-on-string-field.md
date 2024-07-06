---
layout: post
title: 'ActiveRecord::Enum persisted in a string field. Is it a bad idea?'
categories:
  - On Rails
excerpt: >-
  String vs int fields in ActiveRecord::Enum: Which is the best option for your
  Rails database?
image: /assets/images/enum.webp
lang: en
time: 5 min
author: Andrés
comments: true
redirect_from:
  - /ruby/rails/benchmark/2024/06/30/rails-enum-persisted-on-string-field.html
---
There was a moment in my applications when I stopped persisting the fields that I was going to define as enums in `int` fields and started doing it in `strings`. I made this decision because, on several occasions, I was asked for a database dump for analysis, and whenever they encountered a `status` field (or any other using `enum`) with values like 0, 1, or 2, they would end up asking me about its meaning. So, instead of using numerical values that lack meaning and context, I directly changed them to a `string` that in itself has meaning and provides context.

But a few days ago, I reviewed the [documentation](https://api.rubyonrails.org/classes/ActiveRecord/Enum.html) again and found a phrase that made me question this:

> Finally it’s also possible to use a string column to persist the enumerated value. **Note that this will likely lead to slower database queries**

Using it would result in slower database queries!

So, as a good programmer, concerned about the efficiency and performance of my applications 🤓, I questioned what I was doing and, before making any changes, I wanted to verify this. I created a simple [application](https://gitlab.com/a-chacon/api-benchmark) in Rails connected to MySQL with two models, one with an enum persisted in `int` and another persisted as `varchar`, each with 100,000 records. I closed all applications that could interfere and ran a benchmark:

```bash
                                       user     system      total        real
String Enum Count:                 0.477732   0.052428   0.530160 ( 21.794783)
Integer Enum Count:                0.374897   0.030260   0.405157 ( 21.639400)
String Enum Paginated Index:       0.351621   0.017249   0.368870 (  0.639043)
Integer Enum Paginated Index:      0.317277   0.022936   0.340213 (  0.524883)
String Enum Single Record Fetch:   0.294010   0.031218   0.325228 (  0.489015)
Integer Enum Single Record Fetch:  0.297743   0.015502   0.313245 (  0.497845)
```

All the results were very similar, with small variations in the time taken for 1,000 simple query executions. If I understand correctly, we could take the case of `count` queries. They had a difference of 0.155383s, or approximately 0.1ms per query in favor of `int`. But for a `select` with `limit(1)`, the `string` won. So I wonder, will an `enum` persisted as a `string` really result in slower queries?

<iframe src="https://giphy.com/embed/Dh5q0sShxgp13DwrvG" width="480" height="298" style="" frameBorder="0" class="giphy-embed" allowFullScreen></iframe><p><a href="https://giphy.com/gifs/scaler-official-dogs-computer-typing-Dh5q0sShxgp13DwrvG">via GIPHY</a></p>

Well, whether it’s slower or not, I believe that in the average application, the difference will be in milliseconds and won’t be that significant. Therefore, my initial reason for starting to use `enums` persisted as `strings` remains the most important. And I’m not the only one with a reason for doing this; these two questions on Stack Overflow were looking for something similar several years ago:

- <https://stackoverflow.com/questions/24105813/possibility-of-mapping-enum-values-to-string-type-instead-of-integer>
- <https://stackoverflow.com/questions/32938729/how-to-store-enum-as-string-to-database-in-rails>

What do you think? Did you know that an `enum` can be persisted as a `string`?

