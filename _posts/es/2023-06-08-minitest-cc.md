---
layout: post
title: >-
  Minitest-cc: Una forma minimalista de saber cuál es la cobertura de código de
  tus tests.
categories:
  - On Rails
excerpt: >-
  Ministest-cc es un plug-in liviano y simple para el framework Minitest que
  aporta una salida sobre la cobertura de código que tienen tus pruebas. Aquí
  veremos como instalarlo y como funciona.
image: /assets/images/ruby.webp
lang: es
time: 2 min
author: Andrés
comments: true
---
Cuando se trata de Code Coverage en Ruby todos piensan en SimpleCov. La gema que entrega un reporte completo sobre la cobertura y puedes ver los detalles en archivos HTML que crea en tu proyecto. Pero cuando se trata de solo tener una referencia sobre tu cobertura y no incluir más archivos y configuraciones a tu proyecto, es donde viene a trabajar esta gema/plug-in para Minitest.

La idea es hacer un reporte lo más simple posible, sin persistencia, que sirva como referencia al momento de estar desarrollando. En cada ejecución de tu suit de tests, ya sea en general o por archivo específico, puedes ver cuál es la cobertura luego de que la ejecución termine.

Para instalar la gema es tan fácil como agregarla a tu Gemfile:

```ruby
gem 'minitest-cc'
```

Agregar las siguientes líneas al principio de tu archivo `test_helper.rb`:

```ruby
require 'minitest/cc'
Minitest::Cc.start
```

Después de ejecutar tus tests deberías ver una salida como la siguiente:

```bash
Running 8 tests in a single process (parallelization threshold is 50)
Run options: --seed 26716

# Running:

........

# Coverage:

Lines: 100.0%   Branches: 50.0% Methods: 100.0%

Average: 83.33%


Finished in 0.823512s, 9.7145 runs/s, 10.9288 assertions/s.
8 runs, 9 assertions, 0 failures, 0 errors, 0 skips
```

Y eso es todo. Hay dos cosas importantes que puedes configurar:

- La salida en forma de resumen o detallada por archivos (Si tu proyecto es muy grande no lo recomiendo)
- Ruta de archivos que comprobar si son ejecutados

Aquí hay un ejemplo de como se podrían aplicar estas configuraciones:

```ruby
Minitest::Cc.start(:lines, :branches, :methods)
Minitest::Cc.tracked_files = [
  './app/\*\*/\*.rb',
  './lib/\*\*/\*.rb'
]
Minitest::Cc.cc_mode = :per_file
```

En conclusión, Minitest-cc es una opción simple y fácil de usar para obtener una referencia general sobre la cobertura que tienen tus tests.

