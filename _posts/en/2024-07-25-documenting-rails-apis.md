---
layout: post
title: 'Generating Documentation for Your Rails API: I Build My Own Tool.'
category:
  - On Rails
excerpt: >-
  After searching for a simple, interactive, and easy-to-use tool to document
  the APIs I build with Rails, and not finding the right one, I decided to
  create my own: OasRails.
image: /assets/images/oas_rails.avif
author: Andrés
comments: true
---
**API documentation is key to making everything work well.** It helps developers understand how to use it, reducing errors and making integration much faster. **Good documentation not only makes things easier but also makes the API more attractive and pleasant to use. Without clear documentation, even the best API can be a problem for developers.**

## **The Need**

After experiencing the **interactive documentation** of **FastAPI in Python**, I wanted to find a **similar functionality for my Rails APIs in the Ruby ecosystem.** I found some projects, but none met my expectations 100%. The idea was to have a **tool that is easy to use, without the need to learn a new DSL.** A solution that generated **interactive documentation with a pleasant interface. Dynamic, being able to see changes by simply reloading the interface.**

I think sometimes we don't know what we need until we see it, or at least that's what happened to me. I used to simply use **Postman.** After programming each endpoint, I would go to **Postman** and document each endpoint with the basics (often repeating information). But we are programmers, why not make the process easier? **Why can't code be expressive enough to document itself?** Or at least try.

## **Solutions**

Among the solutions I found, I think the most well-known and complete is **ApiPie**, very close to what I was looking for, but one of the major limitations is that it doesn't generate an **OAS > 2.0** at the moment. You have to learn a **DSL** and, importantly, it lacks a good interface.

Some of the other solutions:

- **[swagger_yard-rails](https://github.com/livingsocial/swagger_yard-rails)**: Seems abandoned, but serves as inspiration.
- **[Rswag](https://github.com/rswag/rswag)**: Not automatic, depends on **RSpec;** many developers now use **Minitest** as it is the default testing framework.
- **[grape-swagger](https://github.com/ruby-grape/grape-swagger)**: Requires **Grape.**
- **[rspec_api_documentation](https://github.com/zipmark/rspec_api_documentation)**: Requires **RSpec** and a command to generate the documentation.

![](/assets/images/reddit-api-doc.png)

## **My Tool**

So now that I have time (without a full-time job) and after years of searching —I say years because more than two years ago I had already written a [question on Stack Overflow](https://stackoverflow.com/questions/71947018/is-there-a-way-to-generate-an-interactive-documentation-for-rails-apis)—, I decided to create my own tool:

### [**OasRails**](https://github.com/a-chacon/oas_rails)

**OasRails is an engine for Rails that generates an OAS v3.1** from the application's routes, examines the source code and comments of each method to try to generate documentation, and finally displays it using **RapiDoc.** All this dynamically, with little effort, and in one project.

#### **Features**

When I was looking for a solution that was `dynamic`, I meant that the documentation was generated at the time of the request and not pre-built with a command. **OasRails** builds the specification document every time you query the endpoint (this should change in production).

When I talked about an `automatic` solution, I meant extracting information that is already in the code. For example, **OasRails** can:

- Build the names of your routes based on the method and controller name.
- Detect the possible responses of your endpoints based on the `render` statements in the source code.
- Tag your routes based on the namespace.
- Extract examples of request body from fixtures or FactoryBot (to be implemented).

When I said `easy to use`, I meant you just need to comment on your code to document. You don't need **RSpec**, a **DSL**, or **Grape** (nothing personal against the project, I've used it and I like it).

Regarding the `interactive` feature, we leave that to [RapiDoc](https://rapidocweb.com/), which is mounted on an engine view using **CDN.**

[Repository Link Of Project](https://github.com/a-chacon/oas_rails)

---

## **Practical Example**

Let's create an API with the following command:

```
rails new api-example --api
```

Let's add resources and their endpoints quickly with the following commands:

```
rails g scaffold user name:string email:string age:integer

rails g scaffold project title:string description:text user:references

rails g scaffold task title:string description:text status:string project:references
```

Now let's add OasRails to the Gemfile:

```
gem 'oas_rails'
```

We mount the engine in the `routes.rb` file:

```
mount OasRails::Engine => '/docs'
```

Run the migrations with `rails db:migrate`, install the dependencies with `bundle install`, and finally start the project with `rails s`. You can visit the documentation at `http://localhost:3000/docs`.

![](/assets/images/api-example-docs.png)

Each endpoint is documented with at least a title, route, request body, and possible responses:

![](/assets/images/api-example-doc-endpoint.png)

**Keep in mind that this information cannot be extracted in more real-world scenarios where APIs vary in structure, and it's necessary to provide comments for each endpoint.**

[Repository Link of Practical Example](https://github.com/a-chacon/api-example)

---

## **Project Future**

The project is still in its early stages; I believe it needs a lot of work to become a **stable and secure tool.** However, some of the points I intend to improve are:

- **Clean, document, and structure the code**
- **Support for documenting authentication methods**
- **Define global tags/configuration** (e.g., common responses like 404 errors)
- **Post-process the JSON and replace common objects with references to components**
- **Create a temporary file with the JSON in production mode** to avoid rebuilding it on every request
- **Create tags for popular gems used in APIs** (e.g., a `@pagy` tag for common pagination parameters)
- **Add basic authentication to OAS and UI for security reasons**
- **Implement the ability to define OAS by namespaces** (e.g., generate OAS for specific routes like `/api` or separate versions V1 and V2)

---

**Creating good documentation is essential for the success of any API.** **OasRails** is my attempt to make this process simpler and more effective for the Rails community. If you're interested, I invite you to try it out and contribute to the project.

