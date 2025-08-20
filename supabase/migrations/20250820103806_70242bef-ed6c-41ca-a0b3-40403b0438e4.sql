-- Add sample college cover images and logos for existing colleges
UPDATE public.colleges 
SET 
  cover_image_url = CASE 
    WHEN name ILIKE '%IIT Delhi%' THEN 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=400&fit=crop'
    WHEN name ILIKE '%BHU%' OR name ILIKE '%Banaras%' THEN 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&h=400&fit=crop'
    WHEN name ILIKE '%VIT%' THEN 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=800&h=400&fit=crop'
    WHEN name ILIKE '%NIT%' THEN 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=400&fit=crop'
    WHEN name ILIKE '%Manipal%' THEN 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=400&fit=crop'
    WHEN name ILIKE '%BITS%' THEN 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop'
    WHEN name ILIKE '%Anna%' THEN 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=400&fit=crop'
    WHEN name ILIKE '%SRM%' THEN 'https://images.unsplash.com/photo-1568792923760-d70635a89fdc?w=800&h=400&fit=crop'
    WHEN name ILIKE '%Amity%' THEN 'https://images.unsplash.com/photo-1567427018141-0584cfcbf1b8?w=800&h=400&fit=crop'
    ELSE 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=400&fit=crop'
  END,
  logo_url = CASE 
    WHEN name ILIKE '%IIT Delhi%' THEN 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=120&h=120&fit=crop'
    WHEN name ILIKE '%BHU%' OR name ILIKE '%Banaras%' THEN 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=120&h=120&fit=crop'
    WHEN name ILIKE '%VIT%' THEN 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=120&h=120&fit=crop'
    WHEN name ILIKE '%NIT%' THEN 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=120&h=120&fit=crop'
    WHEN name ILIKE '%Manipal%' THEN 'https://images.unsplash.com/photo-1562774053-701939374585?w=120&h=120&fit=crop'
    WHEN name ILIKE '%BITS%' THEN 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=120&h=120&fit=crop'
    WHEN name ILIKE '%Anna%' THEN 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=120&h=120&fit=crop'
    WHEN name ILIKE '%SRM%' THEN 'https://images.unsplash.com/photo-1568792923760-d70635a89fdc?w=120&h=120&fit=crop'
    WHEN name ILIKE '%Amity%' THEN 'https://images.unsplash.com/photo-1567427018141-0584cfcbf1b8?w=120&h=120&fit=crop'
    ELSE 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=120&h=120&fit=crop'
  END
WHERE cover_image_url IS NULL OR logo_url IS NULL;