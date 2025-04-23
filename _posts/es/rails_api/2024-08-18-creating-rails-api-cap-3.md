---
layout: post
title: >-
  Creando un API REST con Ruby on Rails. Capítulo 3: Autenticación y Autorización.
categories:
  - On Rails
excerpt: >-
  Descubre cómo asegurar tu API en Ruby on Rails con Devise para autenticación y Pundit para autorización. Cubriremos lo esencial para proteger tus endpoints y asegurar que solo los usuarios autorizados tengan acceso.
image: /assets/images/apirestcap3.webp
comments: true
---

Agregar **autenticación** y **autorización** a tus **APIs** es una parte fundamental en el desarrollo de tus aplicaciones. De estas dos estrategias depende gran parte de la **seguridad** y el correcto acceso a los datos y servicios que ofrecerás.

Para empezar, creo que es importante entender la diferencia entre autenticación y autorización en una API REST. La primera se refiere al proceso de verificar la **identidad** de un usuario o servicio, y la segunda corresponde al proceso de determinar si ese usuario o servicio autenticado tiene **permisos** para acceder al recurso o acción que intenta realizar.

---

¿Dónde estamos?

- [**Capítulo 1**: Configuración Inicial y Modelos](/on rails/2024/06/16/creating-rails-api-cap-1.html)
- [**Capítulo 2**: Endpoints y Serialización](/on rails/2024/06/23/creating-rails-api-cap-2.html)
- **Capítulo 3**: Autenticación y Autorización <--- ¡Estamos aquí!
- **Capítulo 4**: Manejo de Errores y Buenas Prácticas

---

### Autenticación

Para aplicar la autenticación existen algunas estrategias comunes y no es necesario reinventar la rueda, así que para clasificarlas podemos basarnos en las opciones que define **OpenAPI Initiative**:

- Esquemas de autenticación HTTP (utilizan el header `Authorization`):
  - [**Básico**](https://swagger.io/docs/specification/authentication/basic-authentication/): Autenticación básica donde las credenciales se envían codificadas en base64 en el header `Authorization`.
  - [**Bearer**](https://swagger.io/docs/specification/authentication/bearer-authentication/): Autenticación con token Bearer, normalmente usada con OAuth 2.0, donde los tokens se envían en el header `Authorization`.
  - Otros esquemas HTTP definidos por [RFC 7235](https://tools.ietf.org/html/rfc7235) y el [Registro de Esquemas de Autenticación HTTP](https://www.iana.org/assignments/http-authschemes/http-authschemes.xhtml).
- [**API Keys**](https://swagger.io/docs/specification/authentication/api-keys/) en headers, query string o cookies:
  - [Autenticación con cookies](https://swagger.io/docs/specification/authentication/cookie-authentication/): Autenticación usando cookies para almacenar identificadores de sesión.
- [**OAuth 2**](https://swagger.io/docs/specification/authentication/cookie-authentication/): Framework de autenticación que permite a aplicaciones de terceros acceder a datos del usuario sin compartir contraseñas.
- [**OpenID Connect Discovery**](https://swagger.io/docs/specification/authentication/openid-connect-discovery/): Servicio de descubrimiento para OpenID Connect, que facilita la autenticación basada en OAuth.

### Autorización

Lo mismo que la autorización, no reinventaremos la rueda, así que aquí te dejo algunas de las estrategias más comunes:

- **Role-Based Access Control (RBAC):** Autorización basada en roles predefinidos (ej. admin, editor).
- **Attribute-Based Access Control (ABAC):** Control basado en atributos del usuario, recursos y contexto.
- **Policy-Based Access Control (PBAC):** Uso de políticas para definir permisos sobre acciones y recursos.
- **Access Control Lists (ACLs):** Permisos específicos definidos para usuarios sobre recursos individuales.
- **OAuth 2.0 (con scopes):** Autorización de acceso limitado para aplicaciones de terceros en APIs.

## Nuestra API REST

Ahora que entendemos mejor los conceptos, podemos pasar a la práctica. En nuestro caso, utilizaremos [devise-api](https://github.com/nejdetkadir/devise-api) para la autenticación (Bearer Token) y [Pundit](https://github.com/varvet/pundit) para la autorización (PBAC). Las gemas ya las agregamos a nuestro proyecto en los capítulos anteriores. Pero si no lo has hecho, entonces agrega lo siguiente en alguna parte de tu Gemfile:

```ruby
gem 'devise'
gem 'devise-api'

gem 'pundit'
```

## Implementando la autenticación

[**💥Ahora puedes usar el generador de autenticación de Rails 8💥**](/on rails/2024/10/16/poc-using-rails-8-auth-system-in-api-only.html)

Como la autenticación depende de **Devise**, lo primero es que sigamos los pasos de instalación de esta gema:

```bash
rails generate devise:install
rails generate devise User
```

Luego **devise_api**:

```bash
rails generate devise_api:install
```

Corremos las migraciones:

```bash
rails db:migrate
```

Y finalmente agregamos el módulo `api` al modelo que contiene **Devise**, osea la clase `User`. Para este caso podemos eliminar todos los otros módulos y dejar solo los siguientes:

```ruby
class User < ApplicationRecord
  devise :database_authenticatable, :api

  has_many :roles
  has_many :projects, through: :roles
end
```

Para que los **endpoints** de `devise-api` sean expuestos, debemos utilizar el método `devise_for` original de **Devise** en el archivo `routes.rb`:

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

Ahora puedes utilizar los siguientes **helpers** en los controladores para proteger los endpoints con autenticación. En el caso de nuestro ejemplo, queremos cubrir toda la API, así que podemos agregarlos en el `ApplicationController` para que los demás controladores los hereden. Además, agregaré un método que nos puede ser útil:

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

En este punto, casi todos los **tests** deberían estar fallando. Necesitaremos agregarles autenticación. Para facilitarnos esta tarea, te propongo que agregues la siguiente **factoría**:

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

Luego tienes que crear **tokens** y enviarlos junto a las peticiones **HTTP**:

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

### Implementando la Autorización

El problema del capítulo 1 mencionaba varias condiciones, todas válidas, pero para simplificarnos la tarea y con el fin de una demostración, solo vamos a cubrir la autorización de **Tareas**. Solo los `User` con el rol de **administrador** en el proyecto podrán crearlas (create), el resto no.

Antes de continuar, debemos asegurarnos de haber seguido los pasos de instalación de **Pundit**. Estos son:

- Agrega el módulo al ApplicationController:

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

- Creamos un ApplicationPolicy que servirá de base:

  ```bash
  rails g pundit:install
  ```

Y listo. Hagamos un test que falle:

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

Ahora hagamos que funcionen. Pundit se maneja con archivos _Policy_, debemos crear uno siguiendo las instrucciones de la gema, heredando de nuestra `ApplicationPolicy` e implementando nuestra lógica de validación (también puedes usar el generador):

```ruby
# app/policies/post_policy.rb
class TaskPolicy < ApplicationPolicy
  def create?
    user.roles.exists?(project: record.project, role: :manager)
  end
end
```

Agregamos la autorización al método del controlador:

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

Deberíamos obtener un lindo color verde en todos nuestros tests.

---

Como podemos ver, aplicar autorización y autenticación en nuestra API se hace fácil con _Devise_ y _Pundit_. Te recomiendo que veas las documentaciones oficiales para entender más a fondo todo lo que puedes llegar a realizar con estas dos gemas y un poco de ingenio.

Hemos visto una pequeña introducción a la autenticación utilizando un _Bearer token_ y la autorización basada en políticas y roles cuando desarrollamos APIs. Ruby on Rails es un framework espectacular y espero que algo bueno hayas sacado de todo este post.

¡Happy coding!

El repo con todo el código: <https://github.com/a-chacon/api-project-management-example>
