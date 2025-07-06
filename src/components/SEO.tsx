
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

const SEO: React.FC<SEOProps> = ({
  title = "OpportunityHub - Find Internships, Scholarships & Career Opportunities",
  description = "Discover thousands of internships, scholarships, contests, and career opportunities. Connect with top companies and educational institutions worldwide.",
  keywords = "internships, scholarships, jobs, career opportunities, contests, events, students, professionals, remote work, tech jobs",
  image = "/og-image.jpg",
  url,
  type = "website",
  author = "OpportunityHub Team",
  publishedTime,
  modifiedTime
}) => {
  const location = useLocation();
  const currentUrl = url || `https://opportunityhub.com${location.pathname}`;
  const fullImageUrl = image.startsWith('http') ? image : `https://opportunityhub.com${image}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="OpportunityHub" />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:site" content="@opportunityhub" />
      <meta name="twitter:creator" content="@opportunityhub" />

      {/* Article specific tags */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}

      {/* Additional SEO Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Language" content="en" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "OpportunityHub",
          "url": "https://opportunityhub.com",
          "description": description,
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://opportunityhub.com/opportunities?search={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        })}
      </script>
    </Helmet>
  );
};

export default SEO;
