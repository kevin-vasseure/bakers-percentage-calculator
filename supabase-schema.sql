-- Baker's Percentage Calculator Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create recipes table
CREATE TABLE recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    notes TEXT,
    is_public BOOLEAN DEFAULT false,
    total_weight INTEGER DEFAULT 0,
    slug TEXT UNIQUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ingredients table
CREATE TABLE ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    is_flour BOOLEAN DEFAULT false,
    amount DECIMAL(10,2) DEFAULT 0,
    percentage DECIMAL(5,2) DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recipe collections table
CREATE TABLE recipe_collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create recipe collection items table (many-to-many)
CREATE TABLE recipe_collection_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    collection_id UUID NOT NULL REFERENCES recipe_collections(id) ON DELETE CASCADE,
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(collection_id, recipe_id)
);

-- Create indexes for performance
CREATE INDEX recipes_user_id_idx ON recipes(user_id);
CREATE INDEX recipes_slug_idx ON recipes(slug);
CREATE INDEX recipes_is_public_idx ON recipes(is_public);
CREATE INDEX ingredients_recipe_id_idx ON ingredients(recipe_id);
CREATE INDEX ingredients_sort_order_idx ON ingredients(recipe_id, sort_order);
CREATE INDEX recipe_collections_user_id_idx ON recipe_collections(user_id);
CREATE INDEX recipe_collection_items_collection_id_idx ON recipe_collection_items(collection_id);
CREATE INDEX recipe_collection_items_recipe_id_idx ON recipe_collection_items(recipe_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_ingredients_updated_at BEFORE UPDATE ON ingredients FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_recipe_collections_updated_at BEFORE UPDATE ON recipe_collections FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_collection_items ENABLE ROW LEVEL SECURITY;

-- Recipes policies
CREATE POLICY "Users can view public recipes" ON recipes FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can insert their own recipes" ON recipes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own recipes" ON recipes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own recipes" ON recipes FOR DELETE USING (auth.uid() = user_id);

-- Ingredients policies (inherit from recipe permissions)
CREATE POLICY "Users can view ingredients of viewable recipes" ON ingredients FOR SELECT
USING (EXISTS (
    SELECT 1 FROM recipes
    WHERE recipes.id = ingredients.recipe_id
    AND (recipes.is_public = true OR recipes.user_id = auth.uid())
));

CREATE POLICY "Users can manage ingredients of their own recipes" ON ingredients FOR ALL
USING (EXISTS (
    SELECT 1 FROM recipes
    WHERE recipes.id = ingredients.recipe_id
    AND recipes.user_id = auth.uid()
));

-- Recipe collections policies
CREATE POLICY "Users can view public collections" ON recipe_collections FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can manage their own collections" ON recipe_collections FOR ALL USING (auth.uid() = user_id);

-- Recipe collection items policies
CREATE POLICY "Users can view public collection items" ON recipe_collection_items FOR SELECT
USING (EXISTS (
    SELECT 1 FROM recipe_collections
    WHERE recipe_collections.id = recipe_collection_items.collection_id
    AND (recipe_collections.is_public = true OR recipe_collections.user_id = auth.uid())
));

CREATE POLICY "Users can manage their own collection items" ON recipe_collection_items FOR ALL
USING (EXISTS (
    SELECT 1 FROM recipe_collections
    WHERE recipe_collections.id = recipe_collection_items.collection_id
    AND recipe_collections.user_id = auth.uid()
));

-- Function to generate unique slugs
CREATE OR REPLACE FUNCTION generate_slug(title TEXT)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Create base slug from title
    base_slug := LOWER(REGEXP_REPLACE(TRIM(title), '[^a-zA-Z0-9]+', '-', 'g'));
    base_slug := REGEXP_REPLACE(base_slug, '^-+|-+$', '', 'g');

    -- Limit length
    base_slug := SUBSTR(base_slug, 1, 50);

    final_slug := base_slug;

    -- Check for uniqueness and add counter if needed
    WHILE EXISTS (SELECT 1 FROM public.recipes WHERE slug = final_slug) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;

    RETURN final_slug;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- Trigger to auto-generate slugs for recipes
CREATE OR REPLACE FUNCTION auto_generate_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := generate_slug(NEW.title);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

CREATE TRIGGER recipes_auto_slug BEFORE INSERT ON recipes FOR EACH ROW EXECUTE PROCEDURE auto_generate_slug();
