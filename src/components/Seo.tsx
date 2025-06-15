import { Helmet } from 'react-helmet';

interface SeoProps {
  title?: string;
  description?: string;
  image?: string;
}

export const Seo = ({
  title = 'ADHD Wordle by Noro',
  description = 'Play Wordle with ADHD twists and join the Noro wait-list.',
  image = '/og.png',
}: SeoProps) => {
  const plausibleDomain = import.meta.env.VITE_PLAUSIBLE_DOMAIN as string | undefined;
  return (
    <Helmet>
      <link rel="icon" href="/favicon.png" type="image/png" />
      <title>{title}</title>
      <meta name="description" content={description} />

      {/* OpenGraph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      {plausibleDomain && (
        <script
          async
          defer
          data-domain={plausibleDomain}
          src="https://plausible.io/js/plausible.js"
        ></script>
      )}
    </Helmet>
  );
};
