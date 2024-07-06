---
layout: post
title: 'ActiveStorage: Avoiding the problem of N+1 queries'
categories:
  - On Rails
excerpt: >-
  The N+1 problem is common in database-oriented programming and occurs when an
  additional query is required for each relationship between objects, generating
  an excess of queries. This problem also affects Active Storage, which creates
  records in the database through polymorphic relationships.
image: /assets/images/n+1.avif
lang: en
time: 3 min
author: Andrés
comments: true
redirect_from:
  - /rails/activestorage/2023/10/18/prevent-n1-active-storage.html
---
Suppose we have a model called Solution, where each solution must have an attached icon in the form of an image. Something like this:

```ruby
class Solution < ApplicationRecord
    has_one_attached :icon
end
```

The definition of the model is simple and we should have no problems querying it. Whether with `Solution.first`, `Solution.limit(10)` or another query related to our model, it should normally generate only one request to the database. However, the complication arises when trying to generate a URL for each of the icons associated with our model. At this point, ActiveStorage requires querying the additional tables `active_storage_attachments` and `active_storage_blobs`. If this data has not been previously loaded, this is when the N+1 problem occurs.

To display the problem we will use the following code:

```ruby
icon_urls = Solution.all.map{|s| s.icon.url }
```

---

# Solutions

The solution will always be to preload the data. But how?

## Includes

ActiveRecord's answer to this common performance problem is the [includes](https://apidock.com/rails/ActiveRecord/QueryMethods/includes) method:

```ruby
icon_urls = Solution.all.includes(icon_attachment: :blob).map{|s| s.icon.url }
```

And that's it, `includes` defines whether to load the data via [preload](https://apidock.com/rails/ActiveRecord/Associations/Preloader/preload) (separate queries) or [eager_load](https://api.rubyonrails.org/classes/ActiveRecord/QueryMethods.html#method-i-eager_load) (all in one query).

## ActiveStorage scopes

Now, ActiveStorage is aware of this problem and that's why they also offer a solution on their side: A scope to make your life with Rails even easier.

Every time we use `has_one_attached` in our model we get [this scope](https://github.com/rails/rails/blob/23938052acd773fa24068debe56cd892cbf8d868/activestorage/lib/active_storage/attached/model.rb#L117C22-L117C22) added with the name `with_attached_#{attachment_name}`. For better understanding, in our case it would look like this:

```ruby
icon_urls = Solution.all.with_attached_icon.map{|s| s.icon.url }
```

This performs the same action as includes, but our query is simpler to read.

---

**These same methods are also available for when variants and/or `has_many_attachments` are used.**

_Enjoy programming_

