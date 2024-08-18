---
layout: post
title: "Creando un API REST con Ruby on Rails. Capítulo 2: Endpoints y Serialización"
categories:
  - On Rails
excerpt: >-
  Cómo construir APIs RESTful eficientes con Ruby on Rails, desde los principios
  fundamentales de REST hasta la configuración inicial del proyecto, la
  optimización de rutas con anidación y el uso de serializadores.
image: /assets/images/apirestcap2.webp
lang: es
time: 2 min
author: Andrés
comments: true
redirect_from:
  - /rails/ruby/2024/06/23/creating-rails-api-cap-2.html
---

Antes de continuar construyendo nuestra **API REST con Ruby On Rails** me gustaría dar un salto hacia atrás para aclarar algunos puntos. Cuando comencé a trabajar como desarrollador había muchas cosas que no tenía claras y que me costó tiempo, esfuerzo, pruebas y errores aprender. Una de esas era ¿Qué era realmente un API y cuál es la mejor forma de construir una? ¿Cuáles rutas definir y qué respuestas dar?

Ahora esto me parece obvio y básico, pero creo que vale la pena repasar. [Según IBM](https://www.ibm.com/es-es/topics/rest-apis) un API REST es:

> Una API REST (también llamada API RESTful o API web RESTful) es una interfaz de programación de aplicaciones (API) que se ajusta a los principios de diseño del estilo arquitectónico de transferencia de estado representacional (REST). Las API REST proporcionan una forma flexible y ligera de integrar aplicaciones y conectar componentes en arquitecturas de microservicios.

Lo único que se debe respetar cuando diseñas una API REST deben ser los **6 principios REST**:

- **Interfaz uniforme**: Todas las solicitudes para el mismo recurso deben tener el mismo aspecto y un único URI.
- **Desacoplamiento cliente-servidor**: Cliente y servidor son independientes; el cliente solo conoce el URI del recurso.
- **Sin estado**: Cada solicitud debe contener toda la información necesaria; no se guarda estado del lado del servidor.
- **Capacidad de almacenamiento en caché**: Los recursos deben ser cacheables para mejorar el rendimiento y la escalabilidad.
- **Arquitectura del sistema en capas**: Las llamadas y respuestas pueden pasar por múltiples capas de intermediarios.
- **Código bajo demanda (opcional)**: Las respuestas pueden contener código ejecutable bajo demanda.

<iframe src="https://giphy.com/embed/52HjuHsfVO69q" width="480" height="269" style="" frameBorder="0" class="giphy-embed" allowFullScreen></iframe><p><a href="https://giphy.com/gifs/reactiongifs-52HjuHsfVO69q">via GIPHY</a></p>

¿Y cómo funciona esto? Probablemente si estás leyendo esto es porque ya sabes. Solicitudes HTTP para realizar funciones de base de datos estándar como crear, leer, actualizar y eliminar (CRUD) sobre un recurso. Y aquí mi recomendación y consejo: **siempre intenta realizar tus APIs orientadas a recursos y no a acciones**. Con Ruby On Rails esto no es difícil, pero siempre está la tentación de realizar endpoints como `POST /publishArticle` en vez de realizar `PUT /article/:article_id` con el contenido correcto.

---

Con esto aclarado continuamos con nuestra serie de posts, segundo capítulo:

- [**Capítulo 1**: Configuración Inicial y Modelos](/on rails/2024/06/16/creating-rails-api-cap-1)
- **Capítulo 2**: Endpoints y Serialización <----------- Estas Aquí!
- [**Capítulo 3**: Autenticación y Autorización](/on rails/2024/08/18/creating-rails-api-cap-3)
- **Capítulo 4**: Manejo de Errores y Buenas Prácticas

---

## Rutas

Ahora bien, continuando con nuestro ejemplo arreglaremos las rutas. Usaremos **rutas anidadas** para los recursos que dependen de `Projects` utilizando la opción [shallow](https://guides.rubyonrails.org/routing.html#shallow-nesting) para crear solo las rutas necesarias para identificar el recurso y [evitar el anidamiento profundo](http://weblog.jamisbuck.org/2007/2/5/nesting-resources).

```ruby
# config/routes.rb
Rails.application.routes.draw do
  get 'up' => 'rails/health#show', :as => :rails_health_check

  resources :projects, shallow: true do
    resources :tasks
    resources :roles
  end
end
```

Eliminé comentarios y las ordené un poco. Si usamos el comando `rails routes`, estaremos viendo nuestras rutas apuntando a nuestros métodos de controlador de esta forma:

```fish
     projects GET    /projects(.:format)                   projects#index
              POST   /projects(.:format)                   projects#create
      project GET    /projects/:id(.:format)               projects#show
              PATCH  /projects/:id(.:format)               projects#update
              PUT    /projects/:id(.:format)               projects#update
              DELETE /projects/:id(.:format)               projects#destroy
project_tasks GET    /projects/:project_id/tasks(.:format) tasks#index
              POST   /projects/:project_id/tasks(.:format) tasks#create
         task GET    /tasks/:id(.:format)                  tasks#show
              PATCH  /tasks/:id(.:format)                  tasks#update
              PUT    /tasks/:id(.:format)                  tasks#update
              DELETE /tasks/:id(.:format)                  tasks#destroy
project_roles GET    /projects/:project_id/roles(.:format) roles#index
              POST   /projects/:project_id/roles(.:format) roles#create
         role GET    /roles/:id(.:format)                  roles#show
              PATCH  /roles/:id(.:format)                  roles#update
              PUT    /roles/:id(.:format)                  roles#update
              DELETE /roles/:id(.:format)                  roles#destroy
```

## Tests

### SetUp con Factories

Si ejecutamos `rails t`, nos encontraremos con varios errores. El primer problema que debemos resolver es que Rails, hasta el momento, ha generado nuestras factorías con `FactoryBot`, pero no las está utilizando automáticamente para crear los registros de prueba en el bloque `setup` de cada archivo de test de controladores. En su lugar, está utilizando las fixtures para obtener un objeto de prueba. Sin embargo, estas fixtures no fueron creadas porque el comportamiento cambió cuando instalamos `FactoryBot`; ahora se utilizan factorías en lugar de fixtures. Para solucionar esto, necesitamos reemplazar la línea número 5 de nuestros tests de controladores de la siguiente forma:

```ruby
# test/controllers/projects_controllers_test.rb
-     @project = projects(:one)
+     @project = FactoryBot.create(:project)
```

y lo mismo para los otros dos, pero agregaremos una línea más al `setup` con un objeto `project` que usaremos más adelante en las rutas:

```ruby
# test/controllers/roles_controllers_test.rb
-     @role = roles(:one)
+     @role = FactoryBot.create(:role)
+     @project = @role.project
```

```ruby
# test/controllers/tasks_controllers_test.rb
-     @task = tasks(:one)
+     @task = FactoryBot.create(:task)
+     @project = @task.project
```

### Routes Helpers

Ahora todavía deberíamos tener 4 tests fallando y esto es debido a que cambiamos la estructura de las rutas. Para corregir eso debemos usar los nuevos helpers creados con las rutas anidadas para las acciones `index` y `create` en los controladores `RolesController` y `TasksController`. Específicamente, debes cambiar `roles_url` y `tasks_url` de las líneas número 9 y 15 por `project_roles_url(@project)` y `project_tasks_url(@project)` respectivamente.

Cuando realices eso correctamente, podrás correr tus tests y obtener un resultado como este:

```bash
15 runs, 27 assertions, 0 failures, 0 errors, 0 skips
```

## Creando Serializadores

La **serialización de datos se refiere al proceso de convertir objetos de datos** (como instancias de modelos ActiveRecord) en formatos que pueden ser **fácilmente transmitidos** y entendidos por diferentes sistemas, en nuestro caso, transformarlos en formato JSON.

En Rails, nuestros modelos ya incluyen por defecto el módulo [ActiveModel::Serializers::JSON](https://api.rubyonrails.org/classes/ActiveModel/Serializers/JSON.html), que les permite serializar todos los atributos (se pueden filtrar) a un Hash y, por ende, a un objeto JSON. Esto es lo que está ocurriendo de forma predefinida en nuestros métodos de controladores creados con `scaffold`. Sin embargo, necesitamos ir un poco más allá, necesitamos más personalización y flexibilidad. Para esto propongo el uso de Blueprinter, que es una opción confiable y flexible.

### [Blueprinter](https://github.com/procore-oss/blueprinter)

> Blueprinter es un presentador de objetos JSON para Ruby que toma objetos de negocio y los descompone en simples hashes y los serializa a JSON. Puede utilizarse en Rails en lugar de otros serializadores (como JBuilder o ActiveModelSerializers). Está diseñado para ser sencillo, directo y eficaz. Se basa en gran medida en la idea de vistas que, de forma similar a las vistas de Rails, son formas de predefinir la salida de datos en diferentes contextos.

### Clases serializadoras

Entonces, la gema ya la instalamos en el capítulo anterior. Ahora solo nos queda crear nuestras clases serializadoras. Para esto vamos a crear una carpeta en la ruta `app/blueprints/` y dentro incluiremos 4 archivos (uno para cada modelo) con el siguiente contenido:

```ruby
# app/blueprints/project_blueprint.rb

class ProjectBlueprint < Blueprinter::Base
  identifier :id

  fields :name, :description

  view :with_tasks do
    association :tasks, blueprint: TaskBlueprint
  end
end
```

```ruby
# app/blueprints/task_blueprint.rb

class TaskBlueprint < Blueprinter::Base
  identifier :id

  fields :title, :description, :status
end
```

```ruby
# app/blueprints/role_blueprint.rb

class RoleBlueprint < Blueprinter::Base
  identifier :id

  fields :role
  association :user, blueprint: UserBlueprint
end
```

```ruby
# app/blueprints/user_blueprint.rb

class UserBlueprint < Blueprinter::Base
  identifier :id

  fields :email
end
```

### Implementando en controladores

Ahora que ya tenemos nuestros serializadores listos, debemos implementarlos en nuestros métodos de controladores. Para esto, simplemente te explicaré cómo se usa, pero no mostraré cada cambio que debes hacer porque son varias líneas que tocar. Identifica cada línea de código en los controladores que tenga la palabra **`render`**. Esto especifica la respuesta al cliente, en este caso un JSON con el objeto o los objetos que, como ya dije, se serializan por defecto con **`ActiveModel::Serializers`**. Pero nosotros cambiaremos eso. Por ejemplo, para un **`Project`**, escribiremos: **`render json: ProjectBlueprint.render_as_json(@project)`**. De esta forma, Blueprint será el encargado de serializar el objeto en lugar de Serializers.

Otro ejemplo, para nuestro método **`show`**, tal vez queramos mostrar un objeto más completo. Para eso podemos hacerlo así: **`render json: ProjectBlueprint.render_as_json(@project, view: :with_tasks)`**, y de esa manera no solo retornaremos el proyecto, sino también sus tareas.

Después de realizar los cambios correspondientes, puedes volver a probar que todo está funcionando correctamente ejecutando **`rails t`**.

<iframe src="https://giphy.com/embed/qjj4xrA1STjfa" width="480" height="353" style="" frameBorder="0" class="giphy-embed" allowFullScreen></iframe><p><a href="https://giphy.com/gifs/space-nasa-qjj4xrA1STjfa">via GIPHY</a></p>

## Pensamientos finales

Con esto ya tendremos nuestros endpoints funcionando, las rutas tienen sentido al usar anidación, los serializadores nos dan un mayor control sobre qué datos exponer y cuáles ocultar dependiendo del método y, en un futuro, de los permisos. Y lo más importante, **nuestros tests están funcionando**. Validan la creación, obtención, modificación y eliminación de nuestros datos.

Si hay algún punto que no expresé correctamente o me salté algo hasta ahora, por favor escríbeme. Además, te agrego la URL del repositorio donde iré subiendo el código actualizado para que lo vayas revisando:

Repo: [https://github.com/a-chacon/api-project-management-example](https://github.com/a-chacon/api-project-management-example)
