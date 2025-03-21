---
layout: post
title: "PoC: Using the Rails 8 (Beta) Authentication Generator in API-Only Mode."
category:
  - On Rails
image: /assets/images/rails8-poc-api-auth.webp
excerpt: "Getting the Rails 8 (Beta) authentication generator to work in an API-Only mode application."
author: Andrés
comments: true
---

As you may know, one of the new features in Rails 8 is the **new basic authentication generator**, which demonstrates that developing everything related to authentication in a Rails application is not so complex, and often there is no need to rely on third parties (gems). The discussion started [here](https://github.com/rails/rails/issues/50446).

That said, let's see what happens when using the generator in an API-Only application:

```bash
 rails -v
Rails 8.0.2
```

```bash
 rails new app --api & cd app
```

And execute the new command:

```bash
 rails g authentication
      create  app/models/session.rb
      create  app/models/user.rb
      create  app/models/current.rb
      create  app/controllers/sessions_controller.rb
      create  app/controllers/concerns/authentication.rb
      create  app/controllers/passwords_controller.rb
      create  app/channels/application_cable/connection.rb
      create  app/mailers/passwords_mailer.rb
      create  app/views/passwords_mailer/reset.html.erb
      create  app/views/passwords_mailer/reset.text.erb
      create  test/mailers/previews/passwords_mailer_preview.rb
      insert  app/controllers/application_controller.rb
       route  resources :passwords, param: :token
       route  resource :session
        gsub  Gemfile
      bundle  install --quiet
    generate  migration CreateUsers email_address:string!:uniq password_digest:string! --force
       rails  generate migration CreateUsers email_address:string!:uniq password_digest:string! --force 
      invoke  active_record
      create    db/migrate/20250321105722_create_users.rb
    generate  migration CreateSessions user:references ip_address:string user_agent:string --force
       rails  generate migration CreateSessions user:references ip_address:string user_agent:string --force 
      invoke  active_record
      create    db/migrate/20250321105723_create_sessions.rb
      invoke  test_unit
      create    test/fixtures/users.yml
      create    test/models/user_test.rb
```

Okay, now, if we take a look at the `SessionsController`, we’ll see that the `Login` method looks like this

```ruby
  def create
    if user = User.authenticate_by(params.permit(:email_address, :password))
      start_new_session_for user
      redirect_to after_authentication_url
    else
      redirect_to new_session_url, alert: "Try another email address or password."
    end
  end
```

In other words, it redirects to routes and/or views that don’t exist or make sense in our API, and if we inspect the `start_new_session_for` method, we’ll realize that the system is based 100% on **cookie-based authentication**. So, what do we do?

My proposal is as follows: the generator lays the groundwork for authentication, and I believe it works quite well, so with a few small modifications, we can quickly set up **Bearer Token Authentication** in our API with Rails 8 using the already generated files.

The first step will be to add **persistence for our token**. To do this, we will modify the migration that creates the sessions and add a new field called `token`:

```ruby
    create_table :sessions do |t|
      t.references :user, null: false, foreign_key: true
      t.string :ip_address
      t.string :user_agent
      t.string :token     # HERE

      t.timestamps
    end
```

Now simply run `rails db:migrate` and create a test user from the console; I will do it with this line: `User.create(email_address: "user@test.com", password: "123456789")` (we'll use it later). Next, we need to create a new token for each new user session, and the simplest way to do this is by using a callback in the `Session` model:

```ruby
# app/models/sessions.rb
class Session < ApplicationRecord
  belongs_to :user
  before_create :generate_token # Here call

  private
  def generate_token # Here implement, generate the token as you wish.
    self.token = Digest::SHA1.hexdigest([ Time.now, rand ].join)
  end
end
```

Now, returning to the `start_new_session_for` method in the `Authentication` concern, we don't need to create a cookie, so we should remove that line and leave the method looking like this:

```ruby
# app/controllers/concerns/authentication.rb
def start_new_session_for(user)
  user.sessions.create!(user_agent: request.user_agent, ip_address: request.remote_ip).tap do |session|
    Current.session = session
  end
end
```

We will also modify the `create` action in the `SessionsController` so that the responses are in JSON format instead of redirects:

```ruby
# app/controllers/sessions_controller.rb
def create
  if user = User.authenticate_by(params.permit(:email_address, :password))
    start_new_session_for user
    render json: { data: { token: Current.session.token  } }
  else
    render json: {}, status: :unauthorized
  end
end
```

**To make all this work, we need to do two things:**

1. Include the `Authentication` module in `ApplicationController` (This was included in later versions of the beta):

   ```ruby
   # app/controllers/application_controller.rb
   class ApplicationController < ActionController::API
     include Authentication
   end
   ```

2. Remove the line number 6 from the concern:

   ```ruby
   # app/controllers/concerns/authentication.rb
     included do
       before_action :require_authentication
       helper_method :authenticated? # This, we don't use helpers in APIs
     end
   ```

At this point, we should already have **login working**. To test this, I’m going to add [OasRails](https://github.com/a-chacon/oas_rails), which, by the way, **is already working with Rails 8**, and I’ll send a couple of requests to see how it behaves. I won’t explain how to implement OasRails; for that, you can check the repository or read more in [this post](/on rails/2024/07/25/documenting-rails-apis).

Successful login:

![](/assets/images/rails8_success_login.png)

Failed login:

![](/assets/images/rails8_fail_login.png)

---

We can now generate tokens; next, we’ll modify the code to **authenticate with that same token**. To do this, we will change the logic of finding the current user session from based on the cookie to based on the `Authorization` header:

```ruby

# app/controllers/concerns/authentication.rb
  def resume_session
    Current.session = find_session_by_token
  end

  def find_session_by_token
    Session.find_by(token: request.headers[:authorization]&.split(" ")[-1])
  end
```

To test this, I think we’ll need to quickly create a model that depends on `User` and requires authentication to use. Let’s try with `rails g scaffold project title:string description:text user:references`, and we’ll add the line `before_action :require_authentication` at the beginning of the controller.

Here’s a quick test of the Projects index authenticated with the token I obtained in the previous tests:

![](/assets/images/rails8_projects.png)

---

With this, you have a large part of the authentication logic working in your API-Only application. You still need to continue with the modifications in the rest of the endpoints so that the responses are in JSON format instead of supposed views that don’t exist in the application.

By the time the final version of Rails 8 is released, a **PR may appear to solve this, and the generator will work correctly in API-Only mode**. Until then, with these small modifications, you can continue building your API.
