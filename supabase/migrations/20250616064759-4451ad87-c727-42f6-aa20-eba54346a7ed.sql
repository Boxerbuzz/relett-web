
-- Create a table for available trees for donation
CREATE TABLE public.trees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  scientific_name TEXT,
  description TEXT,
  image_url TEXT NOT NULL,
  location TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Nigeria',
  price_ngn INTEGER NOT NULL, -- Price in kobo (NGN * 100)
  carbon_offset_kg NUMERIC DEFAULT 0, -- CO2 absorption per year in kg
  growth_time_years INTEGER DEFAULT 0, -- Time to maturity
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create a table for tree donations
CREATE TABLE public.tree_donations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tree_id UUID NOT NULL REFERENCES public.trees(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  total_amount_ngn INTEGER NOT NULL, -- Total amount in kobo
  payment_reference TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_provider TEXT NOT NULL DEFAULT 'paystack',
  planted_at TIMESTAMP WITH TIME ZONE,
  certificate_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.trees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tree_donations ENABLE ROW LEVEL SECURITY;

-- Trees are public for viewing
CREATE POLICY "Trees are viewable by everyone" 
  ON public.trees 
  FOR SELECT 
  USING (true);

-- Only authenticated users can view their own donations
CREATE POLICY "Users can view their own tree donations" 
  ON public.tree_donations 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Only authenticated users can create donations
CREATE POLICY "Users can create their own tree donations" 
  ON public.tree_donations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Only authenticated users can update their own donations
CREATE POLICY "Users can update their own tree donations" 
  ON public.tree_donations 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Seed the trees table with some Nigerian trees
INSERT INTO public.trees (name, scientific_name, description, image_url, location, price_ngn, carbon_offset_kg, growth_time_years) VALUES
('Nigerian Mahogany', 'Khaya ivorensis', 'A beautiful hardwood tree native to West Africa, known for its valuable timber and environmental benefits.', 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9', 'Lagos State Forest Reserve', 500000, 25, 15),
('African Tulip Tree', 'Spathodea campanulata', 'A fast-growing tree with bright orange flowers, excellent for reforestation and urban landscaping.', 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86', 'Ogun State Forest Reserve', 300000, 20, 8),
('Nigerian Teak', 'Tectona grandis', 'A premium hardwood tree that grows well in Nigerian climate, valuable for both timber and carbon sequestration.', 'https://images.unsplash.com/photo-1518495973542-4542c06a5843', 'Kaduna State Forest Reserve', 750000, 35, 20),
('Iroko Tree', 'Milicia excelsa', 'The king of African trees, known for its longevity and massive carbon absorption capacity.', 'https://images.unsplash.com/photo-1472396961693-142e6e269027', 'Cross River National Park', 1000000, 50, 25),
('Oil Palm', 'Elaeis guineensis', 'An economically important tree that also provides environmental benefits and supports local communities.', 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9', 'Delta State Palm Plantation', 200000, 15, 5);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_trees_updated_at BEFORE UPDATE ON public.trees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tree_donations_updated_at BEFORE UPDATE ON public.tree_donations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
