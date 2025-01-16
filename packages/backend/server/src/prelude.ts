import 'reflect-metadata';

import { cpSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { config } from 'dotenv';
import { omit } from 'lodash-es';

import {
  applyEnvToConfig,
  getDefaultswoxConfig,
} from './fundamentals/config';

const configDir = join(fileURLToPath(import.meta.url), '../config');
async function loadRemote(remoteDir: string, file: string) {
  const filePath = join(configDir, file);
  if (configDir !== remoteDir) {
    cpSync(join(remoteDir, file), filePath, {
      force: true,
    });
  }

  await import(pathToFileURL(filePath).href);
}

async function load() {
  const swox_CONFIG_PATH = process.env.swox_CONFIG_PATH ?? configDir;
  // Initializing swox config
  //
  // 1. load dotenv file to `process.env`
  // load `.env` under pwd
  config();
  // load `.env` under user config folder
  config({
    path: join(swox_CONFIG_PATH, '.env'),
  });

  // 2. generate swox default config and assign to `globalThis.swox`
  globalThis.swox = getDefaultswoxConfig();

  // TODO(@forehalo):
  //   Modules may contribute to ENV_MAP, figure out a good way to involve them instead of hardcoding in `./config/swox.env`
  // 3. load env => config map to `globalThis.swox.ENV_MAP
  await loadRemote(swox_CONFIG_PATH, 'swox.env.js');

  // 4. load `config/swox` to patch custom configs
  await loadRemote(swox_CONFIG_PATH, 'swox.js');

  // 5. load `config/swox.self` to patch custom configs
  // This is the file only take effect in [swox Cloud]
  if (!swox.isSelfhosted) {
    await loadRemote(swox_CONFIG_PATH, 'swox.self.js');
  }

  // 6. apply `process.env` map overriding to `globalThis.swox`
  applyEnvToConfig(globalThis.swox);

  if (swox.node.dev) {
    console.log(
      'swox Config:',
      JSON.stringify(omit(globalThis.swox, 'ENV_MAP'), null, 2)
    );
  }
}

await load();
