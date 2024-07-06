---
layout: post
title: 'Creating a REST API with Ruby on Rails. Chapter 2: Endpoints and Serialization'
categories:
  - On Rails
excerpt: >-
  How to build efficient RESTful APIs with Ruby on Rails, discovering
  fundamental REST principles, initial project setup, route optimization with
  nesting, and the use of serializers.
image: /assets/images/apirestcap2.webp
lang: en
time: 2 min
author: Andrés
comments: true
redirect_from:
  - /en/rails/ruby/2024/06/23/creating-rails-api-cap-2.html
---
Before continuing to build our **REST API with Ruby on Rails**, I would like to take a step back to clarify a few points. When I started working as a developer, there were many things that were unclear to me and that took time, effort, testing, and errors to learn. One of those was: What is an API really, and what is the best way to build one? Which routes to define and what responses to give?

Now this seems obvious and basic to me, but I believe it's worth reviewing. According to [IBM](https://www.ibm.com/es-es/topics/rest-apis), a REST API is:

> A REST API (also known as a RESTful API or web RESTful API) is an application programming interface (API) that adheres to the principles of the representational state transfer (REST) architectural style. REST APIs provide a flexible and lightweight way to integrate applications and connect components in microservices architectures.

The only thing to be respected when designing a REST API are the **6 REST principles**:

- **Uniform interface**: All requests for the same resource should look the same and have a unique URI.
- **Client-server separation**: Client and server are independent; the client only knows the URI of the resource.
- **Stateless**: Each request must contain all necessary information; no state is stored on the server side.
- **Cacheability**: Resources should be cacheable to improve performance and scalability.
- **Layered system architecture**: Calls and responses can pass through multiple layers of intermediaries.
- **Optional code on demand**: Responses can contain executable code on demand.

<iframe src="https://giphy.com/embed/52HjuHsfVO69q" width="480" height="269" style="" frameBorder="0" class="giphy-embed" allowFullScreen></iframe><p><a href="https://giphy.com/gifs/reactiongifs-52HjuHsfVO69q">via GIPHY</a></p>

And how does this work? If you're reading this, you probably already know. HTTP requests perform standard database operations like create, read, update, and delete (CRUD) on a resource. Here's my recommendation and advice: **always try to design your APIs around resources and not actions**. With Ruby On Rails, this isn't difficult, but there's always temptation to create endpoints like `POST /publishArticle` instead of `PUT /article/:article_id` with the correct content.

With this clarified, we continue with our series of posts, second chapter:

- [**Chapter 1**: Initial Setup and Models]({{page.previous.url}})
- **Chapter 2**: Endpoints and Serialization <----------- You Are Here!
- **Chapter 3**: Authentication and Authorization
- **Chapter 4**: Error Handling and Best Practices

## Routes

Now, continuing with our example, we'll fix the routes. We'll use **nested routes** for resources dependent on `Projects` using the [shallow](https://guides.rubyonrails.org/routing.html#shallow-nesting) option to create only the necessary routes to identify the resource and [avoid deep nesting](http://weblog.jamisbuck.org/2007/2/5/nesting-resources).

```ruby
# config/routes.rb
Rails.application.routes.draw do
  get 'up' => 'rails/health#show', :as => :rails_health_check

  resources :projects, shallow: true do
    resources :tasks
    resources :roles
  end
end
```

If we use the `rails routes` command, we'll see our routes pointing to our controller methods in this way:

```fish
     projects GET    /projects(.:format)                   projects#index
              POST   /projects(.:format)                   projects#create
      project GET    /projects/:id(.:format)               projects#show
              PATCH  /projects/:id(.:format)               projects#update
              PUT    /projects/:id(.:format)               projects#update
              DELETE /projects/:id(.:format)               projects#destroy
project_tasks GET    /projects/:project_id/tasks(.:format) tasks#index
              POST   /projects/:project_id/tasks(.:format) tasks#create
         task GET    /tasks/:id(.:format)                  tasks#show
              PATCH  /tasks/:id(.:format)                  tasks#update
              PUT    /tasks/:id(.:format)                  tasks#update
              DELETE /tasks/:id(.:format)                  tasks#destroy
project_roles GET    /projects/:project_id/roles(.:format) roles#index
              POST   /projects/:project_id/roles(.:format) roles#create
         role GET    /roles/:id(.:format)                  roles#show
              PATCH  /roles/:id(.:format)                  roles#update
              PUT    /roles/:id(.:format)                  roles#update
              DELETE /roles/:id(.:format)                  roles#destroy
```

## Tests

### Setup with Factories

If we run `rails t`, we'll encounter several errors. The first issue we need to address is that Rails has generated our factories using `FactoryBot`, but it's not automatically using them to create test records in the `setup` block of each controller test file. Instead, it's using fixtures to obtain a test object. However, these fixtures were not created because the behavior changed when we installed `FactoryBot`; now factories are used instead of fixtures. To solve this, we need to replace line number 5 in our controller tests as follows:

```ruby
# test/controllers/projects_controllers_test.rb
-     @project = projects(:one)
+     @project = FactoryBot.create(:project)
```

Additionally, we'll add one more line to the `setup` block with a `project` object that we'll use later in the routes:

```ruby
# test/controllers/roles_controllers_test.rb
-     @role = roles(:one)
+     @role = FactoryBot.create(:role)
+     @project = @role.project
```

```ruby
# test/controllers/tasks_controllers_test.rb
-     @task = tasks(:one)
+     @task = FactoryBot.create(:task)
+     @project = @task.project
```

### Routes Helpers

We should still have 4 failing tests due to the change in the routes structure. To fix this, we need to use the new helpers created with nested routes for the `index` and `create` actions in the `RolesController` and `TasksController`. Specifically, you need to change `roles_url` and `tasks_url` on lines 9 and 15 to `project_roles_url(@project)` and `project_tasks_url(@project)` respectively.

Once you've done that correctly, you should be able to run your tests and get a result like this:

```bash
15 runs, 27 assertions, 0 failures, 0 errors, 0 skips
```

## Creating Serializers

**Data serialization refers to the process of converting data objects** (such as ActiveRecord model instances) into formats that can be **easily transmitted** and understood by different systems, specifically transforming them into JSON format.

In Rails, our models already include the [ActiveModel::Serializers::JSON](https://api.rubyonrails.org/classes/ActiveModel/Serializers/JSON.html) module by default, allowing them to serialize all attributes (which can be filtered) into a Hash and, consequently, into a JSON object. This is what happens by default in our controller methods created with `scaffold`. However, we need to go further, requiring more customization and flexibility. For this, I propose using Blueprinter, a reliable and flexible option.

### [Blueprinter](https://github.com/procore-oss/blueprinter)

> Blueprinter is a JSON object presenter for Ruby that takes business objects, breaks them down into simple hashes, and serializes them into JSON. It can be used in Rails instead of other serializers (such as JBuilder or ActiveModelSerializers). It's designed to be simple, straightforward, and effective, heavily relying on the idea of views that, similar to Rails views, predefine data output in different contexts.

### Serializer Classes

So, we've already installed the gem in the previous chapter. Now, all that's left is to create our serializer classes. To do this, we'll create a folder at `app/blueprints/` and inside it include 4 files (one for each model) with the following content:

```ruby
# app/blueprints/project_blueprint.rb

class ProjectBlueprint < Blueprinter::Base
  identifier :id

  fields :name, :description

  view :with_tasks do
    association :tasks, blueprint: TaskBlueprint
  end
end
```

```ruby
# app/blueprints/task_blueprint.rb

class TaskBlueprint < Blueprinter::Base
  identifier :id

  fields :title, :description, :status
end
```

```ruby
# app/blueprints/role_blueprint.rb

class RoleBlueprint < Blueprinter::Base
  identifier :id

  fields :role
  association :user, blueprint: UserBlueprint
end
```

```ruby
# app/blueprints/user_blueprint.rb

class UserBlueprint < Blueprinter::Base
  identifier :id

  fields :email
end
```

### Implementing in Controllers

Now that we have our serializers ready, we need to implement them in our controller methods. I'll explain how to use them, but I won't show every change you need to make because there are several lines to touch. Identify each line of code in the controllers that has the word **`render`**. This specifies the response to the client, in this case JSON with the object or objects that, as mentioned, are serialized by default with **`ActiveModel::Serializers`**. But we'll change that. For instance, for a **`Project`**, we'll write: **`render json: ProjectBlueprint.render_as_json(@project)`**. This way, Blueprinter will serialize the object instead of Serializers.

Another example, for our **`show`** method, we might want to display a more comprehensive object. For that, we can do it like this: **`render json: ProjectBlueprint.render_as_json(@project, view: :with_tasks)`**, and in this way, we'll return not only the project but also its tasks.

After making the necessary changes, you can test everything is working correctly by running **`rails t`**.

<iframe src="https://giphy.com/embed/qjj4xrA1STjfa" width="480" height="353" style="" frameBorder="0" class="giphy-embed" allowFullScreen></iframe><p><a href="https://giphy.com/gifs/space-nasa-qjj4xrA1STjfa">via GIPHY</a></p>

## Final Thoughts

With this, our endpoints will be operational, routes will make sense using nesting, serializers provide greater control over which data to expose or hide depending on the method and, in the future, permissions. And most importantly, **our tests are working**. They validate the creation, retrieval, modification, and deletion of our data.

If there's any point I didn't express correctly or if I missed something so far, please let me know. Additionally, I'll add the URL of the repository where I'll be uploading the updated code for you to review:

Repo: [https://github.com/a-chacon/api-project-management-example](https://github.com/a-chacon/api-project-management-example)

