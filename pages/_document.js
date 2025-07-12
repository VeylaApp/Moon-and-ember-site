// pages/_document.js

import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap"
          rel="stylesheet"
        />

        {/* PWA Manifest and Icons */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#204e39" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </Head>
      <body className="bg-black-veil text-ash-light font-body">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
