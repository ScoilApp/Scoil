/// <reference types="./global.d.ts" />
import './prelude';

import { Logger } from '@nestjs/common';

import { createApp } from './app';

const app = await createApp();
const listeningHost = swox.deploy ? '0.0.0.0' : 'localhost';
await app.listen(swox.port, listeningHost);

const logger = new Logger('App');

logger.log(`swox Server is running in [${swox.type}] mode`);
logger.log(`Listening on http://${listeningHost}:${swox.port}`);
logger.log(`And the public server should be recognized as ${swox.baseUrl}`);
