---
layout: post
title: "PoC: Usando el Generador de Autenticación de Rails 8 (Beta) En Modo API-Only."
category:
  - On Rails
image: /assets/images/rails8-poc-api-auth.webp
excerpt: "Haciendo funcionar el generador de autenticación de Rails 8 (Beta) en una aplicación creada en modo API-Only."
author: Andrés
comments: true
---

Como ya saben, una de las funcionalidades nuevas de Rails 8 es el **nuevo generador básico de autenticación** que viene a demostrar que no es tan complejo desarrollar todo lo que respecta a autenticación en una aplicación con Rails y que muchas veces no es necesario depender de terceros (gemas). La discusión comenzó [aquí](https://github.com/rails/rails/issues/50446).

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

Ok, ahora por ejemplo, si revisamos `SessionsController` veremos que el método de `Login` se ve de la siguiente forma:

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

O sea, redirecciona a rutas y/o vistas que en nuestra API no existen ni hacen sentido, y además si inspeccionamos el metodo `start_new_session_for` nos daremos cuenta de que el sistema está basado 100% en **autenticación mediante cookies**. Entonces, ¿qué hacemos?

Mi propuesta es la siguiente: el generador crea las bases para la autenticación y creo que funciona bastante bien, por lo que con unas pequeñas modificaciones podemos dejar funcionando una **autenticación Bearer** (Token Authentication) rápidamente en nuestra API con Rails 8 más los archivos ya generados.

El primer paso será agregar **persistencia para nuestro token**, para esto modificaremos la migración que crea las sessiones y agregaremos un nuevo campo llamado `token`:

```ruby
    create_table :sessions do |t|
      t.references :user, null: false, foreign_key: true
      t.string :ip_address
      t.string :user_agent
      t.string :token     # HERE

      t.timestamps
    end
```

Ahora simplemente ejecuta `rails db:migrate` y create un usuario de prueba por consola, yo lo haré con esta línea `User.create(email_address: "user@test.com", password: "123456789")` (Lo utilizaremos más tarde). Luego debemos crear un nuevo token para cada sesión nueva de un usuario, para esto lo más simple es usar un callback en el modelo `Session`:

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

Ahora volviendo al metodo `start_new_session_for` en el concern `Authentication`, no es necesario que creemos una cookie, asi que debemos remover esa linea y dejar el metodo de la siguiente forma:

```ruby
# app/controllers/concerns/authentication.rb
def start_new_session_for(user)
  user.sessions.create!(user_agent: request.user_agent, ip_address: request.remote_ip).tap do |session|
    Current.session = session
  end
end
```

Y modificaremos el `create` de `SessionsController` para que las respuestas sean en formato json y no redirecciones:

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

**Para hacer que todo esto funcione debemos hacer dos cosas:**

1. Incluir el modulo `Authentication` en `ApplicationController`:

   ```ruby
   # app/controllers/application_controller.rb
   class ApplicationController < ActionController::API
     include Authentication
   end
   ```

2. Eliminar la linea numero 6 de este mismo concern:

   ```ruby
   # app/controllers/concerns/authentication.rb
     included do
       before_action :require_authentication
       helper_method :authenticated? # This, we don't use helpers in APIs
     end
   ```

Hasta este punto ya deberíamos tener el **login funcionando**. Para probar esto voy a agregar [OasRails](https://github.com/a-chacon/oas_rails), que a propósito **ya está funcionando con Rails 8** y voy a enviar un par de peticiones a ver como se comporta, no explicaré como implementar OasRails, para eso puedes ver el repositorio o leer más en [este post](/on rails/2024/07/25/documenting-rails-apis).

Inicio de sesión exitoso:

![](/assets/images/rails8_success_login.png)

Inicio de sesión fallido:

![](/assets/images/rails8_fail_login.png)

---

Ya podemos generar tokens, ahora modificaremos el código para **autenticarnos con ese mismo token**. Para eso, cambiaremos la lógica de buscar la sesión actual del usuario con base en la cookie a buscarla basándonos en la cabecera `Authorization`:

```ruby

# app/controllers/concerns/authentication.rb
  def resume_session
    Current.session = find_session_by_token
  end

  def find_session_by_cookie
    Session.find_by(token: request.headers[:authorization]&.split(" ")[-1])
  end
```

Para probar esto creo que tendremos que hacer rápidamente un modelo que dependa de `User` y que requiera autenticación para utilizar. Intentemos con `rails g scaffold project title:string description:text user:references` y le agregamos al principio del controlador la línea de código `before_action :require_authentication`.

Aquí les dejo una pequeña prueba del index de Projects autenticado con el token que obtuve en las pruebas anteriores:

![](/assets/images/rails8_projects.png)

---

Con esto ya tienes gran parte de la lógica de autenticación funcionando en la aplicación API-Only. Te queda continuar con las modificaciones en el resto de los endpoints para que las respuestas sean en formato json y no supuestas vistas que no existen en la aplicación.

Probablemente de aquí a que se lance la versión final de Rails 8 aparezca un **PR solucionando esto y el generador funcione correctamente en modo API-Only**. Hasta entonces, con estas pequeñas modificaciones ya puedes seguir construyendo tu API.
