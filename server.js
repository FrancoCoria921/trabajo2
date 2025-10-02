'use strict';
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');

const apiRoutes = require('./routes/api.js');
const fccTestingRoutes = require('./routes/fcctesting.js');

const app = express();

// --- Conexión a la Base de Datos ---
mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conexión exitosa a MongoDB'))
  .catch(err => console.error('Error de conexión a MongoDB:', err));

// --- Middleware y Seguridad ---
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: '*' }));

// Medidas de seguridad usando Helmet
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'"],
    scriptSrc: ["'self'"]
  }
}));
app.use(helmet.xssFilter());
app.use(helmet.noSniff());
app.use(helmet.ieNoOpen());

// --- Rutas Estáticas y Vistas ---
app.use('/public', express.static(process.cwd() + '/public'));

// Rutas de testing de FreeCodeCamp
fccTestingRoutes(app);

// Ruta principal
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

// Ruta para la vista de un Tablero
app.route('/b/:board/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/board.html');
  });

// Ruta para la vista de un Hilo
app.route('/b/:board/:thread_id')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/thread.html');
  });

// --- Rutas de la API ---
apiRoutes(app);

// Manejador de error para rutas no encontradas
app.use(function(req, res, next) {
  res.status(404).type('text').send('Not Found');
});

// --- Iniciar el Servidor ---
const listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Tu aplicación está escuchando en el puerto ' + listener.address().port);
});

module.exports = app;
