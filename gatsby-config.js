module.exports = {
  plugins: [
    'gatsby-plugin-sass',
    {
      resolve: `gatsby-plugin-google-fonts`,
      options: {
        fonts: [
          `open sans\:300,600`
        ]
      }
    },
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: "<your-tracking-id-here>",
        head: true
      }
    },
  ],
  siteMetadata: {
    title: 'Matvii Hodovaniuk',
    description: 'Full stack product enginner',
    keywords: 'full stack, product enginner, portfolio, personal website',
    url: 'https://matvii.hodovani.uk'
  }
};
