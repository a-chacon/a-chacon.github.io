var app = document.getElementById('app');

var typewriter = new Typewriter(app, {
  loop: false,
  delay: 75,
});

typewriter
  .pauseFor(1000)
  .typeString('Hello, <strong>World!</strong>')
  .pauseFor(5000)
  .deleteChars(13)
  .typeString('¡Hola, <strong>Mundo!</strong>')
  .pauseFor(3000)
  .changeDeleteSpeed(40)
  .deleteChars(13)
  .typeString('Bonjour <strong>le monde!</strong>')
  .pauseFor(1000)
  .changeDeleteSpeed(25) 
  .deleteChars(17)
  .changeDelay(45)
  .typeString('Olá, <strong>mundo!</strong>')
  .pauseFor(500)
  .changeDeleteSpeed(20)
  .deleteChars(11)
  .changeDelay(20)
  .typeString('Здравствуй, <strong>мир</strong>')
  .pauseFor(250)
  .changeDeleteSpeed(15)
  .deleteChars(15)
  .typeString('Hallo Welt')
  .pauseFor(100)
  .changeDeleteSpeed(5)
  .deleteChars(10)
  .changeDelay(5)
  .typeString("สวัสดีชาวโลก")
  .pauseFor(50)
  .changeDeleteSpeed(1)
  .deleteChars(12)
  .typeString('世界您好！')
  .pauseFor(2000)
  .deleteChars(5)
  .changeDelay(75)
  .typeString('Hello, <strong>World!</strong>')
  .start();

