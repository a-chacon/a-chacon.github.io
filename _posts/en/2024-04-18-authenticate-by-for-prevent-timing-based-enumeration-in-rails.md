---
layout: post
title: 'authenticate_by: Prevent timing-based enumeration of users.'
categories:
  - On Rails
excerpt: >-
  With the introduction of authenticate_by in Rails 7.1, we can now prevent
  enumeration attacks based on response times.
image: /assets/images/rails-authenticate-by.png
lang: en
time: 5 min
author: Andrés
comments: true
---
Let's say we have a simple endpoint in our Rails application for our users to enter the platform:

```ruby
 def create
    user = User.find_by(email: params[:email].downcase)
    if user && user.authenticate(params[:password])
      log_in user
      redirect_to user
    else
      flash.now[:danger] = 'Combinación de email/password incorrecta'
      render 'new'
    end
  end
```

The above code looks good, is functional, and you have probably followed a very similar logic for the logins you have programmed so far. But it has a security problem: the conditional `if` will not take the same response time if the user does not exist or if the user exists, but the password is not correct.

## Time-based enumeration attacks

An enumeration attack based on response times is what I showed above. An attacker will be able to test emails by brute force and will be able to tell when an email exists or not in our database by analyzing the response times of our web application or rather of the http request.

A very simple example using the above code would give us response times like this:

![Response times without authenticate_by](/assets/images/response-time-simple-test.png)

In blue would be the failed login attempts with users and passwords that are not correct. In red would be the attempts where the user does exist, but we do not know the password. As we can see, the differences in response times are remarkable.

If we were in the position of an attacker and we tried 1000 emails, where most of the responses are between 20 and 30 ms, but only one gives us 200 ms of response, then we would know that we found something there.

## authenticate_by

In Rails 7.1 a new method called `authenticate_by` was [introduced](https://github.com/rails/rails/pull/43765) in order to prevent this type of attack vector in our Rails applications by responding with a similar time if the user exists or not in our database.

Before `authenticate_by`:

```ruby
User.find_by(email: ".....")&.authenticate("...")
```

After `authenticate_by`:

```ruby
User.authenticate_by(email: "....", password: "...")
```

Now, if we take this back to our previous example, then our code might look like this:

```ruby
  def create
    if user = User.authenticate_by(email: params[:email], password: params[:password])
      log_in user
      redirect_to '/home'
    else
      flash[:notice] = 'Combinación de email/password incorrecta'
      p 'HERE'
      redirect_to root_path
    end
  end
```

Performing the same tests from the browser we have these samples in terms of response times:

![Response times implementing authenticate_by](/assets/images/response-time-simple-test-with-authenticate-by.png).

And as we can see, both requests with emails that exist and those that do not exist in our database respond with similar times (215..245 ms) making it impossible to enumerate accounts by response time.

This is in a best case scenario, this method does not handle all the business logic and may in [certain cases](https://github.com/rails/rails/pull/43997#issuecomment-1001064483) such as if you want to control failed login attempts on an account you add code that produces a noticeable time difference and again an enumeration attack based on response times may occur.

## And, how does authenticate_by work?

For the curious, `authenticate_by` has a not very complex [definition](https://github.com/jonathanhefner/rails/blob/9becc41df989bfccff091852d45925d41f0a13d8/activerecord/lib/active_record/secure_password.rb), where the key lies in the `if` on line 45:

```ruby
if record = find_by(attributes.except(*passwords.keys))
  record if passwords.count { |name, value| record.public_send(:"authenticate_#{name}", value) } == passwords.size
else
  self.new(passwords)
  nil
end
```

What it does here is very similar to what was done before with `Customer.find_by(email: "....")&.authenticate("...")`, but in the case that the user is not found, that is in the `else` block, it calls the `new` method to generate a new instance of the class passing as parameters the passwords that are being used in the login attempt. This forces that **even though no record was found the passwords must still be encrypted**, which results in a similar response time as if the record was found and the passwords had to be encrypted to compare the hashes.

## Conclusions

To conclude, it is important to note that, as [PR author](https://github.com/rails/rails/pull/43997#issue-1088633524) mentions, authenticate_by does not guarantee that the authentication time is always constant, especially if the username column is not backed by an index. Regardless, this addition represents a great advancement for our applications by avoiding the possibility of time-based enumeration attacks. Ultimately, it provides us with an additional layer of security in a critical aspect of our web applications.

_Happy Coding!_

