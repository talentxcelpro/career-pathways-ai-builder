import { useEffect } from 'react';

interface StructuredDataHookProps {
  schema: string;
  id?: string;
}

export const useStructuredData = ({ schema, id = 'structured-data' }: StructuredDataHookProps) => {
  useEffect(() => {
    // Remove existing structured data with same ID
    const existingScript = document.getElementById(id);
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data
    const script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    script.textContent = schema;
    document.head.appendChild(script);

    // Cleanup on unmount
    return () => {
      const scriptToRemove = document.getElementById(id);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [schema, id]);
};

// Convenience hook for multiple schemas
export const useMultipleStructuredData = (schemas: Array<{schema: string, id: string}>) => {
  useEffect(() => {
    // Remove existing scripts
    schemas.forEach(({ id }) => {
      const existingScript = document.getElementById(id);
      if (existingScript) {
        existingScript.remove();
      }
    });

    // Add new scripts
    schemas.forEach(({ schema, id }) => {
      const script = document.createElement('script');
      script.id = id;
      script.type = 'application/ld+json';
      script.textContent = schema;
      document.head.appendChild(script);
    });

    // Cleanup on unmount
    return () => {
      schemas.forEach(({ id }) => {
        const scriptToRemove = document.getElementById(id);
        if (scriptToRemove) {
          scriptToRemove.remove();
        }
      });
    };
  }, [schemas]);
};