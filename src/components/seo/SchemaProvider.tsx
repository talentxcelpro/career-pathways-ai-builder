// ============= GLOBAL SCHEMA PROVIDER =============
// Provides schema markup across the entire application

import React, { createContext, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSchemaMarkup } from '@/hooks/useSchemaMarkup';

interface SchemaContextType {
  addSchema: (type: string, data: any, id?: string) => void;
  removeSchema: (id: string) => void;
  updatePageSchema: (type: string, data?: any) => void;
}

const SchemaContext = createContext<SchemaContextType | null>(null);

interface SchemaProviderProps {
  children: React.ReactNode;
}

export const SchemaProvider: React.FC<SchemaProviderProps> = ({ children }) => {
  const location = useLocation();
  const { addCustomSchema, removeSchema, generatePageSchemas } = useSchemaMarkup({
    pageType: 'website',
    enableWebsiteSchema: true
  });

  useEffect(() => {
    // Add global website schema on app load
    generatePageSchemas();
  }, [location.pathname]);

  const updatePageSchema = (type: string, data?: any) => {
    // This will be used by individual pages to update their schema
    const schemaHook = useSchemaMarkup({
      pageType: type,
      data,
      enableWebsiteSchema: false // Don't duplicate website schema
    });
    schemaHook.generatePageSchemas();
  };

  return (
    <SchemaContext.Provider
      value={{
        addSchema: addCustomSchema,
        removeSchema,
        updatePageSchema
      }}
    >
      {children}
    </SchemaContext.Provider>
  );
};

export const useSchema = () => {
  const context = useContext(SchemaContext);
  if (!context) {
    throw new Error('useSchema must be used within a SchemaProvider');
  }
  return context;
};