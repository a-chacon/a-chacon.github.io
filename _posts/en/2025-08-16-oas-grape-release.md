---
layout: post
title: "OasGrape: An Alternative for Generating Your API Documentation"
category:
  - Just Ruby
excerpt: "Grape also deserves the benefits of OasCore: OAS 3.1 and an integrated user interface."
image: https://a-chacon.com/oas_rails/assets/rails_theme.png
author: Andrés
comments: true
---

Once again with Open API Specification, but this time for Grape.

Grape is a powerful and specific framework for creating APIs in Ruby. A couple of years ago, we used it on top of Rails to create the API for a web application, and at that time, we realized that the only alternative for generating interactive documentation was the `grape-swagger` gem, which, until now, only generates OAS 2.0. This is a problem for many, as it also doesn't offer a user interface (UI), so you have to take care of that as well. Too much configuration for something that should be simple and powerful.

Over the years, with [OasCore](https://github.com/a-chacon/oas_core) already working for [Rails](https://github.com/a-chacon/oas_rails), [Hanami](https://github.com/a-chacon/oas_hanami), and [Rage](https://github.com/a-chacon/oas_rage), why not make it work for Grape? So, I set out to find a way to integrate it into Grape and arrived at a solution that is technically a bit different from the previous ones but functional.

### Getting the Available Endpoints

The first step was to get a list of the available endpoints in the application. For this, I looked at the code of [grape-rails-routes](https://github.com/pmq20/grape-rails-routes), which, although somewhat old, still works. I ended up with code like this:

```ruby
def extract_grape_routes
  grape_klasses = ObjectSpace.each_object(Class).select { |klass| klass < Grape::API }
  routes = grape_klasses.flat_map(&:routes).uniq { |r| r.path + r.request_method.to_s }

  routes = routes.map { |route| OasRouteBuilder.build_from_grape_route(route) }
  filter_routes(routes)
end
```

With this, I already had all the routes from the classes that inherit from Grape and contain all the endpoints. However, there was another problem: the endpoints are not defined as instance methods but as `Procs`, so accessing the comments to parse them as documentation was going to be almost impossible (though I tried at first).

### Solution: Use Grape's `desc` and `detail`

For this, I didn't find a better and simpler solution than using what Grape already offers: the `desc` block and the `detail` tag. Inside `detail`, I included all the OasCore tags to generate the documentation. Thus, a documented endpoint would look like this:

```ruby
desc "Returns a list of Users." do
  detail <<~OAS_GRAPE
    # @summary Returns a list of Users.
    # @parameter offset(query) [Integer] Used for pagination of response data. default: (0) minimum: (0)
    # @parameter limit(query) [Integer] Maximum number of items per page. default: (25) minimum: (1) maximum: (100)
    # @parameter status(query) [Array<String>] Filter by status. enum: (active,inactive,deleted)
    # @parameter X-front(header) [String] Header for identifying the front. minLength: (1) maxLength: (50)
    # @response Success response(200) [Array<Hash{ id: Integer}>]
    # @response_example Success(200)
    #   [ JSON
    #     [
    #       { "id": 1, "name": "John", "email": "john@example.com" },
    #       { "id": 2, "name": "Jane", "email": "jane@example.com" }
    #     ]
    #   ]
  OAS_GRAPE
end
get do
  { users: @@users }
end
```

The truth is, the solution didn't fully convince me, but it was the simplest implementation of OasCore I could find for Grape, offering an option to generate OAS 3.1 with an included UI for APIs created with Grape.

### Documentation and Repository

To see the complete documentation on how to install and use it, you can visit:  
🔗 [OasGrape Documentation](https://a-chacon.com/oas_core/oas_grape/index.html)  
🔗 [GitHub Repository](https://github.com/a-chacon/oas_grape)
