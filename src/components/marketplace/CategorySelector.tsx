import { useState } from "react";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useServiceCategoriesWithSubcategories, useServiceSubcategoriesByParent } from "@/hooks/useServiceCategories";
import { ServiceCategory } from "@/types/service";

interface CategorySelectorProps {
  selectedCategoryId?: string;
  selectedSubcategoryId?: string;
  onCategoryChange: (categoryId: string, category: ServiceCategory) => void;
  onSubcategoryChange: (subcategoryId: string, subcategory: ServiceCategory) => void;
  className?: string;
}

export const CategorySelector = ({
  selectedCategoryId,
  selectedSubcategoryId,
  onCategoryChange,
  onSubcategoryChange,
  className = ""
}: CategorySelectorProps) => {
  const { data: categories, isLoading } = useServiceCategoriesWithSubcategories();
  const { data: subcategories } = useServiceSubcategoriesByParent(selectedCategoryId || null);

  const selectedCategory = categories?.find(cat => cat.id === selectedCategoryId);
  const selectedSubcategory = subcategories?.find(sub => sub.id === selectedSubcategoryId);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Category Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Label htmlFor="category" className="text-base font-medium text-foreground/90">
          Service Category *
        </Label>
        <Select
          value={selectedCategoryId}
          onValueChange={(value) => {
            const category = categories?.find(cat => cat.id === value);
            if (category) {
              onCategoryChange(value, category);
            }
          }}
        >
          <SelectTrigger className="mt-2 h-12 border-border bg-card/50 backdrop-blur-sm">
            <SelectValue placeholder="Select a service category" />
          </SelectTrigger>
          <SelectContent className="bg-card/95 backdrop-blur-sm border-border">
            {categories?.map((category) => (
              <SelectItem 
                key={category.id} 
                value={category.id}
                className="hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{category.icon_emoji}</span>
                  <span>{category.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {selectedCategory && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="mt-2"
          >
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              {selectedCategory.icon_emoji} {selectedCategory.name}
            </Badge>
          </motion.div>
        )}
      </motion.div>

      {/* Subcategory Selection */}
      {selectedCategoryId && subcategories && subcategories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Label htmlFor="subcategory" className="text-base font-medium text-foreground/90">
            Specific Service Type
          </Label>
          <Select
            value={selectedSubcategoryId}
            onValueChange={(value) => {
              const subcategory = subcategories.find(sub => sub.id === value);
              if (subcategory) {
                onSubcategoryChange(value, subcategory);
              }
            }}
          >
            <SelectTrigger className="mt-2 h-12 border-border bg-card/50 backdrop-blur-sm">
              <SelectValue placeholder="Select a specific service type" />
            </SelectTrigger>
            <SelectContent className="bg-card/95 backdrop-blur-sm border-border">
              {subcategories.map((subcategory) => (
                <SelectItem 
                  key={subcategory.id} 
                  value={subcategory.id}
                  className="hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{subcategory.icon_emoji}</span>
                    <div>
                      <div className="font-medium">{subcategory.name}</div>
                      {subcategory.description && (
                        <div className="text-sm text-muted-foreground">{subcategory.description}</div>
                      )}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedSubcategory && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="mt-2"
            >
              <Badge variant="outline" className="bg-secondary/10 text-secondary-foreground border-secondary/20">
                {selectedSubcategory.icon_emoji} {selectedSubcategory.name}
              </Badge>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Category Description */}
      {selectedCategory && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="p-4 bg-primary/5 rounded-lg border border-primary/10"
        >
          <div className="flex items-start space-x-3">
            <span className="text-2xl">{selectedCategory.icon_emoji}</span>
            <div>
              <h3 className="font-medium text-foreground/90">{selectedCategory.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{selectedCategory.description}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};