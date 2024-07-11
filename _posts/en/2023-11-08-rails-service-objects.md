---
layout: post
title: 'Rails Service Objects: A small guide to speed up your code'
categories:
  - On Rails
excerpt: >-
  A Service Object is a Ruby class that groups business logic in an organized
  way in your Ruby on Rails application. Its use simplifies code, facilitates
  testing, encourages reuse and raises the quality of your application.
image: /assets/images/service-objects.webp
lang: en
time: 5 min
author: Andrés
comments: true
redirect_from:
  - /ruby/rails/service objects/2023/11/08/rails-service-objects.html
---
**Ruby on Rails** is a full stack framework that includes all the tools you need to develop a web app quickly. Its structure is based  
on the MVC architecture pattern and that is more than enough for most of the applications you are going to develop in the beginning with RoR.  
But when your application starts to grow according to business requirements, that's when you start to create code that does not belong to neither the **model** layer, nor to the **controller** layer and even less to the **view** layer. Then you ask yourself: Where do I write this? The answer may not necessarily be **service objects**.

> Learn just what you need to get started, then keep leveling up as you go. Ruby on Rails scales from HELLO WORLD to IPO.

In this post, you'll discover how this pattern can simplify your code and keep you in control as your project grows. We'll explore what service objects are and take a deeper dive into their implementation so you can choose their implementation so you can choose the one that best suits your needs.

# What is Service Objects in Rails?

It could be defined as a software design pattern adopted by the Rails community that is used to extract some procedural logic from models and controllers into single-purpose objects. s single-purpose objects. Very similar to an implementation of [Command pattern](https://en.wikipedia.org/wiki/Command_pattern) in Ruby and Rails.

Service Objects come as an easy way to keep some of our business logic outside of our models and controllers, creating single-responsibility objects that are easy to test, reusable and simple. This makes our controllers cleaner and our models take care of their main task: representing business data.

They are "simple" because they must fulfill a single task and the most common implementation will be through a PORO ("Plain Old Ruby Object") that will basically have:

1. An initialization method.
2. A single public method. Usually `call` or `run`.
3. Return a predictable response after execution.

## MVC + S

<iframe src="https://giphy.com/embed/PidhSZjIQOWNyOxwCb" width="480" height="360" style="" frameBorder="0" class="giphy-embed" allowFullScreen></iframe><p><a href="https://giphy.com/gifs/muppetwiki-sesame-street-muppets-grover-PidhSZjIQOWNyOxwCb">via GIPHY</a></p>

**So, now we could talk about an additional layer in our MVC application, which will be the Services layer in charge of encapsulating the business logic and it will be carried out through the use of Service Objects.**

Something positive that we can highlight from this is that the business logic is one of the parts that will evolve over time in our application. Therefore, one of the benefits of encapsulating it in these **Service Objects** is that it will be easier to modify it over time without having to modify more than a single part of your application.

It goes without saying that it is also beneficial for new developers joining your team, since **Service Objects** help us to respect principles such as **KISS** (Ke ep It Simple, Stupid) or **SRP** (Single Responsibility Principle) that directly decrease the complexity of your classes (Models or Controllers) and increase the speed with which others can understand your code. uch faster for others to understand your code.

# Implementation

Now we will move on to the practical part. As I mentioned in the previous section, the simplest way to implement Service Objects will be through POROs (Plain Old Ruby Objects), but it is not the only one. In this article, I will show three ways to do it:

1. PORO (Plain Old Ruby Object) 2.
2. Dry.rb
3. Interactor

### Context

We have a REST API login with Rails. We need to authenticate the user by using an email and a password. If we detect that the user is logging in from a new IP, then we need to send a security email to their account to confirm that it is them. Also, if the user makes more than 3 consecutive unsuccessful attempts, we will block his account for 5 minutes.

**From now on a lot of code will appear that is not necessary to understand/read in such detail. More important is to understand the intent.**

Without Service Objects, we would do something like this:

```ruby
# app/controllers/authentication_controller.rb

class AuthenticationController < ApplicationController
  def create
    user = User.find_by(email: params[:email])

    if user && user.authenticate(params[:password])
      session[:user_id] = user.id
      jwt = JwtManager.encode(user)

      if first_login_from_new_ip?(user, request.remote_ip)
        send_security_email(user, request.remote_ip)
      end

      render json: { success: true, data: { token: jwt } }
    else
      render json: { error: 'Invalid email or password' }, status: :unauthorized
    end
  end

  private

  def first_login_from_new_ip?(user, ip)
    return false if user.login_events.exists? ip_address: ip

    user.login_events << LoginEvent.create(ip_address: ip)
    true
  end

  def send_security_email(user, ip)
    UserMailer.security_email(user, ip).deliver_later
  end
end
```

And we need some logic in our model:

```ruby
# app/models/user.rb
class User < ApplicationRecord
  has_secure_password

  def authenticate(password)
    return false if locked?

    if valid_password?(password)
      update(failed_login_attempts: 0)
      return true
    else
      update(failed_login_attempts: failed_login_attempts + 1)
      lock_account_for_5_minutes if failed_login_attempts >= 3
      return false
    end
  end

  def lock_account_for_5_minutes
    update(locked_until: 5.minutes.from_now)
  end

  def locked?
    locked_until.present? && Time.current < locked_until
  end

  def valid_password?(password)
    BCrypt::Password.new(password_digest).is_password?(password)
  end
end
```

## PORO

Now, what would happen if we are then asked to login for an Administrator using a different model? Do we repeat the logic? No, of course we want to respect DRY (Don't repeat yourself) so we implement a Service Object to encapsulate our logic. So, to take the previous example to a Service Object we will create a file called `authentication_service.rb` in the `app/services` folder which is where we will store our objects. And the code should look like this:

```ruby
# app/services/authentication_service.rb
class AuthenticationService
  MAX_LOGIN_ATTEMPTS = 3

  def initialize(email, password, request_ip)
    @email = params[:email]
    @password = params[:password]
    @request_ip = request_ip
  end

  def run
    user = User.find_by(email: @email)

    if user
      if user.authenticate(@password) && !account_locked?(user)
        session[:user_id] = user.id
        jwt = JwtManager.encode(user)

        send_security_email(user) if first_login_from_new_ip?(user, @request_ip)

        { success: true, data: { token: jwt } }
      else
        handle_failed_login(user)
      end
    else
      { error: 'Invalid email or password' }
    end
  end

  private

  def handle_failed_login(user)
    user.update(failed_login_attempts: user.failed_login_attempts.to_i + 1)
    user.update(locked_until: 5.minutes.from_now) if user.failed_login_attempts >= MAX_LOGIN_ATTEMPTS

    { error: 'Invalid email or password' }
  end

  def account_locked?(user)
    user.failed_login_attempts.to_i >= MAX_LOGIN_ATTEMPTS && user.locked_until.to_i > Time.now.to_i
  end

  def first_login_from_new_ip?(user, ip)
    return false if user.login_events.exists? ip_address: ip

    user.login_events << LoginEvent.create(ip_address: ip)
    true
  end

  def send_security_email(user)
    UserMailer.security_email(user, @request_ip).deliver_later
  end
end

```

And our controller:

```ruby
# app/controllers/authentication_controller.rb
class AuthenticationController < ApplicationController
  def create
    result = AuthenticationService.new(params[:email], params[:password], request.remote_ip).run

    if result.key?(:error)
      render json: result, status: :unauthorized
    else
      render json: result
    end
  end
end
```

**Benefits:** If your security policy regarding login to your platform changes, you will know where that logic is. If you have two different logins, you can create another service with a different policy. And your controller was extremely simple. It will be a pleasure to write a test for such a controller.

## Service Object calling another Service object

You can also call a service from another service. For example, suppose you have a different login for your admin user. But we want to reuse the policy of sending security email when it is a new login from another IP.

```ruby
# app/services/security_email_service.rb
class SecurityEmailService
  def initialize(user, ip)
    @user = user
    @ip = ip
  end

  def run
    if first_login_from_new_ip?
      UserMailer.security_email(@user, @ip).deliver_later
    end
  end

  private

  def first_login_from_new_ip?
    ...
  end
end

```

Then our previous authentication service would be simplified to:

```ruby
# app/services/authentication_service.rb
class AuthenticationService
  # ...

  def authenticate
    user = User.find_by(email: @email)

    if user
      if user.authenticate(@password) && !account_locked?(user)
        session[:user_id] = user.id
        jwt = JwtManager.encode(user)

        # Send the security email if it's the first login from a new IP
        SecurityEmailService.new(user, @request_ip).run

        { success: true, data: { token: jwt } }
      else
        handle_failed_login(user)
      end
    else
      { error: 'Invalid email or password' }
    end
  end

  # ...
end

```

So you can use sending security emails in another context.

# Dry.rb

Now it's the turn of Dry.rb, a collection of state-of-the-art Ruby libraries. At this point, we will be using the same example as above. You don't need to go through all the c code, as it is the same as presented above. What stands out in this section is how each of the steps to be performed is declared, how input is passed from one step to the next, and how errors are handled. and how errors are handled.

```ruby
# app/services/authentication_service_dry.rb
class AuthenticationServiceDry
  include Dry::Transaction

  step :find_user
  step :authenticate_user
  check :check_login_attempts
  step :generate_token
  step :handle_security_email

  private

  def find_user(params, request)
    user = User.find_by(email: params[:email])

    if user
      Success(user: user, params: params, request: request)
    else
      Failure('Invalid email or password')
    end
  end

  def authenticate_user(input)
    user = input[:user]
    params = input[:params]
    if user.authenticate(params[:password]) && !account_locked?(user)
      Success(input)
    else
      handle_failed_login(user)
      Failure('Invalid email or password')
    end
  end

  def generate_token(input)
    user = input[:user]
    jwt = JwtManager.encode(user)
    Success(token: jwt, request: input[:request])
  end

  def handle_security_email(input)
    user = input[:user]
    request = input[:request]

    if first_login_from_new_ip?(user, request.remote_ip)
      send_security_email(user, request.remote_ip)
    end

    Success(token: input[:token])
  end

  def account_locked?(user); ... end

  def first_login_from_new_ip?(user, ip); ... end

  def send_security_email(user, ip); ... end

  def handle_failed_login(user); ... end
end
```

And in our controller it is implemented as follows:

```ruby
# app/controllers/authentication_controller.rb
class AuthenticationController < ApplicationController
  def create
    result = AuthenticationServiceDry.new.call(params, request)

    if result.success?
      token = result.value![:token]
      # Authentication successful
      render json: { success: true, data: { token: token } }
    else
      error_message = result.failure
      # Authentication failed
      render json: { error: error_message }, status: :unauthorized
    end
  end
end

```

**We will not go into much depth about this library, as it is very complete.** However, I strongly recommend **highly** that you explore [its documentation](<<https://dry-rb.org/gems/dry-transaction/0.15/>) and discover all the possibilities it offers. Some of the **key benefits** of using this library are:

- The **initial declaration** of each action your service object should perform gives you a clear idea of what it does and where you have to intervene if you want to make a change:

```ruby
step :find_user
step :authenticate_user
check :check_login_attempts
step :generate_token
step :handle_security_email
```

- A very effective DSL\*\* that makes it easy to understand what is going on in the Service Object.
- Parameter validation\*\* on your Service Objects with [dry-validations](https://dry-rb.org/gems/dry-validation/1.10/).
- Robust **error handling** for each step of the process.
- Testing facilities\*\*, including step injection.
- The ability to **develop your own step adapters**.

If you are interested in this implementation I recommend this [video](https://www.youtube.com/watch?v=YXiqzHMmv_o)

## Interactor

**Interactor** is another way to implement the use of Service Objects with a different name. It is also a very complete solution to carry out our implementation.  
A class of **Objects** called **"Organizers "**, which are nothing more than a **Service Object** that is responsible for sequentially calling other **Interactors (Service Objects)**. Let's see some of this in action.  
Let's see some of this in action, we'll take our **"big example "** haha and separate it into **4 small Interactors** under the command of an **Organizer**:

### 1. Interactor to find a user

```ruby
# app/interactors/find_user_interactor.rb
class FindUserInteractor
  include Interactor

  def call
    user = User.find_by(email: context.params[:email])

    if user
      context.user = user
    else
      context.fail!(message: 'Invalid email or password')
    end
  end
end
```

### 2. Interactor to authenticate the user

```ruby
# app/interactors/authenticate_user_interactor.rb
class AuthenticateUserInteractor
  include Interactor

  def call
    user = context.user
    params = context.params

    if user.authenticate(params[:password]) && !account_locked?(user)
      # Autenticación exitosa
    else
      handle_failed_login(user)
      context.fail!(message: 'Invalid email or password')
    end
  end

  def account_locked?(user)
    user.failed_login_attempts.to_i >= MAX_LOGIN_ATTEMPTS && user.locked_until.to_i > Time.now.to_i
  end

  def handle_failed_login(user)
    user.update(failed_login_attempts: user.failed_login_attempts.to_i + 1)

    user.update(locked_until: 5.minutes.from_now) if user.failed_login_attempts >= MAX_LOGIN_ATTEMPTS

    { error: 'Invalid email or password' }
  end
end
```

### 3. Interactor to generate security token

```ruby
# app/interactors/generate_token_interactor.rb
class GenerateTokenInteractor
  include Interactor

  def call
    user = context.user
    jwt = JwtManager.encode(user)
    context.token = jwt
  end
end
```

### 4. Interactor to send security email

```ruby
# app/interactors/handle_security_email_interactor.rb
class HandleSecurityEmailInteractor
  include Interactor

  def call
    user = context.user
    request = context.request

    if first_login_from_new_ip?(user, request.remote_ip)
      send_security_email(user, request.remote_ip)
    end
  end

  def first_login_from_new_ip?(user, ip)
    return false if user.login_events.exists? ip_address: ip

    user.login_events << LoginEvent.create(ip_address: ip)
    true
  end

  def send_security_email(user)
    UserMailer.security_email(user, @request_ip).deliver_later
  endend
```

### The Organizer

```ruby
# app/interactors/authentication_organizer.rb
class AuthenticationOrganizer
  include Interactor::Organizer

  organize FindUserInteractor,
           AuthenticateUserInteractor,
           GenerateTokenInteractor,
           HandleSecurityEmailInteractor
end
```

### The Controller

```ruby
# app/controllers/authentication_controller.rb
class AuthenticationController < ApplicationController
  def create
    result = AuthenticationOrganizer.call(params: params, request: request)

    if result.success?
      token = result.token
      render json: { success: true, data: { token: token } }
    else
      error_message = result.message
      render json: { error: error_message }, status: :unauthorized
    end
  end
end
```

**Interactor** is a simpler option than _Dry.rb_. In this library, parameter validation in the _context_ is missing. The _context_ can vary significantly from the start to the end of the flow.  
The _context_ can vary significantly from the start to the end of the flow, but the simplicity of the implementation is appreciated. I invite you to review the [documentation](https://github.com/collectiveidea/interactor). Some  
s features to highlight:

- **Hooks**: You can execute actions before, during and after the interactor execution.
- **Rollback**: You can define a _rollback_ method in your interactor. If it is inside an organizer and one of them fails, this method is called for each interactor that was executed. Very useful in complete transactions that modify data.

---

So much for implementation demonstrations. You can explore other gems that can help you with the implementation [here](https://www.ruby-toolbox.com/categories/ServiceObjects).

---

## The last thing

Simply put, Service Objects in Ruby on Rails are an essential tool for keeping your code clean and organized as your project grows. By encapsulating business logic in specific egotiation logic into specific classes, you simplify the development process, make testing easier, and ensure that your application is easy to maintain and scalable.

However, this journey of improvement does not end here. Many of the concepts I have shared with you can be adapted to the specific needs of your application. I hope this article has  
have provided you with valuable insight and tools to optimize your development.

I am at your disposal for any additional suggestions, comments or questions. Don't hesitate to write.

