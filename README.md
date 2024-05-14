# Cloud Translate API provider for Strapi Translate Plugin

## 💻 Prerequisites

Before you begin, make sure you've met the following requirements:

- Strapi 4 (last tested version: 4.24.2)
- Install plugin [Strapi Plugin Translate](https://market.strapi.io/plugins/strapi-plugin-translate)
- Enable Cloud Translation API on Google Cloud Console. (API & Services)
- Generate Google service account

## 🚀 Installation

```
npm install strapi-provider-translate-google
```

or:

```
yarn add strapi-provider-translate-google
```

## ☕ Configuration

- Set env variables on Strapi .env

```env
STRAPI_GOOGLE_PROJECT_ID=
STRAPI_GOOGLE_PRIVATE_KEY_ID=
STRAPI_GOOGLE_PRIVATE_KEY=
STRAPI_GOOGLE_CLIENT_EMAIL=
STRAPI_GOOGLE_CLIENT_ID=
STRAPI_GOOGLE_CLIENT_X509_CERT_URL=,
```

### Javascript:

- Path: config/plugins.[t|j]s

```js
module.exports = {
  //...
  translate: {
    enabled: true,
    config: {
      provider: "google",
      providerOptions: {
        project_id: env("STRAPI_GOOGLE_PROJECT_ID"),
        private_key_id: env("STRAPI_GOOGLE_PRIVATE_KEY_ID"),
        private_key: env("STRAPI_GOOGLE_PRIVATE_KEY"),
        client_email: env("STRAPI_GOOGLE_CLIENT_EMAIL"),
        client_id: env("STRAPI_GOOGLE_CLIENT_ID"),
        client_x509_cert_url: env("STRAPI_GOOGLE_CLIENT_X509_CERT_URL"),
      },
      translatedFieldTypes: [
        "string",
        { type: "text", format: "plain" },
        // Change format to markdown if default richtext field on Strapi
        { type: "richtext", format: "html" },
        "component",
        "dynamiczone",
      ],
      translateRelations: true,
    },
  },
  //...
};
```

- Run commands

```
 npm run build && npm run develop
```

## 📝 Licença

This project is under license. See the [LICENSE](LICENSE.md) file for more details.
