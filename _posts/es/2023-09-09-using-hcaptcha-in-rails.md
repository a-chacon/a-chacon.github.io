---
layout: post
title: 'hCaptcha: Cómo integrarlo en tu aplicación Ruby on Rails y por qué.'
category:
  - On Rails
excerpt: >-
  hCaptcha se define como el mayor servicio de catpcha independiente. Dicen
  estar funcionando en un 15% de internet y que es posible competir con los
  gigantes tecnológicos enfocándose en la privacidad. Veremos como es de
  sencillo instalar este captcha en una aplicación Ruby on Rails.
image: /assets/images/hcaptcha.jpg
lang: es
time: 8 min
author: Andrés
comments: true
redirect_from:
  - /ruby/rails/hcaptcha/2023/09/09/using-hcaptcha-in-rails.html
---
La principal función de un captcha es impedir el paso de bots a nuestras paginas webs, pero esta tarea cada vez se ha ido haciendo mas dificil con el paso del tiempo. Los bots tanto buenos como malos se han vuelto mas sofisticados. Y es por esto que hasta el momento la mejor forma de distinguir un usuario real de una maquina, sin comprometer la identidad real de los usuarios, es mediante el uso de desafios.

> Si queremos preservar nuestra privacidad en línea, necesitamos formas de verificar que una persona está interactuando con servicios en línea sin intentar vincular eso a la identidad real de nadie.

### Porque no usar reCaptcha de Google

Google es un negocio principalmente de publicidad. Su producto son
los datos de sus usuarios (sus “usados” diría Richard Stallman). Y cada
vez que se encuentran con un bot no es negocio para ellos, por lo que
nos podríamos preguntar: ¿Cuál es su real interés por detener bots?
probablemente, sea obtener más datos sobre usuarios. Y así fue como
dejaron obsoleta su solución de reCatpcha v2 y lanzaron reCaptcha v3,
que te recomiendan incrustar en cada página de tu sitio y que no requiere interacción del usuario.

¿Cómo logran que no haya interacción de los usuarios para definir si son bots o no? Datos y más datos vinculados a identidades reales que muy probablemente usen para más cosas que solo definir si se trata de un bot o no. Tal vez hayas notado que usando un navegador web limpio (sin cookies ni historial) te ha costado mucho más resolver un captcha de Google que cuando tienes una cuenta de Google abierta o has navegado por varios sitios ya. Puedes leer más sobre este tema [aquí.](https://www.fastcompany.com/90369697/googles-new-recaptcha-has-a-dark-side)

> El enfoque de almacenar todo también perjudica la experiencia del usuario, viola la privacidad y acaba castigando a personas reales que no han optado por el ecosistema de Google, por ejemplo, utilizando Firefox.

# Comenzamos con nuestra aplicación

**Esto es una aplicación básica que no contempla todos los casos de uso posibles. Solo es un happy path**

Crearemos un inicio de sesión donde integraremos hCatpcha. Veremos como integrarlo tanto en la vista de login, como la verificación que debemos realizar de lado del servidor del token generado por el captcha.

```bash
rails new hcaptcha --css tailwind
```

Creamos nuestro modelo `User`:

```bash
rails g model user email:string password_digest:string
```

Migramos con `rails db:migrate` y creamos nuestro controlador para hacer login:

```bash
rails g controller authentication new create show
```

Agregaremos `has_secure_password` a nuestro modelo `User` y crearemos rápidamente un usuario nuevo entrando a la consola de rails con `rails c` y luego `User.create(email: "a@test.com", password: "Test12345")`.

Y por último haremos que nuestro archivo `routes.rb` se vea de la siguiente manera:

```ruby
Rails.application.routes.draw do
  root 'authentication#new'
  resources :authentication, only: %i[create show]
end
```

## Cuenta en hCaptcha

Debes create una cuenta [aquí](https://dashboard.hcaptcha.com/signup) y obtener un `site_key` y un `secret_key`.

![](/assets/images/hcaptcha_sitekey.png)

Copiamos el sitekey y lo agregamos a nuestro `crendetials.yml` con el nombre de `hcatpcha_site_key`.

![](/assets/images/hcaptcha_secret.png)

Copiamos el secret key y lo agregamos a nuestro `crendetials.yml` con el nombre de `hcatpcha_secret_key`.

# Vistas

Crearemos un formulario simple donde pediremos el email y la contraseña. Adentro del mismo form agregaremos las líneas necesarias para que el captcha se despliegue y también agregaremos una forma simple de desplegar mensajes flash. Entonces nuestra vista `app/views/authentication/new.html.erb` se estaría viendo de la siguiente forma:

```erb
<div class="flex min-h-full flex-col justify-center px-6 py-12">

  <% flash.each do |type, msg| %>
    <div>
      <%= msg %>
    </div>
  <% end %>

  <h2 class="mt-10 text-center text-2xl font-bold text-gray-900">Entrar</h2>

  <div class="mt-10">
    <%= form_with url: authentication_index_path do |f| %>
      <%= f.text_field :email, class: "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600" %><br>
      <%= f.password_field :password ,class: "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600" %><br>

      <!-- hCaptcha -->
      <div class="h-captcha" data-sitekey="<%= Rails.application.credentials.hcaptcha_site_key %>"></div>
      <script src="https://js.hcaptcha.com/1/api.js" async defer></script>
      <!-- end hCaptcha -->

      <%= f.submit "Entrar", class: "flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" %>
    <% end %>
  </div>
</div>
```

Notar que el `site_key` lo obtenemos de forma dinámica desde nuestro archivo `credentials.yml`.

# Comprobar los datos del formulario

Antes de trabajar en nuestro controlador debemos saber que necesitaremos de un método para verificar la respuesta de nuestro captcha. Para esto crearemos un concern que se llamara `HcatpchaConcern` y tendrá el siguiente código:

```ruby
require 'net/http'

module HcaptchaConcern
  extend ActiveSupport::Concern

  def verify(params)
    uri = URI('https://hcaptcha.com/siteverify')
    res = Net::HTTP.post_form(uri, 'secret' => Rails.application.credentials.hcaptcha_secret_key,
                                   'response' => params['g-recaptcha-response'])

    response_data = JSON.parse(res.body)

    return if ActiveModel::Type::Boolean.new.cast(response_data['success'])

    flash[:notice] = 'hCaptcha could not be verify.'
    redirect_to request.referrer || root_path
  end
end
```

Ahora si en nuestro controlador usaremos este concern y verificaremos todo lo demás:

```ruby
class AuthenticationController < ApplicationController
  include HcaptchaConcern

  before_action -> { verify(params) }, only: :create

  def new; end

  def create
    session_params = params.permit(:email, :password)
    @user = User.find_by(email: session_params[:email])

    flash[:notice] = if @user && @user.authenticate(session_params[:password])
                       'Login is valid!'
                     else
                       'Login is invalid!'
                     end

    redirect_to root_path
  end
end
```

---

# Resultado

![](/assets/images/hcaptcha.gif)

---

Algunas cosas a tener en consideración:

- Si vas a desarrollar en localhost te recomiendo ver [esto.](https://docs.hcaptcha.com/#local-development)
- Puedes ver toda la documentación de hcaptcha [aquí](https://docs.hcaptcha.com/)

En conclusión, la integración de hCaptcha en tu aplicación Ruby on Rails ofrece una solución efectiva y ética para proteger tus páginas web de bots y preservar la privacidad en línea de tus usuarios. A diferencia de otras opciones, como reCaptcha de Google, hCaptcha se centra en la seguridad sin comprometer la identidad de los usuarios ni recopilar datos intrusivos. Al elegir hCaptcha, no solo estás protegiendo tu sitio web de amenazas automatizadas, sino que también estás contribuyendo a un entorno en línea más seguro y respetuoso con la privacidad de tus visitantes. Esta integración puede mejorar significativamente la experiencia de usuario y garantizar un acceso más seguro a tus servicios en línea.

## Actualización 26-02-2024

Al momento en que escribí este post me di cuenta de que algo no andaba bien. **Luego de un intento fallido en el login, el captcha no se vuelve a cargar de forma automática**. Ahora traigo la solución, un controlador de stimulus que renderiza el captcha al momento de cargarse en la página web, evento que sucede cada vez que se visita la página. Ya sea porque la persona entra por primera vez o porque fallo y fue redirigido de vuelta a la página. El controlador debería verse de la siguiente forma:

```javascript
import { Controller } from "@hotwired/stimulus";

// Connects to data-controller="login-form"
export default class extends Controller {
  static values = {
    hcaptchaSiteKey: String,
  };

  connect() {
    var widgetID = hcaptcha.render("captcha-1", {
      sitekey: this.hcaptchaSiteKeyValue,
    });
  }
}
```

Y nuestro formulario ahora debe implementar este controlador en alguna parte y pasar el valor del site key como un valor estático:

```erb

  <div class="mt-10" data-controller="login-form" data-login-form-hcaptcha-site-key-value="<%= Rails.application.credentials.hcaptcha_site_key %>">
    <%= form_with url: authentication_index_path do |f| %>
      <%= f.text_field :email, class: "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600" %><br>
      <%= f.password_field :password ,class: "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600" %><br>

      <!-- hCaptcha -->
      <div id="captcha-1" class="h-captcha" data-sitekey="<%= Rails.application.credentials.hcaptcha_site_key %>"></div>
      <script
        src="https://js.hcaptcha.com/1/api.js?render=explicit"
        async
        defer
      ></script>
      <!-- end hcaptchap -->

      <%= f.submit "Entrar", class: "flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" %>
    <% end %>
  </div>

```

Con eso hemos solucionado el problema. Happy coding.

