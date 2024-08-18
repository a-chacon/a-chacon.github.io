---
layout: post
title: >-
  Creando un API REST con Ruby on Rails. Capítulo 1: Configuración Inicial y
  Modelos
categories:
  - On Rails
excerpt: >-
  Preparamos los cimientos de una API REST en Ruby on Rails, diseñando la base
  de datos, creando modelos y configurando factorías para registros de prueba.
  Enfocados en escalabilidad y adaptabilidad futura del código.
image: /assets/images/apirestcap1.webp
lang: es
time: 2 min
author: Andrés
comments: true
redirect_from:
  - /rails/ruby/2024/06/16/creating-rails-api-cap-1.html
---

Hace un par de meses que no comenzaba un nuevo proyecto ni programaba nada importante, pero hace unos días eso cambió. Tuve que comenzar una nueva API REST con Ruby on Rails. Cada vez que eso pasa, me empiezo a preguntar cosas como: ¿Ocuparé una gema para realizar la autenticación o lo programaré todo yo? ¿Cómo manejaré los permisos? ¿Usaré el mismo serializador que uso siempre o buscaré algo más actualizado y nuevo? ¿Crearé los modelos y luego los controladores o crearé todo a la misma vez con `rails scaffold`?

A medida que surgían estas preguntas 🤔, se me ocurrió la idea de escribir una serie de posts donde dejar clara **mi forma de crear APIs con Ruby on Rails**, que me sirva a mí como un recordatorio y a otros para aprender y/o complementar sus conocimientos. A propósito de que no encontré ninguna buena guía en internet, todas son muy básicas y con ejemplos poco reales que no van más allá de un simple CRUD.

---

Por ello, mi idea es dividir el tema en 4 capítulos, cada uno será un post que iré publicando en mi blog siempre que no pierda la motivación en el camino jeje 😅.

- **Capítulo 1**: Configuración Inicial y Modelos <---------- Estas Aquí!
- [**Capítulo 2**: CRUD y Serialización]({% post_url 2024-06-23-creating-rails-api-cap-2 %})
- [**Capítulo 3**: Autenticación y Autorización]({% post_url 2024-08-19-creating-rails-api-cap-3 %})
- **Capítulo 4**: Manejo de Errores y Buenas Prácticas

---

**Para esta guía supongo que sabes lo que es una API REST, tienes Ruby instalado, la gema de Rails instalada y estás usando un sistema operativo basado en GNU/Linux**

Si no, te dejo algunos recursos que deberías mirar antes de proseguir:

- <https://aws.amazon.com/what-is/restful-api/>
- <https://www.ruby-lang.org/en/documentation/installation/>
- <https://guides.rubyonrails.org/getting_started.html#creating-a-new-rails-project-installing-rails>
- <https://itsfoss.com/linux-better-than-windows/>

<iframe src="https://giphy.com/embed/qt73FYHjuXqAj241m8" width="480" height="480" style="" frameBorder="0" class="giphy-embed" allowFullScreen></iframe><p><a href="https://giphy.com/gifs/pudgypenguins-building-build-brick-qt73FYHjuXqAj241m8">via GIPHY</a></p>

## El Problema

Para facilitarme las cosas, comencé a hablar con GPT y le pedí un problema/requisitos que será nuestra guía para desarrollar nuestra aplicación e ir tocando cada punto del que hay que hablar. El problema:

> Se necesita desarrollar una API para una plataforma de gestión de proyectos que permita a los usuarios registrar proyectos, gestionar roles específicos y administrar tareas asociadas a cada proyecto. En esta plataforma, los administradores tendrán la capacidad exclusiva de crear, actualizar y eliminar proyectos, así como asignar roles como administrador o colaborador a otros usuarios. Además, los administradores serán los únicos autorizados para crear y administrar tareas dentro de cada proyecto, asegurando que solo ellos puedan gestionar las actividades específicas del proyecto. Por otro lado, los colaboradores tendrán acceso de solo lectura a las tareas del proyecto, permitiéndoles ver la información detallada pero sin posibilidad de modificarla. Esta API no solo garantizará la seguridad y la integridad de los datos, sino que también proporcionará una gestión eficiente y escalable de proyectos y tareas para distintos equipos y usuarios dentro de la organización.

### Paso Número 0

Antes de comenzar a tocar código es bueno realizar un [modelado de tu base de datos](https://www.ibm.com/topics/data-modeling) de la forma que sea más fácil para ti. Esto sentará las bases para todo lo que vas a realizar de aquí en adelante, no de una forma estricta, sino más bien como una guía. Yo recomiendo hacerlo en [dbdiagram.io](https://dbdiagram.io). Así que, siguiendo nuestro problema, lo resolveré con la siguiente estructura de base de datos:

![modelo de base de datos](/assets/images/db.png)

### Creando La Aplicación Ruby on Rails

Posiciónate en el directorio de tu preferencia y ejecuta el comando:

```bash
rails new api-project-management --api
```

Listo, **ya tienes tu api creada con Ruby On Rails**.

## Instalar Estas Gemas Antes De Empezar 💎

Lo primero, **debes escribir pruebas**. Y para que nuestras pruebas funcionen bien, prepararemos el entorno antes de crear cualquier modelo. Agregaremos estas dos gemas a nuestro Gemfile:

```ruby
Gemfile
group :development, :test do
  ...

  gem "faker"

  gem "factory_bot_rails"

  ...
end

gem "devise"
gem "devise-api"

gem "pundit"

gem "blueprinter"
```

[Faker](https://github.com/faker-ruby/faker), si no la conoces, es para crear datos de prueba de forma fácil. La segunda, [factory_bot_rails](https://github.com/thoughtbot/factory_bot_rails), es para implementar factory_bot en Rails, una forma fácil de crear registros de prueba y una alternativa (mucho mejor a mi parecer) de las fixtures. Será bueno que vayas mirando su documentación.

```ruby
Gemfile
gem "devise"
gem "devise-api"

gem "pundit"

gem "blueprinter"
```

También agregaremos lo que es [devise](https://github.com/heartcombo/devise) y [devise-api](https://github.com/nejdetkadir/devise-api) para la autenticación, [pundit](https://github.com/varvet/pundit) para la autorización y [blueprinter](https://github.com/procore-oss/blueprinter) para la serialización. Con esto te puedes ir haciendo una idea de qué vendrá en los próximos capítulos.

### Creando Nuestros Recursos 🪵

#### User

Para el recurso `User` crearemos solo el modelo, puesto que la creación y el login lo manejaremos en el próximo capítulo con la gema [devise-api](https://github.com/nejdetkadir/devise-api). Ejecutemos:

```bash
rails g model user
```

Los campos de correo y contraseña no los agregaremos directamente, devise lo hará por nosotros. Para este punto te sugiero que vayas a la documentación de devise y revises la sección de [empezando](https://github.com/heartcombo/devise?tab=readme-ov-file#getting-started). Pero en resumidas cuentas debes correr estos dos comandos:

```bash
rails generate devise:install
rails generate devise user
```

#### Project

Para `Project` usaremos el commando `scaffold` ya que necesitamos un CRUD completo.

```bash
rails g scaffold project name:string description:text
```

#### Role

`Role` será el modelo que haga la relacion entre un `User` y un `Project`. Este tendrá un enum donde definiremos el rol que cumple cada usuario en cada proyecto al que está relacionado. También será un CRUD completo, pero aquí será donde manejaremos permisos más adelante.

```bash
rails g scaffold role role:string user:references project:references
```

#### Task

Por último `Task`. También con un CRUD completo y manejo de permisos.

```bash
rails g scaffold task title:string description:text status:string project:references
```

---

Ejecutamos `rails db:migrate` para crear las tablas en nuestra base de datos.

---

### Nuestros Modelos

Los modelos serán simples, no incluirán mucha lógica de negocio puesto que nuestro ejemplo no lo requiere. Pero al menos tenemos que comprobar que las asociaciones se cumplen de forma correcta y que el `enum` de `Role` y `Task` estén definidos. Así que modificaremos los modelos `User` y `Project` para que se vean de la siguiente forma respectivamente:

```ruby
/app/models/user.rb
class User < ApplicationRecord
  has_many :roles
  has_many :projects, through: :roles
end
```

```ruby
/app/models/project.rb
class Project < ApplicationRecord
  has_many :roles
  has_many :users, through: :roles

  has_many :tasks
end
```

Y `Role` y `Task` para que se vean así:

```ruby
/app/models/role.rb
class Role < ApplicationRecord
  belongs_to :user
  belongs_to :project

  enum :role, {manager: "manager", contributor: "contributor"}
end
```

```ruby
/app/models/task.rb
class Task < ApplicationRecord
  belongs_to :project

  enum :status, {next_to_do: "next_to_do", doing: "doing", complete: "complete"}
end
```

Me gusta definir los enums de esta forma, clave y valor en la base de datos, porque me ha pasado que algunas veces me pedían un dump de algunos datos de la base de datos directamente. Cuando pasa eso y tienes un enum definido de la forma tradicional con valores numéricos **carecen de significado para cualquier persona que los ve y no tiene la definición de tu modelo**.

### Factories

<iframe src="https://giphy.com/embed/yKxo7c9Q6pZoUzAfPu" width="480" height="480" style="" frameBorder="0" class="giphy-embed" allowFullScreen></iframe><p><a href="https://giphy.com/gifs/nounish-dao-nouns-noggles-yKxo7c9Q6pZoUzAfPu">via GIPHY</a></p>

Al momento de crear nuestros modelos, factory_bot nos creó un archivo para cada uno en la carpeta `test/factories/*` con la definición que sirve para crear registros durante las pruebas. Por defecto, no tienen mucho sentido, debemos arreglar las relaciones, crear datos que se acerquen de cierta forma a los reales y pensar en que la definición nos ayude a hacer las pruebas que necesitamos. Arreglaremos eso utilizando `Faker` y sacándole el jugo a `factory_bot`:

```ruby
test/factories/roles.rb
FactoryBot.define do
  factory :role do
    role { Role.roles.keys.sample }
    user
    project
  end
end
```

```ruby
test/factories/users.rb
FactoryBot.define do
  factory :user do
    email { Faker::Internet.email }
    password { Faker::Internet.password }
    factory :user_with_projects do
      transient do
        projects_count { 5 }
      end

      after(:create) do |user, context|
        create_list(:role, context.projects_count, user:)
      end
    end
  end
end
```

```ruby
test/factories/projects.rb
FactoryBot.define do
  factory :project do
    name { Faker::Lorem.word }
    description { Faker::Lorem.paragraph }

    factory :project_with_tasks do
      transient do
        tasks_count { 5 }
      end

      after(:create) do |project, context|
        create_list(:task, context.tasks_count, project:)
      end
    end
  end
end
```

Y Tareas así:

```ruby
test/factories/tasks.rb
FactoryBot.define do
  factory :task do
    title { Faker::Lorem.word }
    description { Faker::Lorem.paragraph }
    status { Task.statuses.keys.sample }
    project
  end
end
```

### Hasta aquí por hoy

Con estos pasos ya tendremos creados los **cimientos de nuestra API REST** y estamos listos para seguir avanzando hacia los endpoints y las pruebas de integración que estaremos viendo en el próximo capítulo. Hasta ahora nada está escrito en piedra, es imposible pensar que llegaremos a una planificación perfecta que no sufra modificaciones en el futuro; lo ideal siempre es pensar en que tu código sea escalable y soporte esas modificaciones futuras.

Hemos diseñado nuestra base de datos, creamos nuestros modelos, definimos las asociaciones de forma correcta, te comenté cómo me gusta definir los enums y dejamos nuestras factorías listas para producir registros de pruebas 🏭. Dejaré la URL del repositorio con el código más abajo por si lo quieres ir mirando y **cualquier comentario u opinion para motivarme a seguir escribiendo es bienvenido**.

Repo: <https://github.com/a-chacon/api-project-management-example>
