/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  transpilePackages: ['@tomo-inc/tomo-evm-kit'],
  webpack: (
    /** @type {import('webpack').Configuration} */
    config,
  ) => {
    // config.externals.push('pino-pretty', 'lokijs', 'encoding');
    config.resolve.alias = {
      ...config.resolve.alias,
      crypto: 'crypto-browserify',
      https: 'https-browserify',
      http: 'http-browserify',
    };
    return config;
  },
  output: 'export',
  images: {
    unoptimized: true,
  },
  // i18n: {
  //   defaultLocale: 'en-US',
  //   locales: [
  //     'ar-AR',
  //     'de-DE',
  //     'en-US',
  //     'es-419',
  //     'fr-FR',
  //     'hi-IN',
  //     'id-ID',
  //     'ja-JP',
  //     'ko-KR',
  //     'ms-MY',
  //     'pt-BR',
  //     'ru-RU',
  //     'th-TH',
  //     'tr-TR',
  //     'uk-UA',
  //     'vi-VN',
  //     'zh-CN',
  //     'zh-HK',
  //     'zh-TW',
  //   ],
  // },
};
