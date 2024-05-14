const { getService } = require("./get-service");

const { Translate } = require("@google-cloud/translate").v2;
const Bottleneck = require("bottleneck");

module.exports = {
  provider: "google",
  name: "Google",
  init(providerOptions = {}) {
    const translator = new Translate({
      credentials: {
        type: "service_account",
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url:
          "https://www.googleapis.com/oauth2/v1/certs",
        universe_domain: "googleapis.com",
        project_id: providerOptions.project_id,
        private_key_id: providerOptions.private_key_id,
        private_key: providerOptions.private_key,
        client_email: providerOptions.client_email,
        client_id: providerOptions.client_id,
        client_x509_cert_url: providerOptions.client_x509_cert_url,
      },
    });

    const limiter = new Bottleneck({
      minTime: 100,
      maxConcurrent: 5,
    });

    const rateLimitedTranslate = limiter.wrap(
      translator.translate.bind(translator)
    );

    return {
      async translate({ text, priority, sourceLocale, targetLocale, format }) {
        const chunksService = getService("chunks");

        let textArray = Array.isArray(text) ? text : [text];

        const { chunks, reduceFunction } = chunksService.split(textArray, {
          maxLength: providerOptions.maxTexts || 200,
          maxByteSize: providerOptions.maxRequestSize || 130000,
        });

        const result = reduceFunction(
          await Promise.all(
            chunks.map(async (texts) => {
              let [translations] = await rateLimitedTranslate(
                texts,
                targetLocale
              );
              return translations;
            })
          )
        );

        return result;
      },
      async usage() {},
    };
  },
};
