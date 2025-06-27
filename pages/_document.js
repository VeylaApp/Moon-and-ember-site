
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet" />
      </Head>
      <body className="bg-black-veil text-ash-light font-body">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
