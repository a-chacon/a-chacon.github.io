---
layout: post
title: 'Creating a REST API with Ruby on Rails. Chapter 1: Initial Setup and Models'
categories:
  - On Rails
excerpt: >-
  We laid the foundations of a REST API in Ruby on Rails by designing the
  database, creating models, and configuring factories for test records. Focused
  on code scalability and future adaptability.
image: /assets/images/apirestcap1.webp
lang: en
time: 2 min
author: Andrés
comments: true
---
A couple of months had passed without starting a new project or programming anything significant, but a few days ago that changed. I had to start a new REST API with Ruby on Rails. Whenever that happens, I begin to ask myself questions like: Should I use a gem for authentication or program it all myself? How will I manage permissions? Should I use the same serializer I always use or look for something more updated and new? Should I create the models first and then the controllers, or create everything at once with `rails scaffold`?

As these questions arose 🤔, I came up with the idea of writing a series of posts to clarify **my way of creating APIs with Ruby on Rails**, which will serve as a reminder for myself and as a learning resource for others to complement their knowledge. Especially since I couldn't find any good guides on the internet, they are all very basic with unrealistic examples that don't go beyond a simple CRUD.

Therefore, my idea is to divide the topic into 4 chapters, each of which will be a post that I will publish on my blog, as long as I don't lose motivation along the way hehe 😅.

- **Chapter 1**: Initial Setup and Models <-------- You Are Here!
- [**Chapter 2**: CRUD and Data Serialization]({{page.next.url}})
- **Chapter 3**: User Authentication and Authorization
- **Chapter 4**: Error Handling and Best Practices

**For this guide, I assume you know what a REST API is, have Ruby installed, Rails gem installed, and are using a GNU/Linux-based operating system.**

If not, I'll leave you with some resources you should look at before proceeding:

- <https://aws.amazon.com/what-is/restful-api/>
- <https://www.ruby-lang.org/en/documentation/installation/>
- <https://guides.rubyonrails.org/getting_started.html#creating-a-new-rails-project-installing-rails>
- <https://itsfoss.com/linux-better-than-windows/>

<iframe src="https://giphy.com/embed/qt73FYHjuXqAj241m8" width="480" height="480" style="" frameBorder="0" class="giphy-embed" allowFullScreen></iframe><p><a href="https://giphy.com/gifs/pudgypenguins-building-build-brick-qt73FYHjuXqAj241m8">via GIPHY</a></p>

## The Problem

To make things easier, I started talking to GPT and asked for a problem/requirements that will be our guide to develop our application and touch on each point that needs to be addressed. The problem:

> We need to develop an API for a project management platform that allows users to register projects, manage specific roles, and administer tasks associated with each project. On this platform, administrators will have the exclusive ability to create, update, and delete projects, as well as assign roles like administrator or collaborator to other users. Additionally, administrators will be the only ones authorized to create and manage tasks within each project, ensuring that only they can handle the project's specific activities. On the other hand, collaborators will have read-only access to the project's tasks, allowing them to view detailed information without the ability to modify it. This API will not only ensure the security and integrity of the data but also provide efficient and scalable management of projects and tasks for different teams and users within the organization.

### Step Number 0

Before starting to write code, it's good to perform [data modeling](https://www.ibm.com/topics/data-modeling) in the way that is easiest for you. This will lay the groundwork for everything you will do from now on, not in a strict way, but rather as a guide. I recommend doing it on [dbdiagram.io](https://dbdiagram.io). So, following our problem, I will solve it with the following database structure:

![database model](/assets/images/db.png)

### Creating The Ruby on Rails Application

Navigate to your preferred directory and run the command:

```bash
rails new api-project-management --api
```

Done, **you now have your API created with Ruby on Rails**.

## Install These Gems Before Starting 💎

First, **you must write tests**. And to ensure our tests work well, we'll prepare the environment before creating any models. We will add these two gems to our Gemfile:

```ruby
Gemfile
group :development, :test do
  ...

  gem "faker"

  gem "factory_bot_rails"

  ...
end
```

[Faker](https://github.com/faker-ruby/faker), if you don't know it, is for easily creating test data. The second, [factory_bot_rails](https://github.com/thoughtbot/factory_bot_rails), is for implementing factory_bot in Rails, an easy way to create test records and a much better alternative (in my opinion) to fixtures. It would be good for you to start looking at its documentation.

```ruby
Gemfile
gem "devise"
gem "devise-api"

gem "pundit"

gem "blueprinter"
```

We will also add [devise](https://github.com/heartcombo/devise) and [devise-api](https://github.com/nejdetkadir/devise-api) for authentication, [pundit](https://github.com/varvet/pundit) for authorization, and [blueprinter](https://github.com/procore-oss/blueprinter) for serialization. This will give you an idea of what's coming in the next chapters.

### Creating Our Resources 🪵

#### User

For the `User` resource, we will only create the model, as we will handle creation and login in the next chapter with the [devise-api](https://github.com/nejdetkadir/devise-api) gem. Let's run:

```bash
rails g model user
```

The email and password fields will not be added directly, devise will do that for us. At this point, I suggest you go to the devise documentation and review the [getting started](https://github.com/heartcombo/devise?tab=readme-ov-file#getting-started) section. But in short, you need to run these two commands:

```bash
rails generate devise:install
rails generate devise user
```

#### Project

For `Project` we will use the `scaffold` command since we need a complete CRUD.

```bash
rails g scaffold project name:string description:text
```

#### Role

`Role` will be the model that makes the relationship between a `User` and a `Project`. It will have an enum where we will define the role that each user plays in each project they are related to. It will also be a complete CRUD, but this is where we will handle permissions later on.

```bash
rails g scaffold role role:string user:references project:references
```

#### Task

Finally, `Task`. It will also have a complete CRUD and handle permissions.

```bash
rails g scaffold task title:string description:text status:string project:references
```

---

We execute `rails db:migrate` to create the tables in our database.

---

### Our Models

The models will be simple, without much business logic since our example does not require it. But at least we need to ensure that the associations are correctly enforced and that the `enum` for `Role` and `Task` is defined. So, we will modify the `User` and `Project` models to look as follows, respectively:

```ruby
/app/models/user.rb
class User < ApplicationRecord
  has_many :roles
  has_many :projects, through: :roles
end
```

```ruby
/app/models/project.rb
class Project < ApplicationRecord
  has_many :roles
  has_many :users, through: :roles

  has_many :tasks
end
```

And `Role` and `Task` looks as follows:

```ruby
/app/models/role.rb
class Role < ApplicationRecord
  belongs_to :user
  belongs_to :project

  enum :role, {manager: "manager", contributor: "contributor"}
end
```

```ruby
/app/models/task.rb
class Task < ApplicationRecord
  belongs_to :project

  enum :status, {next_to_do: "next_to_do", doing: "doing", complete: "complete"}
end
```

I prefer to define enums in this way, with key-value pairs in the database, because there have been times when I was asked for a data dump directly from the database. When that happens and you have an enum defined in the traditional way with numeric values, **it lacks meaning for anyone who sees it without understanding your model**.

### Factories

<iframe src="https://giphy.com/embed/yKxo7c9Q6pZoUzAfPu" width="480" height="480" style="" frameBorder="0" class="giphy-embed" allowFullScreen></iframe><p><a href="https://giphy.com/gifs/nounish-dao-nouns-noggles-yKxo7c9Q6pZoUzAfPu">via GIPHY</a></p>

When creating our models, factory_bot generates a file for each one in the `test/factories/*` folder with definitions for creating test records. By default, they may not make much sense; we need to adjust relationships, create data that closely resembles real scenarios, and ensure the definitions help us conduct the tests we need. We'll fix that by using `Faker` and maximizing the potential of `factory_bot`.

```ruby
test/factories/roles.rb
FactoryBot.define do
  factory :role do
    role { Role.roles.keys.sample }
    user
    project
  end
end
```

```ruby
test/factories/users.rb
FactoryBot.define do
  factory :user do
    email { Faker::Internet.email }
    password { Faker::Internet.password }
    factory :user_with_projects do
      transient do
        projects_count { 5 }
      end

      after(:create) do |user, context|
        create_list(:role, context.projects_count, user:)
      end
    end
  end
end
```

```ruby
test/factories/projects.rb
FactoryBot.define do
  factory :project do
    name { Faker::Lorem.word }
    description { Faker::Lorem.paragraph }

    factory :project_with_tasks do
      transient do
        tasks_count { 5 }
      end

      after(:create) do |project, context|
        create_list(:task, context.tasks_count, project:)
      end
    end
  end
end
```

And Tasks like this:

```ruby
test/factories/tasks.rb
FactoryBot.define do
  factory :task do
    title { Faker::Lorem.word }
    description { Faker::Lorem.paragraph }
    status { Task.statuses.keys.sample }
    project
  end
end
```

### Until Here for Today

With these steps, we have laid the **foundations of our REST API** and are ready to move forward to endpoints and integration testing, which we will cover in the next chapter. So far, nothing is set in stone; it's impossible to achieve perfect planning that won't undergo modifications in the future. The ideal approach is always to ensure your code is scalable and can accommodate future changes.

We've designed our database, created our models, defined associations correctly, discussed how I prefer to define enums, and set up our factories to generate test records 🏭. I'll leave the repository URL with the code below in case you want to take a look, and **any comments or feedback to keep me motivated to continue writing are welcome**.

Repo: <https://github.com/a-chacon/api-project-management-example>

