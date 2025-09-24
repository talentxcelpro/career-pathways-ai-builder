import React from 'react';
import { Helmet } from 'react-helmet-async';

interface VideoSchemaProps {
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration?: string; // ISO 8601 duration format (PT1H30M)
  uploadDate: string; // ISO date
  embedUrl?: string;
  transcript?: string;
  instructor?: {
    name: string;
    type: 'Person' | 'Organization';
    image?: string;
    jobTitle?: string;
  };
  category?: string;
  tags?: string[];
  inLanguage?: string;
}

export const VideoSchema: React.FC<VideoSchemaProps> = ({
  title,
  description,
  thumbnailUrl,
  videoUrl,
  duration,
  uploadDate,
  embedUrl,
  transcript,
  instructor,
  category = 'Educational',
  tags = [],
  inLanguage = 'en'
}) => {
  const videoSchema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": title,
    "description": description,
    "thumbnailUrl": thumbnailUrl,
    "contentUrl": videoUrl,
    "embedUrl": embedUrl || videoUrl,
    "uploadDate": uploadDate,
    "duration": duration,
    "inLanguage": inLanguage,
    "genre": category,
    "keywords": tags.join(', '),
    ...(transcript && { "transcript": transcript }),
    ...(instructor && {
      "author": {
        "@type": instructor.type,
        "name": instructor.name,
        ...(instructor.image && { "image": instructor.image }),
        ...(instructor.jobTitle && { "jobTitle": instructor.jobTitle })
      }
    }),
    "publisher": {
      "@type": "Organization",
      "name": "TalentXcel",
      "logo": {
        "@type": "ImageObject",
        "url": "https://talentxcel.in/logo.png"
      }
    },
    "potentialAction": {
      "@type": "WatchAction",
      "target": videoUrl
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(videoSchema)}
      </script>
      
      {/* Video-specific meta tags */}
      <meta property="og:video" content={videoUrl} />
      <meta property="og:video:type" content="video/mp4" />
      <meta property="og:video:width" content="1920" />
      <meta property="og:video:height" content="1080" />
      
      {/* Twitter video meta */}
      <meta name="twitter:player" content={embedUrl || videoUrl} />
      <meta name="twitter:player:width" content="1920" />
      <meta name="twitter:player:height" content="1080" />
      
      {/* Additional video meta */}
      <meta property="video:duration" content={duration} />
      <meta property="video:release_date" content={uploadDate} />
      {tags.map((tag, index) => (
        <meta key={index} property="video:tag" content={tag} />
      ))}
    </Helmet>
  );
};