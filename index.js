const cluster = require('cluster');
const compression = require('compression');
const cors = require('cors');
const express = require('express');
const rateLimit = require('express-rate-limit');
const secure = require('express-secure-only');
const helmet = require('helmet');
const nocache = require('nocache');
const { cpus, platform } = require('os');

(async () => {
  const app = express();

  app.enable('strict routing');
  app.enable('trust proxy');

  if (process.env.NODE_ENV === 'production') {
    app.use(secure());
  }

  app.use(cors());
  app.use(helmet({ frameguard: false, contentSecurityPolicy: true, xssFilter: true }));
  app.use(compression());
  app.use(nocache());
  app.use(rateLimit({ max: 0 }));

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  app.use(express.text());

  app.post('/api/messages', async (req, res) => {
    return res.status(200).json({ status: 200, endpoint: '/api/messages' });
  });

  app.get('/api/messages', async (req, res) => {
    return res.status(200).json({ status: 200, endpoint: '/api/messages' });
  });

  app.get('/test/more/test', async (req, res) => {
    return res.status(200).json({ status: 200, endpoint: '/test/more/test' });
  });

  app.get('/status', (req, res) => {
    return res.status(200).json({ status: 200, endpoint: '/status' });
  });

  // TODO: clusters/workes are not working on Azure Windows based App Services
  if ((cluster.isPrimary || cluster.isMaster) && process.env.NODE_ENV === 'production' && platform() === 'linux') {
    console.info(`[CLUSTER][PRIMARY] ${process.pid} is running`);

    for (let i = 0; i < cpus().length; i++) {
      cluster.fork();
    }

    cluster.on('exit', (worker) => {
      console.error(`[CLUSTER][WORKER] ${worker.process.pid} died`);
      cluster.fork();
    });
  } else {
    app.listen(process.env.PORT || 3000, () => {
      console.info(`[CLUSTER][WORKER] ${process.pid} is running on port: ${process.env.PORT || 3000}`);
    });
  }
})();
