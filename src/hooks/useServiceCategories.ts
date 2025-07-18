import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ServiceCategory } from "@/types/service";

export const useServiceCategories = () => {
  return useQuery({
    queryKey: ["service-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_categories")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as ServiceCategory[];
    },
  });
};

export const useServiceCategoriesWithSubcategories = () => {
  return useQuery({
    queryKey: ["service-categories-with-subcategories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_categories")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;

      const categories = data as ServiceCategory[];
      
      // Group categories by parent_id
      const mainCategories = categories.filter(cat => !cat.parent_id);
      const subcategories = categories.filter(cat => cat.parent_id);
      
      // Add subcategories to their parent categories
      return mainCategories.map(category => ({
        ...category,
        subcategories: subcategories.filter(sub => sub.parent_id === category.id)
      }));
    },
  });
};

export const useServiceCategoryById = (categoryId: string | null) => {
  return useQuery({
    queryKey: ["service-category", categoryId],
    queryFn: async () => {
      if (!categoryId) return null;
      
      const { data, error } = await supabase
        .from("service_categories")
        .select("*")
        .eq("id", categoryId)
        .single();

      if (error) throw error;
      return data as ServiceCategory;
    },
    enabled: !!categoryId,
  });
};

export const useServiceSubcategoriesByParent = (parentId: string | null) => {
  return useQuery({
    queryKey: ["service-subcategories", parentId],
    queryFn: async () => {
      if (!parentId) return [];
      
      const { data, error } = await supabase
        .from("service_categories")
        .select("*")
        .eq("parent_id", parentId)
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as ServiceCategory[];
    },
    enabled: !!parentId,
  });
};