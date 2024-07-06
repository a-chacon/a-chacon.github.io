---
layout: post
title: >-
  authenticate_by: Prevenir la enumeración de usuarios basada en tiempos de
  respuestas.
category:
  - On Rails
excerpt: >-
  Con la introducción de authenticate_by en Rails 7.1, ahora podemos prevenir
  los ataques de enumeración basados en tiempos de respuesta.
image: /assets/images/rails-authenticate-by.png
lang: es
time: 5 min
author: Andrés
comments: true
redirect_from:
  - >-
    /ruby/rails/security/2024/04/18/authenticate-by-for-prevent-timing-based-enumeration-in-rails.html
---
Digamos que tenemos un endpoint simple en nuestra aplicación Rails para que nuestros usuarios entren a la plataforma:

```ruby
 def create
    user = User.find_by()
    if user && user.authenticate(params[:password])
      log_in user
      redirect_to user
    else
      flash.now[:danger] = 'Combinación de email/password incorrecta'
      render 'new'
    end
  end
```

El código anterior se ve bien, es funcional, y probablemente has seguido una lógica muy parecida para los inicios de sesión que has programado hasta ahora. Pero tiene un problema de seguridad: la condicional `if` no tomará el mismo tiempo de respuesta si es que el usuario no existe o si es que el usuario existe, pero la contraseña no es la correcta.

## Ataques de enumeración basados en tiempo

Un ataque de enumeración basado en tiempos de respuestas es lo que mostré anteriormente. Un atacante podrá probar correos electrónicos mediante fuerza bruta y será capaz de darse cuenta cuando un correo existe o no en nuestra base de datos analizando los tiempos de respuesta de nuestra aplicación web o más bien de la petición http.

Un ejemplo bien simple utilizando el código anterior nos daría tiempos de respuestas como estos:

![Tiempos de respuesta sin authenticate_by](/assets/images/response-time-simple-test.png)

En azul estarían los intentos de login fallidos con usuarios y contraseñas que no son correctos. En rojo estarían los intentos donde el usuario sí existe, pero no sabemos la contraseña. Como podemos ver, las diferencias en los tiempos de respuesta son notables.

Si estuviéramos en la posición de un atacante y probamos 1000 correos, donde la mayoría de las respuestas nos son entre 20 y 30 ms, pero solo una nos da 200 ms de respuesta, entonces sabríamos que algo encontramos ahí.

## authenticate_by

En Rails 7.1 fue [introducido](https://github.com/rails/rails/pull/43765) un nuevo método llamado `authenticate_by` con el fin de prevenir este tipo de vector de ataque en nuestras aplicaciones Rails respondiendo con un tiempo similar si es que él usuario existe o no en nuestra base de datos.

Antes de `authenticate_by`:

```ruby
User.find_by(email: "...")&.authenticate("...")
```

Después de `authenticate_by`:

```ruby
User.authenticate_by(email: "...", password: "...")
```

Ahora, si llevamos esto a nuestro ejemplo anterior, entonces nuestro código podría verse de la siguiente forma:

```ruby
  def create
    if user = User.authenticate_by(email: params[:email], password: params[:password])
      log_in user
      redirect_to '/home'
    else
      flash[:notice] = 'Combinación de email/password incorrecta'
      p 'HERE'
      redirect_to root_path
    end
  end
```

Realizando las mismas pruebas desde el navegador tenemos estas muestras en cuanto a los tiempos de respuesta:

![Tiempos de respuesta implementando authenticate_by](/assets/images/response-time-simple-test-with-authenticate-by.png)

Y como podemos ver, tanto las peticiones con correos electrónicos que existen como los que no existen en nuestra base de datos responden con tiempos similares (215..245 ms) haciendo imposible la enumeración de cuentas mediante el tiempo de respuesta.

Esto es en un escenario óptimo, este método no maneja toda la lógica de negocio y puede que en [ciertos casos](https://github.com/rails/rails/pull/43997#issuecomment-1001064483) como por ejemplo si quieres controlar los intentos de ingresos fallidos en una cuenta agregues código que produzca una diferencia de tiempo notable y nuevamente se pueda producir un ataque de enumeración basado en tiempos de respuesta.

## Y, ¿Cómo funciona authenticate_by?

Para los más curiosos, `authenticate_by` tiene una [definición](https://github.com/jonathanhefner/rails/blob/9becc41df989bfccff091852d45925d41f0a13d8/activerecord/lib/active_record/secure_password.rb) no muy compleja, donde la clave reside en el `if` de la línea 45:

```ruby
if record = find_by(attributes.except(*passwords.keys))
  record if passwords.count { |name, value| record.public_send(:"authenticate_#{name}", value) } == passwords.size
else
  self.new(passwords)
  nil
end
```

Lo que hace acá es muy parecido a lo que se hacía anteriormente con`Customer.find_by(email: "...")&.authenticate("...")`, pero en el caso de que el usuario no es encontrado, o sea en el bloque `else`, llama al método `new` para generar una nueva instancia de la clase pasando como parámetros las contraseñas que se están usando en el intento de login. Esto fuerza a que **aunque ningún registro fue encontrado se deban cifrar las contraseñas igualmente**, lo que da como resultado un tiempo similar de respuesta a que si él registro fue encontrado y las contraseñas debieron ser cifradas para comparar los hashs.

## Conclusiones

Para concluir, es importante tener en cuenta que, como menciona el [autor del PR](https://github.com/rails/rails/pull/43997#issue-1088633524), authenticate_by no garantiza que el tiempo de autenticación siempre sea constante, especialmente si la columna de nombre de usuario no está respaldada por un índice. A pesar de ello, esta adición representa un gran avance para nuestras aplicaciones al evitar la posibilidad de ataques de enumeración basados en el tiempo. En última instancia, nos proporciona una capa adicional de seguridad en un aspecto crítico de nuestras aplicaciones web.

_Happy Coding!_

