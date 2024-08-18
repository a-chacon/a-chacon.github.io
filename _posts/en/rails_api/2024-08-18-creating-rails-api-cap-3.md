---
layout: post
title: >-
  Creating a REST API with Ruby on Rails. Chapter 3: Authentication and Authorization.
categories:
  - On Rails
excerpt: >-
  Learn how to secure your Ruby on Rails API with Devise for authentication and Pundit for authorization. We’ll cover the essentials to get your endpoints protected and accessible only to authorized users.
image: /assets/images/apirestcap3.webp
comments: true
---

Adding **authentication** and **authorization** to your **APIs** is a crucial part of developing your applications. These two strategies play a significant role in ensuring **security** and proper access to the data and services you will offer.

To begin, I think it's important to understand the difference between authentication and authorization in a REST API. The former refers to the process of verifying the **identity** of a user or service, while the latter corresponds to determining whether that authenticated user or service has the **permissions** to access the resource or perform the action they are attempting.

---

Where are we?

- [**Chapter 1**: Initial Setup and Models](/on rails/2024/06/16/creating-rails-api-cap-1.html)
- [**Chapter 2**: CRUD and Data Serialization](/on rails/2024/06/23/creating-rails-api-cap-2.html)
- **Chapter 3**: User Authentication and Authorization <-------- You Are Here!
- **Chapter 4**: Error Handling and Best Practices

---

### Authentication

When it comes to implementing authentication, there are common strategies, and there's no need to reinvent the wheel. To classify them, we can refer to the options defined by **OpenAPI Initiative**:

- HTTP authentication schemes (using the `Authorization` header):
  - [**Basic**](https://swagger.io/docs/specification/authentication/basic-authentication/): Basic authentication where credentials are sent encoded in base64 in the `Authorization` header.
  - [**Bearer**](https://swagger.io/docs/specification/authentication/bearer-authentication/): Bearer token authentication, commonly used with OAuth 2.0, where tokens are sent in the `Authorization` header.
  - Other HTTP schemes defined by [RFC 7235](https://tools.ietf.org/html/rfc7235) and the [HTTP Authentication Schemes Registry](https://www.iana.org/assignments/http-authschemes/http-authschemes.xhtml).
- [**API Keys**](https://swagger.io/docs/specification/authentication/api-keys/) in headers, query string, or cookies:
  - [Cookie-based authentication](https://swagger.io/docs/specification/authentication/cookie-authentication/): Authentication using cookies to store session identifiers.
- [**OAuth 2**](https://swagger.io/docs/specification/authentication/cookie-authentication/): Authentication framework that allows third-party applications to access user data without sharing passwords.
- [**OpenID Connect Discovery**](https://swagger.io/docs/specification/authentication/openid-connect-discovery/): Discovery service for OpenID Connect, facilitating OAuth-based authentication.

### Authorization

Similarly, we won't reinvent the wheel with authorization either, so here are some of the most common strategies:

- **Role-Based Access Control (RBAC):** Authorization based on predefined roles (e.g., admin, editor).
- **Attribute-Based Access Control (ABAC):** Control based on user attributes, resources, and context.
- **Policy-Based Access Control (PBAC):** Using policies to define permissions for actions and resources.
- **Access Control Lists (ACLs):** Specific permissions defined for users on individual resources.
- **OAuth 2.0 (with scopes):** Limited access authorization for third-party applications on APIs.

## Our REST API

Now that we better understand the concepts, we can move on to practice. In our case, we will use [devise-api](https://github.com/nejdetkadir/devise-api) for authentication (Bearer Token) and [Pundit](https://github.com/varvet/pundit) for authorization (PBAC). We have already added these gems to our project in the previous chapters. But if you haven't done so, add the following to your Gemfile:

```ruby
gem 'devise'
gem 'devise-api'

gem 'pundit'
```

## Implementing Authentication

Since authentication relies on **Devise**, the first step is to follow the installation steps for this gem:

```bash
rails generate devise:install
rails generate devise User
```

Then run the **devise_api's** generator:

```bash
rails generate devise_api:install
```

Run the migrations:

```bash
rails db:migrate
```

And finally, we add the `api` module to the model that includes **Devise**, which is the `User` class. For this case, we can remove all other modules and keep only the following:

```ruby
class User < ApplicationRecord
  devise :database_authenticatable, :api

  has_many :roles
  has_many :projects, through: :roles
end
```

To expose the **endpoints** of `devise-api`, we need to use the original `devise_for` method from **Devise** in the `routes.rb` file:

```ruby
Rails.application.routes.draw do
  devise_for :users
  # ...
end
```

```bash
revoke_user_tokens  POST  /users/tokens/revoke(.:format)  devise/api/tokens#revoke
refresh_user_tokens POST  /users/tokens/refresh(.:format) devise/api/tokens#refresh
sign_up_user_tokens POST  /users/tokens/sign_up(.:format) devise/api/tokens#sign_up
sign_in_user_tokens POST  /users/tokens/sign_in(.:format) devise/api/tokens#sign_in
info_user_tokens    GET   /users/tokens/info(.:format)    devise/api/tokens#info
```

Now you can use the following **helpers** in the controllers to protect the endpoints with authentication. In our example, we want to cover the entire API, so we can add them to the `ApplicationController` so that other controllers inherit them. Additionally, I will add a method that might be useful:

```ruby
class ApplicationController < ActionController::API
  skip_before_action :verify_authenticity_token, raise: false
  before_action :authenticate_devise_api_token!

  def current_user
    current_devise_api_user
  end
end
```

#### Tests

At this point, almost all **tests** should be failing. We will need to add authentication to them. To make this task easier, I suggest adding the following **factory**:

```ruby
# test/factories/devise_api_token.rb
FactoryBot.define do
  factory :devise_api_token, class: "Devise::Api::Token" do
    association :resource_owner, factory: :user
    access_token { SecureRandom.hex(32) }
    refresh_token { SecureRandom.hex(32) }
    expires_in { 1.hour.to_i }

    trait :access_token_expired do
      created_at { 2.hours.ago }
    end

    trait :refresh_token_expired do
      created_at { 2.months.ago }
    end

    trait :revoked do
      revoked_at { 5.minutes.ago }
    end
  end
end
```

Then you should create **tokens** and send it into the **HTTP** headers:

```ruby

class ProjectsControllerTest < ActionDispatch::IntegrationTest
  setup do
    # ...
    @token = FactoryBot.create(:devise_api_token).access_token
  end

  test 'should get index' do
    get projects_url, headers: { Authorization: "Bearer #{@token}" }, as: :json
    assert_response :success
  end

  # ...
end
```

### Implementing Authorization

The problem mentioned in Chapter 1 had several conditions, all valid. However, to simplify the task and for demonstration purposes, we will only cover the authorization for **Tasks**. Only `Users` with the **admin** role in the project will be able to create them (create); others will not.

Before proceeding, we need to ensure that we have followed the installation steps for **Pundit**. These are:

- Add the module to the `ApplicationController`:

```ruby
  class ApplicationController < ActionController::Base
    include Pundit::Authorization
    #... También deberías manejar los errores de Unauthorized:
    rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized
    #...
    private
    def user_not_authorized(exception)
      policy_name = exception.policy.class.to_s.underscore
      render json: { message: "#{policy_name}.#{exception.query}" }, status: :forbidden
    end
  end
```

- Create an ApplicationPolicy, it will the base for others policies:

  ```bash
  rails g pundit:install
  ```

And we are ready. Let's make a failing test:

```ruby
 #test/controllers/task_controllers_test.rb

  # ...
  test 'should create task' do
    token = FactoryBot.create(:devise_api_token)

    FactoryBot.create(:role, user: token.resource_owner, role: :manager, project: @project)

    assert_difference('Task.count') do
      post project_tasks_url(@project), headers: { Authorization: "Bearer #{token.access_token}" },
                                        params: { task: { description: @task.description, project_id: @task.project_id, status: @task.status, title: @task.title } }, as: :json
    end

    assert_response :created
  end

  test 'should not create task' do
    token = FactoryBot.create(:devise_api_token)

    FactoryBot.create(:role, user: token.resource_owner, role: :contributor, project: @project)

    assert_no_difference('Task.count') do
      post project_tasks_url(@project), headers: { Authorization: "Bearer #{token.access_token}" },
                                        params: { task: { description: @task.description, project_id: @task.project_id, status: @task.status, title: @task.title } }, as: :json
    end

    assert_response :forbidden
  end

  # ...
```

Now let's make it work. Pundit operates with _Policy_ files; we need to create one following the gem's instructions, inheriting from our `ApplicationPolicy`, and implementing our validation logic (you can also use the generator):

```ruby
# app/policies/post_policy.rb
class TaskPolicy < ApplicationPolicy
  def create?
    user.roles.exists?(project: record.project, role: :manager)
  end
end
```

Add the authorization method to the controller's method:

```ruby
# app/controllers/tasks_controller.rb
  # ...
  # POST /tasks
  def create
    # ...
    authorize @task
    # ...
  end
  # ...
```

We should achieve a nice green color in all our tests.

---

As we can see, **applying authorization and authentication to our API is easy** with _Devise_ and _Pundit_. I recommend checking out the official documentation to understand more about what you can accomplish with these two gems and a bit of ingenuity.

We have seen a brief introduction to authentication using a _Bearer token_ and authorization based on policies and roles when developing APIs. Ruby on Rails is a spectacular framework, and I hope you’ve gained something valuable from this post.

Happy coding!

The repo with all the code: <https://github.com/a-chacon/api-project-management-example>
