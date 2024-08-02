---
layout: post
title: 'Generar Documentación para tu API de Rails: Construí Mi Propia Herramienta'
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
**La documentación de una API es clave para que todo funcione bien.** Ayuda a los desarrolladores a entender cómo usarla, reduciendo errores y haciendo la integración mucho más rápida. **Una buena documentación no solo facilita las cosas, sino que también hace que la API sea más atractiva y agradable de usar. Sin una documentación clara, incluso la mejor API puede ser un problema para los desarrolladores.**

## **La necesidad**

Después de experimentar la **documentación interactiva** de **FastAPI en Python**, quise buscar una **funcionalidad similar para mis APIs con Rails en el ecosistema de Ruby.** Encontré algunos proyectos, pero ninguno cumplió al 100% con mis expectativas. La idea era tener una **herramienta fácil de usar, sin la necesidad de aprender un nuevo DSL.** Una solución que generara **documentación interactiva con una interfaz agradable. Dinámica, cada vez que hiciera un cambio, poder experimentarlo en la interfaz simplemente recargándola.**

Creo que algunas veces no sabemos lo que necesitamos hasta que lo conocemos, o algo así me pasó. Antes simplemente usaba **Postman.** Después de programar cada endpoint, me iba a **Postman** y documentaba con lo más básico cada endpoint (muchas veces repetía información). Pero somos programadores, ¿por qué no hacernos el camino más fácil? **¿Por qué el código no logra ser lo bastante expresivo como para documentarse a sí mismo?** O al menos hacer el intento.

## **Soluciones**

Dentro de las soluciones que encontré, creo que la más conocida y más completa es **ApiPie**, muy cerca de lo que buscaba, pero una de las grandes limitantes es que no logra generar un **OAS > 2.0** hasta el momento, debes aprender un **DSL** y algo no menos importante: carece de una buena interfaz.

Algunas de las otras soluciones:

- **[swagger_yard-rails](https://github.com/livingsocial/swagger_yard-rails)**: Parece abandonado, pero sirve como inspiración.
- **[Rswag](https://github.com/rswag/rswag)**: No es automático, depende de **RSpec;** muchos desarrolladores ahora usan **Minitest**, ya que es el framework de pruebas predeterminado.
- **[grape-swagger](https://github.com/ruby-grape/grape-swagger)**: Requiere **Grape.**
- **[rspec_api_documentation](https://github.com/zipmark/rspec_api_documentation)**: Requiere **RSpec** y un comando para generar la documentación.

![](/assets/images/reddit-api-doc.png)

## **Mi Herramienta**

Así que ahora que tengo tiempo (sin trabajo a tiempo completo) y luego de años de búsqueda —digo años porque hace algo más de dos ya había escrito una [pregunta en Stack Overflow](https://stackoverflow.com/questions/71947018/is-there-a-way-to-generate-an-interactive-documentation-for-rails-apis)—, me decidí a crear mi propia herramienta:

### [**OasRails**](https://github.com/a-chacon/oas_rails)

**OasRails es un engine para Rails que genera un OAS v3.1** a partir de las rutas de la aplicación, examina el código fuente y los comentarios de cada método para tratar de generar una documentación, y finalmente lo despliega usando **RapiDoc.** Todo esto de forma dinámica, con poco esfuerzo y en un solo proyecto.

#### **Características**

Cuando buscaba una solución que fuese `dinámica`, me refería a que la documentación se generara al momento de la consulta y no preconstruirla con un comando. **OasRails** construye el documento con la especificación cada vez que consultas el endpoint (en producción esto debería cambiar).

Cuando hablaba de una solución `automática`, me refería a extraer información que ya está en el código. Por ejemplo, **OasRails** puede:

- Construir los nombres de tus rutas según el nombre del método y del controlador.
- Detectar las posibles respuestas de tus endpoints según los `render` que existen en el código fuente.
- Etiquetar tus rutas según el namespace.
- Extraer ejemplos de request body desde fixtures o FactoryBot (por implementar).

Cuando decía `fácil de usar`, me refería a que solo debes comentar tu código para documentar. No necesitas **RSpec**, ni un **DSL**, ni **Grape** (nada personal contra el proyecto, lo he usado y me gusta).

En cuanto a la característica `interactiva`, eso se lo dejamos a [RapiDoc](https://rapidocweb.com/), que está montado en una vista del engine mediante **CDN.**

<iframe src="https://ghbtns.com/github-btn.html?user=a-chacon&repo=oas_rails&type=star&count=false&size=large" frameborder="0" scrolling="0" width="170" height="30" title="GitHub"></iframe>

[Repositorio Del Proyecto](https://github.com/a-chacon/oas_rails)

---

## Ejemplo practico

Creamos un API con el siguiente comando:

```
rails new api-example --api
```

Agreguemos recursos y sus endpoints rápidamente con los siguientes comandos:

```
rails g scaffold user name:string email:string age:integer

rails g scaffold project title:string description:text user:references

rails g scaffold task title:string description:text status:string project:references
```

Ahora agregamos OasRails al Gemfile:

```
gem 'oas_rails'
```

Montamos el engine en el archivo `routes.rb`:

```
mount OasRails::Engine => '/docs'
```

Corremos las migraciones con `rails db:migrate`, instalamos las dependencias con `bundle install` y finalmente levantamos el proyecto con `rails s`. Podrémos visitar la documentación en `http://localhost:3000/docs`.

![](/assets/images/api-example-docs.png)

Cada endpoint queda documentado al menos con título, ruta, request body y posibles respuestas:

![](/assets/images/api-example-doc-endpoint.png)

**Tener en cuenta que toda esta información no es posible extraerla en casos más reales donde las APIs varían en estructura y ahí es necesario proveer comentarios en cada endpoint.**

[Repositorio Del Proyecto de Ejemplo](https://github.com/a-chacon/api-example)

---

## **Futuro del Proyecto**

El proyecto está recién en una etapa inicial, creo que le falta mucho para ser una **herramienta estable y segura.** Pero algunos de los puntos que pretendo ir mejorando son:

- **Limpiar, documentar y estructurar el código**
- **Soporte para la documentación de métodos de autenticación**
- **Definir etiquetas globales/configuración** (por ejemplo, respuestas comunes como errores 404)
- **Post-procesar el JSON y reemplazar objetos comunes con referencias a componentes**
- **Crear un archivo temporal con el JSON en modo producción** para evitar reconstruirlo en cada solicitud
- **Crear etiquetas para gems populares usadas en APIs** (por ejemplo, una etiqueta `@pagy` para parámetros de paginación comunes)
- **Agregar autenticación básica a OAS y UI por razones de seguridad**
- **Implementar la capacidad de definir OAS por namespaces** (por ejemplo, generar OAS para rutas específicas como `/api` o separar versiones V1 y V2)

---

**Crear una buena documentación es esencial para el éxito de cualquier API.** **OasRails** es mi intento de hacer este proceso más simple y efectivo para la comunidad de Rails. Si te interesa, te invito a probarlo y a contribuir al proyecto.

