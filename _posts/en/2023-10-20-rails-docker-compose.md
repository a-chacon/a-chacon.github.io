---
layout: post
title: "\U0001F680General guide to running Ruby on Rails with Docker\U0001F680"
categories:
  - Docker
excerpt: >-
  Mounting Ruby on Rails on Docker offers isolation to avoid conflicts,
  portability to take your application anywhere, effortless scalability, easy
  maintenance and efficient team collaboration.
image: /assets/images/railsdocker.png
lang: en
time: 3 min
author: Andrés
comments: true
redirect_from:
  - /rails/docker/2023/10/20/rails-docker-compose.html
---
You probably already know the advantages of using Docker, we've already heard about it or evidenced it in projects. Here I will show you how to bring that to your Ruby on Rails application. To do what is proposed you need a Rails application, Docker installed on your computer and/or your server and motivation for a couple of trial and error.

**This is a general explanation and not a step by step guide. Some definitions may need more work depending on your project.**

## Dockerfile

You will need a `Dockerfile` file in the root of your project with the following content:

```Dockerfile
FROM ruby:3.2.2

RUN apt-get update && apt-get install -y libsodium-dev

WORKDIR /app

COPY Gemfile Gemfile.lock ./

RUN gem install bundler && bundle install

COPY . .

COPY entrypoint.sh /usr/bin/
RUN chmod +x /usr/bin/entrypoint.sh
ENTRYPOINT ["entrypoint.sh"]

```

Step-by-step explanation:

1. The FROM command is used to specify the base image on which the project will run. In my case I use the `ruby:3.2.2` image because my project uses that version of Ruby.
2. If the image you choose does not come with all the packages that your application needs, then you will have to install them. That is what happens in the line:

```
RUN apt-get update && apt-get install -y libsodium-dev
```

For example, if your application uses libvips for image processing, then you will have to add the corresponding command to install it here.
**You can check if the image you choose contains the package you need on the [page](<https://hub.docker.com/layers/library/ruby/3.2.2/images/sha256-cd6e6798429527289a12f541f75f2e632164>
9b5195bd88a0d97415bbc58cd45c?context=explore) of the image**.

3. Define a working directory
4. Copy the Gemfile to the working directory.
5. Install the gems that our project depends on.
6. Copy the rest of the project.
7. Copy and define our `ENTRYPOINT`.

### ENTRYPOINT

Why an entrypoint? Basically, because there are commands that must run at the moment of lifting a container with our image and not at the moment of the image construction. A clear example of this is the `db:migrate` command.

Then we will need another file in the root of our project called `entrypoint.sh` with the following content:

```bash
/bin/bash

if [ -f tmp/pids/server.pid ]; then
  rm tmp/pids/server.pid
fi

RAILS_ENV=$RAILS_ENV bundle exec rails db:migrate

RAILS_ENV=$RAILS_ENV bundle exec rails s -b 0.0.0.0.0
```

Step by step explanation:

1. bash script definition to run as such at run time.
2. Remove any previous server.pid.
3. We execute any pending migration of our application.
4. Run our web server.

\*\*You may need to create different entrypoints depending on your needs. Let's imagine the case that you are using [whenever](https://github.com/javan/whenever). Your entrypoint should update the crontab every time it runs, but you also don't want all your containers to run the cronjobs at the same time. So that's when you need one container to run your web service and another one to run your cronjobs. That is, two different entrypoints for the same project.

To solve that case you can create a folder in your project with the name `entrypoints` and leave your different entrypoints there. Your Dockerfile is left with one entrypoint by "default" and when you need to overwrite it (<https://docs.docker.com/engine/reference/builder/#entrypoint>) when running a container with the `--entrypoint` flag.

### ENVs

Depending on the environment in which we are running our project, it is important to add some ENVs to the container:

1. **RAILS_MASTER_KEY** in my opinion is the easiest way to allow the app to read the `credentials.yml.enc` file.
2. **DATABASE_URL** full url to your database, either mysql or postgresql.
3. **RAILS_SERVE_STATIC_FILES** if your javascript and css files will be served by your app and not a CDN.
4. **RAILS_LOG_TO_STDOUT** so your logs can be seen by the service you use and by you.

## Local test

If you want to test your image you can build it locally with the following command:

```
docker build -t rubyapp .
```

Then you can run a container from your image:

```
docker run -p 3000:3000 -e DATABASE_URL={YOUR_DATABASE_URL_HERE} rubyapp
```

Note: This is where you will need to add the environment variables, at least the database.

---

Our Dockerfile can become more complex according to our needs, but as long as you understand how it works, it will not be difficult to adapt it and make modifications. I hope these indications are useful, and if you consider that some important topic is missing, don't hesitate to leave me a comment about it.

_enjoy programming_.

