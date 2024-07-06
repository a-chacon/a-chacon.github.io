---
layout: post
title: 'Web Scraping with Ruby: A Quick Guide'
categories:
  - Just Ruby
excerpt: >-
  Discover how to perform web scraping in Ruby with Nokogiri, the leading HTML
  and XML document parsing library. Learn the key techniques in this article on
  web scraping in Ruby.
image: /assets/images/nokogiri.png
lang: en
time: 5 min
author: Andrés
comments: true
redirect_from:
  - /ruby/scraping/nokogiri/2023/09/01/using-nokogiri.html
---
Nokogiri is one of the most famous gems within the Ruby ecosystem. It even has more downloads registered on [rubygems.org](https://rubygems.org) than Rails (693,378,140 as of this writing. Rails has only 460,230,689). It works with both XML and HTML documents, provides a simple API for reading, writing and querying documents.

We will see how to use it to perform a simple web scraping. If we know the ids, classes or types of HTML elements where the data we need are stored, then we can extract them. The first step will be to consult the web page that contains the data we need, then search for our information and finally write it in a CSV file.

## Get the web page

![](/assets/images/scraping_projects.png)

Let's suppose that we will do a web scraping of my own web page in order to obtain a list of projects. For this, the easiest way to query our page will be as follows:

```ruby
require 'nokogiri'
require 'open-uri'
require 'csv'

html_doc = Nokogiri::HTML(URI.open("https://a-chacon.com/projects"))
```

With this we will have our HTML document ready to query through the `html_doc` object.

## Consulting with Nokogiri

To query the document we will use the css selector that always returns a [NodeSet](https://nokogiri.org/rdoc/Nokogiri/XML/NodeSet), something very similar to an Array. This NodeSet contains a list of objects [Node](https://nokogiri.org/rdoc/Nokogiri/XML/NodeSet). The methods of each one of these classes we will see them later.

### Define what we want to extract

To know what we are looking for, we will use a structure:

```ruby
Project = Struct.new(:title, :description, :image, :tags)

projects = []
```

Now that we know what we're looking for, let's go for it.

### Get all cards via HTML attribute and CSS class

![](/assets/images/scraping_div.png)

To obtain the cards we will do it by selecting the attribute and class. This would look like this:

```ruby
cards = html_doc.css("div.shadow-indigo-200")
```

This will return a NodeSet of all matches for a `div` containing the css class `shadow-indigo-200`.

In this case, the NodeSet should contain HTML elements with the following structure:

```html
...
<div
  class="mb-10 overflow-hidden rounded-lg bg-white shadow-lg shadow-indigo-200"
>
  <img
    src="assets/images/comocambio.jpg"
    alt="image"
    class="object-cover w-full max-h-48"
  />
  <div class="px-6 pt-4 flex justify-center">
    <span class="inline-block px-2 py-1 text-sm mr-2 mb-2">#Rails</span>
    <span class="inline-block px-2 py-1 text-sm mr-2 mb-2">#AWS</span>
  </div>
  <div class="text-center mx-8 mb-8">
    <h3
      class="text-black font-medium hover:text-primary mb-4 block text-xl sm:text-[22px] md:text-xl lg:text-[22px] xl:text-xl 2xl:text-[22px]"
    >
      ComoCambio
    </h3>
    <p class="text-body-color mb-7 text-base md:text-lg leading-relaxed">
      ComoCambio: Impulsando una cultura saludable como parte del programa de
      Cencosud. Proyecto en desarrollo desde hace dos años, donde contribuyo
      como desarrollador back-end y DevOps freelance para Zeeers.
    </p>
    <div class="flex justify-center">
      <a
        class="pr-3 transition hover:scale-110 duration-300"
        href="https://comocambio.com"
        target="_blank"
      >
        <img src="/assets/images/link.png" alt class="h-6" />
      </a>
    </div>
  </div>
</div>
...
```

### Iterate over the cards to extract what is needed

Now that we have a list of nodes we can iterate it in the same way as an Array.

```ruby
cards.each do |c|
    title = c.at_css("h3").content
    description = c.at_css("p").content
    image = c.at_css("img.object-cover")["src"]
    tags = c.css("span").map{|t| t.content}

    projects << Project.new(title, description, image, tags)
end
```

`at_css` is used to get a single result and not a NodeSet and yes, a NodeSet can also be iterated with `map`. When we get a node we can extract the values of its attributes in the same way as if we were accessing a Hash.

### Write the results

And finally you write your results where you want and the way you want. Here I will show you how it would be if you want to write them in a CSV.

```ruby
CSV.open("myfile.csv", "w") do |csv|
    projects.each {|p| csv << p.to_a}
end
```

This is a very simple and clear example that can be improved.

## Ways to search

Now that we know how the process is in general, I will show a couple more examples of how we can search in the document.

1. To search by element, class and again an element:

```ruby
titles = html_doc.css("div.shadow-indigo-200 h3").map(&:text).map(&:strip)
# ["CalendarioChileno", "ComoCambio", "Paso App", ...]
```

2. To search by value of an attribute of an element:

```ruby
images = html_doc.css('img[alt="image"]').map{|i| i['src'] }
# ["assets/images/calendariochileno.png", ... ]
```

## Last thoughts

Nokogiri is an excellent tool to obtain information from web pages, its use is easy and when you understand the use of selectors it does not take much time to perform a simple web scraping.

You may encounter problems along the way such as blocking your ip for too many queries in a row or you may have to solve a captcha. But you are not the first to face such problems and there are already people who have worked on solutions: you can use third party services like [Apify](https://apify.com/) or run projects like [CloudflareSolverRe](https://github.com/FlareSolverr/FlareSolverr) that will solve cloudflare captchas for you.

