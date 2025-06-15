import { Helmet } from 'react-helmet';

interface SeoProps {
  title?: string;
  description?: string;
}

export const Seo = ({
  title = 'ADHD Wordle by Noro',
  description = 'Play Wordle with ADHD twists and join the Noro wait-list.',
}: SeoProps) => {
  const plausibleDomain = import.meta.env.VITE_PLAUSIBLE_DOMAIN as string | undefined;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />

      {/* OpenGraph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content="/og.png" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content="/og.png" />
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
