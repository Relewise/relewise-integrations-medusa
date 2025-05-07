# Publish Plugin Locally for Development and Testing

To be able to run the following commands, you need to have yarn installed on your machine.

```W
npm install --global yarn
```

The first time you want to develop on the plugin, you need to publish the package into a local package registry, then install it in your Medusa application. This is a one-time only process.

```W
npx medusa plugin:publish
```

Run the following command from a Medusa Application to install the locally published plugin.

```W
npx medusa plugin:add @relewise/medusa
```

The plugin requires som options that we recommended you to store in a `.env` file.

```W
RELEWISE_DATASET_ID=
RELEWISE_API_KEY=
RELEWISE_SERVER_URL=
```

Fill the `RELEWISE_DATASET_ID`, `RELEWISE_API_KEY`, `RELEWISE_SERVER_URL` with your dataset, api-key and server-url found at [My.Relewise](https://my.relewise.com/developer-settings).

Remember to also add it to `plugins` in the `medusa-config.ts`.

```W
module.exports = defineConfig({
  // ...
  plugins: [
    {
      resolve: "@relewise/medusa",
      options: {
        datasetId: process.env.RELEWISE_DATASET_ID!,
        apiKey: process.env.RELEWISE_API_KEY!,
        serverUrl: process.env.RELEWISE_SERVER_URL!,
      },
    },
  ],
})
```

By default we map products to Relewise with `en` as the language.
The language can be configured by setting the language option.

```W
  // ..
  options: {
    // ...
    language: "some other language",
  }
```

While developing you can run the following command to watch for changes.
Your local Medusa Application using this plugin will automatically see updates.

```W
npx medusa plugin:develop
```

When working on Windows it is recommended to use `WSL` as some of these commands require `SPAWN` which is not supported on Windows.
