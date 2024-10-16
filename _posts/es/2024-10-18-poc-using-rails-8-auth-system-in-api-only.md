---
layout: post
title: "PoC: Usando el Generador de Autenticación de Rails 8 (Beta) En Modo API-Only."
category:
  - On Rails
excerpt: >-
  Después de buscar una herramienta definitiva para documentar las API que
  desarrollo con Rails, que fuera simple, interactiva y fácil de usar, y no
  encontrar la adecuada, decidí crear la mía propia: OasRails.
image: /assets/images/oas_rails_ui.png
author: Andrés
comments: true
---

Como ya saben, una de las funcionalidades nuevas de Rails 8 es el nuevo generador basico de autenticación que viene a demostrar que no es tan complejo desarrollar todo lo que respecta a autenticacion en una aplicacion con Rails y que muchas veces no es necesario depender de terceros (gemas). La discusión comenzo [aquí](https://github.com/rails/rails/issues/50446).

Dicho esto, veamos que pasa usando el generador en una aplicación API-Only:

```bash
 rails -v
Rails 8.0.0.beta1
```

```bash
 rails new app --api & cd app
```

Y ejecutamos el nuevo comando:

```bash
 rails g authentication
      create  app/models/session.rb
      create  app/models/user.rb
      create  app/models/current.rb
      create  app/controllers/sessions_controller.rb
      create  app/controllers/concerns/authentication.rb
      create  app/controllers/passwords_controller.rb
      create  app/mailers/passwords_mailer.rb
      create  app/views/passwords_mailer/reset.html.erb
      create  app/views/passwords_mailer/reset.text.erb
      create  test/mailers/previews/passwords_mailer_preview.rb
        gsub  app/controllers/application_controller.rb
       route  resources :passwords, param: :token
       route  resource :session
        gsub  Gemfile
      bundle  install --quiet
    generate  migration CreateUsers email_address:string!:uniq password_digest:string! --force
       rails  generate migration CreateUsers email_address:string!:uniq password_digest:string! --force
      invoke  active_record
      create    db/migrate/20241016002139_create_users.rb
    generate  migration CreateSessions user:references ip_address:string user_agent:string --force
       rails  generate migration CreateSessions user:references ip_address:string user_agent:string --force
      invoke  active_record
      create    db/migrate/20241016002140_create_sessions.rb
```

Ok, ahora por ejemplo si revisamos `SessionsController` veremos que el metodo de 'Login' se ve de la siguiente forma:

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

Osea redirecciona a rutas y/o vistas que en nuestra API no existen ni hacen sentido, y ademas si inspeccionamos el metodo `start_new_session_for` nos daremos cuenta que el sistema esta basado 100% en autenticacion mediante cookies. Entonces, ¿que hacemos?.

Mi propuesta es la siguiente: el generador crea las bases para la autenticación y creo que funciona bastante bien, por lo que con unas pequeñas modificaciones podemos dejar funcionando una autenticacion Bearer (Token Authentication) rapidamente en nuestra API con Rails 8 y las bases ya generadas.

El primer paso sera agregar persistencia para nuestro token, para esto modificaremos la migracion que crea las sessiones y agregaremos un nuevo campo llamado `token`:

```ruby
    create_table :sessions do |t|
      t.references :user, null: false, foreign_key: true
      t.string :ip_address
      t.string :user_agent
      t.string :token     # HERE

      t.timestamps
    end
```

Ahora simplemente ejecuta `rails db:migrate` y create un usuario de prueba por consola, yo lo hare con esta linea `User.create(email_address: "user@test.com", password: "123456789")` (Lo utilizaremos mas tarde). Luego debemos crear un nuevo token para cada session nueva de un usuario, para esto lo mas simple es usar un callback en el modelo `Session`:

```ruby
class Session < ApplicationRecord
  belongs_to :user
  before_create :generate_token # Here call

  private
  def generate_token # Here implement, generate the token as you wish.
    self.token = Digest::SHA1.hexdigest([ Time.now, rand ].join)
  end
end
```

Ahora volviendo al metodo `start_new_session_for` en el concern `Authentication`, no es necesario que creemos una cookie, asi que debemos remover esa linea:

```ruby
def start_new_session_for(user)
  user.sessions.create!(user_agent: request.user_agent, ip_address: request.remote_ip).tap do |session|
    Current.session = session
  end
end
```

Y modificaremos el `create` para que las respuestas sean en formato json y no redirecciones:

```ruby
def create
  if user = User.authenticate_by(params.permit(:email_address, :password))
    start_new_session_for user
    render json: { data: { token: Current.session.token  } }
  else
    render json: {}, status: :unauthorized
  end
end
```

**Para hacer que todo esto funcione debemos hacer dos cosas:**

1. Incluir el modulo `Authentication` en `ApplicationController`:

   ```ruby
   class ApplicationController < ActionController::API
     include Authentication
   end
   ```

2. Eliminar la linea numero 6 de este mismo concern:

   ```ruby
     included do
       before_action :require_authentication
       helper_method :authenticated? # This, we don't use helpers in APIs
     end
   ```

Hasta este punto ya deberiamos tener el **login funcionando**. Para probar esto voy a agregar [OasRails](https://github.com/a-chacon/oas_rails), que a proposito **ya esta funcionando con Rails 8** y voy a enviar un par de peticiones a ver como se comporta, no explicare como implementar OasRails, para eso puedes ver el repositorio o leer mas en [este post](/on rails/2024/07/25/documenting-rails-apis).

Login exitoso:

![](/assets/images/rails8_success_login.png)

Login fallido:

![](/assets/images/rails8_fail_login.png)

---

Ya podemos generar tokens, ahora modificaremos el codigo para autenticarnos con ese mismo token. Para eso, cambiaremos la logica de buscar la sessiona actual del usuario en base a la cookie a buscarla en base al header `Authorization`:

```ruby
    def resume_session
      Current.session = find_session_by_token
    end

    def find_session_by_cookie
      Session.find_by(token: request.headers[:authorization]&.split(" ")[-1])
    end
```

Para probar esto creo que tendremos que hacer rapidamente un modelo que dependa de `user` y que requira autenticacion para utilizar. Intentemos con `rails g scaffold project title:string description:text user:references` y le agregamos al principio del controlador la linea `before_action :require_authentication`.

Aqui les dejo una pequeña prueba autenticado con el token que obtuve en las pruebas anteriores:

![](/assets/images/rails8_projects.png)
