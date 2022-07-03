import Head from 'next/head';
import Layout from '../components/Layout';
export default function About() {
  return (
    <Layout home>
      <Head>
        <title>Ghosts</title>
      </Head>
      <p>About</p>
    </Layout>
  );
}
