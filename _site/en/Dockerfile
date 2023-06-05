# Use Ruby 3.1.2 as the base image
FROM ruby:3.1.2

# Install Jekyll 4.2.2
RUN gem install jekyll -v '4.2.2'

# Set the working directory to /srv/jekyll
WORKDIR /srv/jekyll

# Copy the contents of the current directory to /srv/jekyll
COPY . .

# Install the project's dependencies
RUN bundle install

# Expose port 4000
EXPOSE 4000

# Set production environment
ENV JEKYLL_ENV production

# Start the Jekyll server
CMD ["bundle", "exec", "jekyll", "serve", "--host", "0.0.0.0"]
