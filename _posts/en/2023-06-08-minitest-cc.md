---
layout: post
title: >-
  Minitest-cc: A minimalistic way to know what is the code imageage of your
  tests.
categories:
  - On Rails
excerpt: >-
  Ministest-cc is a lightweight and simple plug-in for the Minitest framework
  that provides an output about the code coverage of your tests. Here we will
  see how to install it and how it works.
image: /assets/images/ruby.webp
lang: en
time: 2 min
author: Andrés
comments: true
---
When it comes to Code Coverage in Ruby everyone thinks of SimpleCov. The gem that delivers a complete coverage report and you can see the details in HTML files that it creates in your project. But when it comes to just having a reference about your coverage and not including more files and settings to your project, that's where this gem/plug-in for Minitest comes to work.

The idea is to make a report as simple as possible, without persistence, to serve as a reference when you are developing. In each execution of your test suite, either in general or by specific file, you can see what the coverage is after the execution ends.

To install the gem is as easy as adding it to your Gemfile:

```ruby
gem 'minitest-cc'
```

Add the following lines to the beginning of your file `test_helper.rb`:

```ruby
require 'minitest/cc'
Minitest::Cc.start
```

After running your tests you should see an output like the following:

```bash
Running 8 tests in a single process (parallelization threshold is 50)
Run options: --seed 26716

# Running:

........

# Coverage:

Lines: 100.0%   Branches: 50.0% Methods: 100.0%

Average: 83.33%


Finished in 0.823512s, 9.7145 runs/s, 10.9288 assertions/s.
8 runs, 9 assertions, 0 failures, 0 errors, 0 skips
```

And that's it. There are two important things you can configure:

- The output in summary form or detailed by files (If your project is very large I don't recommend it).
- Path of files to check if they are executed

Here is an example of how these settings could be applied:

```ruby
Minitest::Cc.start(:lines, :branches, :methods)
Minitest::Cc.tracked_files = [
  './app/\*\*/\*.rb',
  './lib/\*\*/\*.rb'
]
Minitest::Cc.cc_mode = :per_file
```

In conclusion, Minitest-cc is a simple and easy-to-use option to get a general reference on the coverage of your tests.

