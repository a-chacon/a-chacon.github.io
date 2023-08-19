---
layout: post
title: "Creating a chat with GPT and Rails."
categories: [Rails, ChatGPT, Chat]
excerpt: We will see how to create a custom chat with persistence with Ruby On Rails and ChatGPT. After interacting in a couple of applications with the OpenAi API I want to show how you could make a simple chat that could scale to whatever you want using Ruby On Rails.
image: /assets/images/chatpt.webp
lang: en
time: 5 min
author: Andrés
comments: true
---

![Demo](/assets/images/minichat1.gif)

In today's digital age, interaction with users is essential to provide richer and more personalized online experiences. ChatGPT, developed by OpenAI, emerges as an innovative solution for creating automated conversations based on natural language. ChatGPT uses the power of deep learning to generate contextual and consistent responses that simulate a human conversation. This advanced technology allows developers to incorporate ChatGPT's artificial intelligence into various applications, providing seamless and engaging interaction with users.

When it comes to streamlining the web application development process, Ruby on Rails, commonly known as Rails, emerges as a reliable and efficient framework. Rails is an open source framework that is based on the Ruby programming language. Offering a well-defined structure and robust conventions, Rails simplifies the creation and maintenance of web applications by providing a variety of pre-built tools and libraries. The modularity and efficiency-oriented nature of Rails make it the preferred choice for many developers when building robust and scalable web applications.

**Incomplete translation**

## Creando nuestra aplicación Rails.

La aplicación será una muestra simple de lo que se puede hacer integrandose con ChatGPT. El modelo sera algo basico donde guardaremos un Token o Api key de OpenAI que tendra conversaciones y estas a su ves tendran mensajes.

Crear la aplicacion Ruby On Rails, en mi caso use el nombre de `minichat`, tu puedes ocupar el que quieras:

```bash
rails new minichat --css tailwind
```

Para interactuar con la API de OpenAI usaremos la gema `ruby-openai`. Asi que la agregamos a nuestro Gemfile:

```ruby
gem "ruby-openai"
```

Y luego ejecutamos `bundle install`.

### Modelos

Como comente en un principio nuestra aplicación se basara en 3 simples modelos. El modelo `token`, que almacenara un api token de OpenAI y que será usado como autenticación tanto en la app como para interactuar con la API de OpenAI.
Luego tendremos el modelo `Conversation` que guardara las configuraciones de cada conversación. Y Por ultimo nuestro modelo `M̀essage` que representará un mensaje, ya sea de sistema, de usuario o de asistente.

Creamos nuestros modelos con las siguientes instrucciones:

```bash
rails g model token token:string 
rails g model conversation temperature:float init_system_message:text model:string token:belongs_to
rails g model message content:text role:integer conversation:belongs_to
```
Ejecutamos las migraciones con el comando `rails db:migrate`.

Y completamos el codigo de nuestros modelos. Deberian lucir de la siguiente manera:

```ruby
# app/models/token.rb

class Token < ApplicationRecord
  has_many :conversations
  validates :token, presence: true
end

```

```ruby
# app/models/conversation.rb

class Conversation < ApplicationRecord
  belongs_to :token
  has_many :messages

  after_create :create_system_message

  private

  def create_system_message
    return if init_system_message.empty?

    messages.create(role: 'system', content: init_system_message)
  end
end
```

```ruby
# app/models/message.rb

class Message < ApplicationRecord
  belongs_to :conversation
  enum :role, %i[system user assistant], default: :user

  after_create_commit lambda {
                        broadcast_append_to 'messages', partial: 'messages/message', locals: { message: self },
                                                        target: 'messages'
                      }
  after_create :generate_ai_response

  private

  def generate_ai_response
    return if role != 'user'

    response = chat(messages: conversation.messages.map { |m| { role: m.role, content: m.content } })
    conversation.messages << Message.create(role: 'assistant', content: response)
  end

  def chat(model: 'gpt-3.5-turbo', messages: [])
    client = OpenAI::Client.new(access_token: conversation.token.token)

    response = client.chat(
      parameters: {
        model:, # Required.
        messages:, # Required.
        temperature: conversation.temperature
      }
    )

    response.dig('choices', 0, 'message', 'content')
  end
end
```

Este ultimo es donde ocurre la interacción con ChatGPT y que explicare de forma mas detallada.

#### Modelo Message y ChatGPT

El modelo message realiza dos acciones importantes:

1. Transmitir una vista parcial de sí mismo a cualquier conversación activa en la que deba aparecer. Esto se hace con el fin de no tener que recargar el chat cada vez que hay un mensaje nuevo
```ruby
  after_create_commit lambda {
                        broadcast_append_to 'messages', partial: 'messages/message', locals: { message: self },
                                                        target: 'messages'
                      }
```

2. Si el último mensaje creado fue por el usuario, entonces ChatGPT debe generar una respuesta que no es nada más que un nuevo mensaje teniendo en cuenta el detalle de que ChatGPT **no tiene memoria**. Por lo que cada vez que necesitamos generar una respuesta nueva debemos enviar toda la conversación:
```ruby
...
after_create :generate_ai_response
...
# Aqui obtenemos la conversacion completa y la enviamos como array en messages.
response = chat(messages: conversation.messages.map { |m| { role: m.role, content: m.content } })
...
```


## Controladores

Necesitaremos un par de acciones sobre nuestros modelos, así que crearemos 3 controladores con sus correspondientes vistas:

```bash
rails g controller tokens new create
rails g controller conversations new create index show
rails g controller messages create index
```

Partiremos con nuestro método de autorización. Si no tenemos API Key entonces no continuamos, para eso definimos una función que esté disponible para todos nuestros controladores:

```ruby
# app/controller/application_controller.rb

class ApplicationController < ActionController::Base
  def authorize!
    if session[:token]
      @token = Token.find_by(token: session[:token])
    else
      redirect_to root_url
    end
  end
end
```

Luego nuestros otros controladores deberían verse de la siguiente manera:

```ruby
# app/controllers/tokens_controller.rb 

class TokensController < ApplicationController
  def new
    @token = Token.new
  end

  def create
    @token = Token.find_or_create_by(token: params['token']['token'])
    session[:token] = @token.token

    redirect_to conversations_url
  end
end
```

```ruby
# app/controller/conversations_controller.rb

class ConversationsController < ApplicationController
  before_action :authorize!

  def new
    @conversation = Conversation.new
  end

  def create
    @conversation = Conversation.new(conversation_params)
    @conversation.token = @token

    if @conversation.save!
      redirect_to conversation_url(@conversation)
    end
  end

  def index
    @conversations = @token.conversations
  end

  def show
    @conversation = Conversation.find(params[:id])
  end

  private

  def conversation_params
    params.fetch(:conversation, {}).permit(:temperature, :init_system_message)
  end
end
```

```ruby
# app/controller/messages_controller.rb

class MessagesController < ApplicationController
  def create
    @conversation = Conversation.find(params[:conversation_id])
    @message = @conversation.messages.create(message_params)
  end

  private

  def message_params
    params.require(:message).permit(:content)
  end
end
```

## Vistas

Por último dejaré el código de las vistas:

### Tokens

```erb
# app/views/tokens/new.html.erb
<div>
  <h1 class="font-bold text-4xl">OpenAI api key:</h1>
  <div class="p-2">
  <%= form_with model: @token do |form| %>
    <%= form.text_field :token %>
    <%= form.submit "Ingresar", class: "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" %>
  <% end %>
  </div>
</div>
```

### Conversations

```erb
# app/views/conversations/index.html.erb

<div>
  <div class="flex">
    <h1 class="font-bold text-4xl pr-2">Conversations</h1>
    <a href="<%= new_conversation_path %>" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Nueva</a>
  </div>
  <ul class="list-disc p-4">
    <% @conversations.each do |c| %>
      <li class="pb-2"><a href="<%= conversation_url(c) %>"><%= c.id %> - <%= c.init_system_message[0..40]%>...</a></li>
    <% end %>
    <% if @conversations.empty? %>
      <span class="text-xl my-4">No conversations yet</span>
    <% end %>
  </ul>
</div>

```

```erb
# app/views/conversations/new.html.erb 

<div>
  <h1 class="font-bold text-4xl">New Conversation</h1>
  <%= form_with model: @conversation, class: "grid grid-cols-2 gap-4" do |form| %>
    <%= form.label :temperature, "Model temperature:" %>
    <%= form.number_field :temperature, in: (0.0)..(1.0), step: 0.1 %>

    <%= form.label :init_system_message, "Initial message:" %>
    <%= form.text_area :init_system_message %>
    <%= form.submit "Crear", class: "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" %>
  <% end %>
</div>

```

```erb
# app/views/conversations/show.html.erb 

<div>
  <h1 class="font-bold text-4xl"><a href="<%= conversations_path %>" class="text-blue-600 hover:text-blue-300" >Conversations</a> # <%= @conversation.id %></h1>

  <div>
    <div id="chat-messages" class="w-6/12">
      <%= turbo_stream_from "messages" %>
      <%= turbo_frame_tag "messages" do %>
        <%= render @conversation.messages %>
      <% end %>
    </div>

    <%= form_with(model: [@conversation, Message.new], remote: true) do |form| %>
      <%= form.text_field :content, class: "w-96 rounded-lg" %>
      <%= form.submit "Enviar", class: "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" %>
    <% end %>
  </div>
</div>
```

### Messages

Lo único especial de esta vista será que diferenciará mensajes por rol con distintos colores.

```erb
# app/views/messages/_message.html.erb

<div class="my-1">
  <% if message.role == "user" %>
    <div class="bg-blue-500 rounded-lg">
  <% elsif message.role == "assistant" %>
    <div class="bg-emerald-500 rounded-lg">
  <% elsif message.role == "system" %>
    <div class="bg-neutral-700 rounded-lg">
  <% end %>
      <p class="p-2 text-white"><%= message.content %></p>
    </div>
</div>
```
## Rutas

Configuraremos nuestro archivo `routes.rb` de la siguiente forma:

```ruby
Rails.application.routes.draw do
  root 'tokens#new'

  resources :tokens, only: [:create]
  resources :conversations, only: [:new, :create, :index, :show]
  resources :messages, only: [:create, :index]
end

```

## Y probamos nuestra aplicación.

Levantamos nuestro servidor con `bin/dev` para que funcione tailwindcss y deberíamos poder realizar un flujo como el siguiente:

![Demo](/assets/images/minichat1.gif)


## Conclusión.

Luego de haber realizado un par de aplicaciones de esta forma puedo comentar que solo hay dos puntos en lo que hay que fijarse y que podrían ser nuevos para alguien que ya ha realizado desarrollos con integraciones:

1. Tener presente que ChatGPT no tiene memoria, por lo que cada vez que queramos continuar con la conversación debemos enviarla completamente. O sea, la responsabilidad de la persistencia corre por nuestra cuenta.

2. Los mensajes de sistema nos sirven para cargar información e instrucciones a ChatGPT.
