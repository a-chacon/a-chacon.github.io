---
layout: post
title: 'Rails Service Objects: Una pequeña guía para agilizar tu código'
category:
  - On Rails
excerpt: >-
  Un Service Object es una clase de Ruby que agrupa la lógica de negocio de
  manera organizada en tu aplicación Ruby on Rails. Su uso simplifica el código,
  facilita las pruebas, fomenta la reutilización y eleva la calidad de tu
  aplicación.
image: /assets/images/service-objects.webp
lang: es
time: 5 min
author: Andrés
comments: true
redirect_from:
  - /ruby/rails/service objects/2023/11/08/rails-service-objects.html
---
**Ruby on Rails** es un framework full stack que incluye todas las herramientas que necesitas para desarrollar una web app rápidamente. Su estructura se basa
en el patrón de arquitectura MVC y eso es más que suficiente para gran parte de las aplicaciones que vas a desarrollar en un comienzo con RoR.
Pero cuando tu aplicación comienza a crecer conforme a los requerimientos del negocio, es entonces cuando empiezas a crear código que no pertenece ni a
la capa **modelo**, ni a la capa **controlador** y menos a la capa **vista**. Entonces te preguntas: ¿Dónde escribo esto? La respuesta puede ser, no necesariamente, **service objects**.

> Learn just what you need to get started, then keep leveling up as you go. Ruby on Rails scales from HELLO WORLD to IPO.

En este post, descubrirás cómo este patrón puede simplificar tu código y mantenerte en control a medida que tu proyecto crece. Exploraremos qué son los service objects y profundizaremos en su implementación para que puedas elegir la que más se adecue a tus necesidades.

# ¿Qué es Service Objects en Rails?

Se podría definir como un patrón de diseño de software adoptado por la comunidad de Rails que se utiliza para extraer cierta lógica procedimental de los modelos y los controladores en objetos de un solo propósito. Muy similar a una implementación de [Command pattern](https://en.wikipedia.org/wiki/Command_pattern) en Ruby y Rails.

Los Service Objects vienen como una forma fácil de mantener parte de nuestra lógica de negocio fuera de nuestros modelos y controladores, creando objetos de una sola responsabilidad que son fáciles de testear, reutilizables y simples. Esto hace que nuestros controladores sean más limpios y que nuestros modelos se encarguen de su principal tarea: representar los datos del negocio.

Son "simples" porque deben cumplir con una única tarea y la implementación más común será mediante un PORO ("Plain Old Ruby Object") que básicamente tendrá:

1. Un método de iniciación.
2. Un único método público. Por lo general `call` o `run`.
3. Retornar una respuesta predecible luego de la ejecución.

## MVC + S

**Entonces, ahora podríamos hablar de una capa adicional en nuestra aplicación MVC, que será la capa de Servicios encargada de encapsular la lógica del negocio y se llevará a cabo mediante el uso de Service Objects.**

Algo positivo que podemos destacar de esto es que la lógica de negocio es una de las partes que más evolucionará a lo largo del tiempo en nuestra aplicación. Por lo tanto, uno de los beneficios de encapsularla en estos **Service Objects** es que será más fácil modificarla con el transcurso del tiempo sin tener que modificar más que una sola parte de tu aplicación.

No está de más mencionar que también es beneficioso para los nuevos desarrolladores que se integren a tu equipo, ya que **Service Objects** nos ayuda a respetar principios como **KISS** (Keep It Simple, Stupid) o **SRP** (Single Responsibility Principle) que directamente disminuyen la complejidad de tus clases (Models o Controllers) y aumenta la rapidez con la que los otros pueden comprender tu código.

# Implementación

Ahora pasaremos a la parte práctica. Como mencioné en la sección anterior, la forma más simple de implementar los Service Objects será mediante POROs (Plain Old Ruby Objects), pero no es la única. En este artículo, mostraré tres formas de hacerlo:

1. PORO (Plain Old Ruby Object)
2. Dry.rb
3. Interactor

### Contexto

Tenemos un inicio de sesión en una API REST con Rails. Debemos autenticar al usuario mediante el uso de un correo y una contraseña. Si detectamos que el usuario está ingresando desde una nueva IP, entonces debemos enviar un correo de seguridad a su cuenta para confirmar que es él. Además, si el usuario realiza más de 3 intentos fallidos consecutivos, bloquearemos su cuenta durante 5 minutos.

**Desde ahora aparecerá mucho código que no es necesario entender/leer con tanto detalle. Más importante es entender la intención.**

Sin Service Objects, haríamos algo como esto:

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

Y necesitamos algo de lógica en nuestro modelo:

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

Ahora, ¿Qué pasaría si luego nos piden un login para un Administrador usando un modelo diferente? ¿Repetimos la lógica? No, claro que queremos respetar DRY (Don't repeat yourself) asi que implementamos un Service Object para encapsular nuestra lógica. Entonces, para llevar el ejemplo anterior a un Service Object crearemos un archivo llamado `authentication_service.rb` en la carpeta `app/services` que es donde guardaremos nuestros objetos. Y el código debería lucir así:

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

Y nuestro controllador:

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

**Beneficios:** Si tu política de seguridad respecto al ingreso a tu plataforma cambia, sabrás dónde está esa lógica. Si tienes dos ingresos diferentes, puedes crear otro servicio con una política diferente. Y tu controlador quedó extremadamente simple. Será un placer escribir un test para un controlador así.

## Service Object llamando otro Service object

Puedes también llamar a un servicio desde otro servicio. Por ejemplo, supongamos que tienes un ingreso diferente para tu usuario admin. Pero queremos reutilizar la política del envío de email de seguridad cuando se trata de un nuevo ingreso desde otra IP.

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

Entonces nuestro servicio de autenticación previo se simplificaría a:

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

Asi puedes utilizar el envio de emails de seguridad en otro contexto.

# Dry.rb

Ahora le toca el turno a Dry.rb, una colección de bibliotecas Ruby de última generación. En este punto, estaremos utilizando el mismo ejemplo anterior. No es necesario que revises todo el código, ya que es el mismo que se presentó anteriormente. Lo que destaca en esta sección es cómo se declaran cada uno de los pasos a realizar, cómo se pasa la entrada de un paso al siguiente y cómo se manejan los errores.

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

Y en nuestro controlador se implementa de la siguiente forma:

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

**No profundizaremos mucho sobre esta librería, ya que es muy completa.** Sin embargo, te recomiendo **encarecidamente** que explores [su documentación](https://dry-rb.org/gems/dry-transaction/0.15/) y descubras todas las posibilidades que ofrece. Algunos de los **beneficios clave** de utilizar esta librería son:

- La **declaración inicial** de cada acción que debe ejecutar tu service object te brinda una idea clara de lo que hace y donde tienes que intervenir si quieres realizar un cambio:

```ruby
  step :find_user
  step :authenticate_user
  check :check_login_attempts
  step :generate_token
  step :handle_security_email
```

- **Un DSL muy efectivo** que facilita la comprensión de lo que ocurre en el Service Object.
- **Validación de parámetros** en tus Service Objects con [dry-validations](https://dry-rb.org/gems/dry-validation/1.10/).
- Un sólido **manejo de errores** para cada paso del proceso.
- **Facilidades para realizar pruebas**, incluyendo la inyección de pasos.
- La posibilidad de **desarrollar tus propios adaptadores de pasos**.

Si te intereso esta implementación te recomiendo este [video](https://www.youtube.com/watch?v=YXiqzHMmv_o)

## Interactor

**Interactor** es otra forma de llevar a cabo el uso de Service Objects con un nombre diferente. También es una solución bien completa para llevar a cabo nuestra implementación, introduce una clase de **Objectos** llamadas **"Organizers"**, que no son más que un **Service Object** que se encarga de llamar de forma secuencial a otros **Interactors (Service Objects)**. Veamos algo de esto en acción, tomaremos nuestro **"gran ejemplo"** jaja y lo separaremos en **4 pequeños Interactors** bajo el mando de un **Organizer**:

### 1. Interactor para encontrar un usuario

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

### 2. Interactor para autenticar al usuario

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

### 3. Interactor para generar token de seguridad

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

### 4. Interactor para enviar correo de seguridad

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

### El Organizer

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

### El Controller

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

**Interactor** es una opción más sencilla que _Dry.rb_. En esta biblioteca, se echa de menos la validación de parámetros en el _contexto_. El _contexto_ puede variar significativamente desde el inicio hasta la finalización del flujo, pero se valora la simplicidad de la implementación. Te invito a revisar la [documentación](https://github.com/collectiveidea/interactor). Algunas funcionalidades a destacar:

- **Hooks**: Puedes ejecutar acciones antes, durante y después de la ejecución del interactor.
- **Rollback**: Puedes definir un método de _rollback_ en tu interactor. Si este está dentro de un organizador y alguno falla, se llama este método para cada interactor que se ejecutó. Muy útil en transacciones completas que modifican los datos.

---

Hasta aquí llegamos con las demostraciones de implementaciones. Puedes explorar otras gemas que te pueden ayudar con la implementación [aquí](https://www.ruby-toolbox.com/categories/Service_Objects).

---

## Lo último

En pocas palabras, los Service Objects en Ruby on Rails son una herramienta esencial para mantener tu código limpio y organizado a medida que tu proyecto crece. Al encapsular la lógica de negocio en clases específicas, simplificas el proceso de desarrollo, haces que las pruebas sean más fáciles y aseguras que tu aplicación sea fácil de mantener y escalable.

Sin embargo, este viaje de mejora no termina aquí. Muchos de los conceptos que te he compartido pueden adaptarse a las necesidades específicas de tu aplicación. Espero que este artículo te haya proporcionado una valiosa perspectiva y herramientas para optimizar tu desarrollo.

Estoy a tu disposición para cualquier sugerencia, comentario o pregunta adicional. No dudes en escribir.

