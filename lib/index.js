const { getService } = require("./get-service");

const { Translate } = require("@google-cloud/translate").v2;
const Bottleneck = require("bottleneck");

const DEFAULT_PRIORITY = 3;
const DEFAULT_MAX_TEXT = 200;
const DEFAULT_MAX_REQUEST_SIZE = 130000;

module.exports = {
  provider: "googleapi",
  name: "Cloud Translate Google API",
  init(providerOptions = {}) {
    const apiOptions =
      typeof providerOptions.apiOptions === "object"
        ? providerOptions.apiOptions
        : {};

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
      async (text, target) => await translator.translate(text, target)
    );

    return {
      async translate({ text, priority, sourceLocale, targetLocale, format }) {
        if (!text) {
          return [];
        }
        if (!sourceLocale || !targetLocale) {
          throw new Error("source and target locale must be defined");
        }

        const textFormat = format === "plain" ? format : "html";

        const chunksService = getService("chunks");

        let textArray = Array.isArray(text) ? text : [text];

        if (format === "markdown") {
          textArray = formatService.markdownToHtml(textArray);
        }

        const { chunks, reduceFunction } = chunksService.split(textArray, {
          maxLength: providerOptions.maxTexts || DEFAULT_MAX_TEXT,
          maxByteSize:
            providerOptions.maxRequestSize || DEFAULT_MAX_REQUEST_SIZE,
        });

        const result = reduceFunction(
          await Promise.all(
            chunks.map(async (texts) => {
              let [translations] = await rateLimitedTranslate.withOptions(
                {
                  priority:
                    typeof priority == "number"
                      ? priority
                      : providerOptions.priority || DEFAULT_PRIORITY,
                },
                texts,
                targetLocale,
                {
                  ...apiOptions,
                  textFormat,
                }
              );
              return translations;
            })
          )
        );

        if (format === "markdown") {
          return formatService.htmlToMarkdown(result);
        }

        return result;
      },
      async usage() {},
    };
  },
};
