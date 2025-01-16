/* eslint-disable @typescript-eslint/no-non-null-assertion */
// Custom configurations for swox Cloud
// ====================================================================================
// Q: WHY THIS FILE EXISTS?
// A: swox deployment environment may have a lot of custom environment variables,
//    which are not suitable to be put in the `swox.ts` file.
//    For example, swox Cloud Clusters are deployed on Google Cloud Platform.
//    We need to enable the `gcloud` plugin to make sure the nodes working well,
//    but the default selfhost version may not require it.
//    So it's not a good idea to put such logic in the common `swox.ts` file.
//
//    ```
//    if (swox.deploy) {
//      swox.plugins.use('gcloud');
//    }
//    ```
// ====================================================================================
const env = process.env;

swox.metrics.enabled = !swox.node.test;

if (env.R2_OBJECT_STORAGE_ACCOUNT_ID) {
  swox.plugins.use('cloudflare-r2', {
    accountId: env.R2_OBJECT_STORAGE_ACCOUNT_ID,
    credentials: {
      accessKeyId: env.R2_OBJECT_STORAGE_ACCESS_KEY_ID!,
      secretAccessKey: env.R2_OBJECT_STORAGE_SECRET_ACCESS_KEY!,
    },
  });
  swox.storage.storages.avatar.provider = 'cloudflare-r2';
  swox.storage.storages.avatar.bucket = 'account-avatar';
  swox.storage.storages.avatar.publicLinkFactory = key =>
    `https://avatar.swoxassets.com/${key}`;

  swox.storage.storages.blob.provider = 'cloudflare-r2';
  swox.storage.storages.blob.bucket = `workspace-blobs-${
    swox.swox.canary ? 'canary' : 'prod'
  }`;

  swox.storage.storages.copilot.provider = 'cloudflare-r2';
  swox.storage.storages.copilot.bucket = `workspace-copilot-${
    swox.swox.canary ? 'canary' : 'prod'
  }`;
}

swox.plugins.use('copilot', {
  openai: {},
  fal: {},
});
swox.plugins.use('redis');
swox.plugins.use('payment', {
  stripe: {
    keys: {
      // fake the key to ensure the server generate full GraphQL Schema even env vars are not set
      APIKey: '1',
      webhookKey: '1',
    },
  },
});
swox.plugins.use('oauth');

if (swox.deploy) {
  swox.mailer = {
    service: 'gmail',
    auth: {
      user: env.MAILER_USER,
      pass: env.MAILER_PASSWORD,
    },
  };

  swox.plugins.use('gcloud');
}
