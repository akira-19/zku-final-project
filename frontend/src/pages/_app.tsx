import type { AppProps } from 'next/app';
import Head from 'next/head';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>EasyLink</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Component {...pageProps} />
      {/* <GlobalContextProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </GlobalContextProvider> */}
    </>
  );
}

export default MyApp;
