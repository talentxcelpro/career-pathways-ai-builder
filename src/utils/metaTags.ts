
interface MetaTagsConfig {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  type?: string;
}

export const updateMetaTags = (config: MetaTagsConfig) => {
  // Update document title
  if (config.title) {
    document.title = config.title;
  }

  // Update or create meta description
  if (config.description) {
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', config.description);
  }

  // Update Open Graph tags
  if (config.title) {
    updateOrCreateMetaTag('property', 'og:title', config.title);
  }
  
  if (config.description) {
    updateOrCreateMetaTag('property', 'og:description', config.description);
  }
  
  if (config.url) {
    updateOrCreateMetaTag('property', 'og:url', config.url);
  }
  
  if (config.image) {
    updateOrCreateMetaTag('property', 'og:image', config.image);
  }
  
  if (config.type) {
    updateOrCreateMetaTag('property', 'og:type', config.type);
  }

  // Update Twitter Card tags
  if (config.title) {
    updateOrCreateMetaTag('name', 'twitter:title', config.title);
  }
  
  if (config.description) {
    updateOrCreateMetaTag('name', 'twitter:description', config.description);
  }
  
  if (config.image) {
    updateOrCreateMetaTag('name', 'twitter:image', config.image);
  }
};

const updateOrCreateMetaTag = (attributeName: string, attributeValue: string, content: string) => {
  let metaTag = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
  if (!metaTag) {
    metaTag = document.createElement('meta');
    metaTag.setAttribute(attributeName, attributeValue);
    document.head.appendChild(metaTag);
  }
  metaTag.setAttribute('content', content);
};
