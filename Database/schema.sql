-- =====================================================
-- AgriConnect Database Schema
-- Complete database schema with RLS policies and sample data
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. CORE TABLES
-- =====================================================

-- Users table for authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('farmer', 'vendor', 'admin')),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles with agricultural-specific details
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    aadhaar_number VARCHAR(12),
    address TEXT,
    profile_picture_url TEXT,
    experience_years INTEGER CHECK (experience_years >= 0),
    specialties TEXT[], -- Array of specialties for farmers/guides
    guidance_fees DECIMAL(10,2), -- Only for guides
    is_guide BOOLEAN DEFAULT FALSE, -- Computed: experience_years >= 7 AND role = 'farmer'
    role VARCHAR(20), -- Denormalized from users table for easier queries
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product categories reference table
CREATE TABLE product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organic products listed by farmers
CREATE TABLE organic_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    unit VARCHAR(50) NOT NULL,
    quantity_available INTEGER NOT NULL CHECK (quantity_available >= 0),
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'vegetables', 'fruits', 'grains', 'pulses', 
        'spices', 'herbs', 'dairy', 'others'
    )),
    location VARCHAR(255) NOT NULL,
    is_organic BOOLEAN DEFAULT TRUE,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Multiple images per product
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES organic_products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. INDEXES FOR PERFORMANCE
-- =====================================================

-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- User profiles indexes
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_is_guide ON user_profiles(is_guide);
CREATE INDEX idx_user_profiles_experience ON user_profiles(experience_years);

-- Organic products indexes
CREATE INDEX idx_organic_products_farmer_id ON organic_products(farmer_id);
CREATE INDEX idx_organic_products_category ON organic_products(category);
CREATE INDEX idx_organic_products_is_active ON organic_products(is_active);
CREATE INDEX idx_organic_products_location ON organic_products(location);
CREATE INDEX idx_organic_products_is_organic ON organic_products(is_organic);
CREATE INDEX idx_organic_products_price ON organic_products(price);

-- Product images indexes
CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_product_images_display_order ON product_images(display_order);

-- =====================================================
-- 3. FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to automatically set is_guide based on experience
CREATE OR REPLACE FUNCTION update_guide_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if user is farmer with >= 7 years experience
    IF EXISTS (
        SELECT 1 FROM users 
        WHERE id = NEW.user_id AND role = 'farmer'
    ) AND NEW.experience_years >= 7 THEN
        NEW.is_guide = TRUE;
    ELSE
        NEW.is_guide = FALSE;
    END IF;
    
    -- Set role from users table
    SELECT role INTO NEW.role FROM users WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for guide status
CREATE TRIGGER trigger_update_guide_status
    BEFORE INSERT OR UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_guide_status();

-- Triggers for updated_at
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_organic_products_updated_at
    BEFORE UPDATE ON organic_products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organic_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- User profiles policies
CREATE POLICY "Users can view own profile details" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile details" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile details" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view guide profiles" ON user_profiles
    FOR SELECT USING (is_guide = true);

CREATE POLICY "Admins can view all profiles" ON user_profiles
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Organic products policies
CREATE POLICY "Anyone can view active products" ON organic_products
    FOR SELECT USING (is_active = true);

CREATE POLICY "Farmers can manage own products" ON organic_products
    FOR ALL USING (
        auth.uid() = farmer_id AND 
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'farmer')
    );

CREATE POLICY "Admins can manage all products" ON organic_products
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Product images policies
CREATE POLICY "Anyone can view product images" ON product_images
    FOR SELECT USING (true);

CREATE POLICY "Product owners can manage images" ON product_images
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM organic_products 
            WHERE id = product_id AND farmer_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all images" ON product_images
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Product categories policies
CREATE POLICY "Anyone can view categories" ON product_categories
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON product_categories
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- =====================================================
-- 5. VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for marketplace products with farmer details
CREATE VIEW marketplace_products AS
SELECT 
    op.id,
    op.name,
    op.description,
    op.price,
    op.unit,
    op.quantity_available,
    op.category,
    op.location,
    op.is_organic,
    op.image_url,
    op.created_at,
    up.name as farmer_name,
    up.phone as farmer_phone,
    up.address as farmer_address,
    up.profile_picture_url as farmer_photo,
    up.experience_years as farmer_experience
FROM organic_products op
JOIN user_profiles up ON op.farmer_id = up.user_id
WHERE op.is_active = true;

-- View for guides (farmers with >= 7 years experience)
CREATE VIEW guides AS
SELECT 
    u.id,
    up.name,
    up.phone,
    up.address,
    up.profile_picture_url,
    up.experience_years,
    up.specialties,
    up.guidance_fees,
    up.created_at
FROM users u
JOIN user_profiles up ON u.id = up.user_id
WHERE u.role = 'farmer' AND up.is_guide = true AND u.is_active = true;

-- View for all users with their roles
CREATE VIEW all_users AS
SELECT 
    u.id,
    u.email,
    u.role,
    u.is_verified,
    u.is_active,
    up.name,
    up.phone,
    up.address,
    up.experience_years,
    up.is_guide,
    u.created_at
FROM users u
LEFT JOIN user_profiles up ON u.id = up.user_id
WHERE u.is_active = true;

-- =====================================================
-- 6. SAMPLE DATA INSERTION
-- =====================================================

-- Insert product categories
INSERT INTO product_categories (name, description) VALUES
('vegetables', 'Fresh vegetables and leafy greens'),
('fruits', 'Fresh fruits and berries'),
('grains', 'Cereals and grain products'),
('pulses', 'Legumes and pulse crops'),
('spices', 'Herbs and spices'),
('herbs', 'Medicinal and culinary herbs'),
('dairy', 'Dairy products'),
('others', 'Other agricultural products');

-- Insert sample users
INSERT INTO users (email, password_hash, role, is_verified) VALUES
('admin@agriconnect.com', '$2a$10$rQZ8K9L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K', 'admin', true),
('farmer1@example.com', '$2a$10$rQZ8K9L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K', 'farmer', true),
('farmer2@example.com', '$2a$10$rQZ8K9L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K', 'farmer', true),
('farmer3@example.com', '$2a$10$rQZ8K9L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K', 'farmer', true),
('vendor1@example.com', '$2a$10$rQZ8K9L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K', 'vendor', true),
('vendor2@example.com', '$2a$10$rQZ8K9L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K', 'vendor', true);

-- Insert user profiles
INSERT INTO user_profiles (user_id, name, phone, aadhaar_number, address, profile_picture_url, experience_years, specialties, guidance_fees) VALUES
((SELECT id FROM users WHERE email = 'farmer1@example.com'), 'Rahul Kumar', '+919876543210', '123456789012', 'Village A, District X, State Y', 'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg', 8, ARRAY['Organic Farming', 'Crop Rotation', 'Soil Management'], 50.00),
((SELECT id FROM users WHERE email = 'farmer2@example.com'), 'Sunita Sharma', '+919876543211', '123456789013', 'Village B, District Y, State Z', 'https://images.pexels.com/photos/1595104/pexels-photo-1595104.jpeg', 5, ARRAY['Vegetable Farming', 'Greenhouse Management'], NULL),
((SELECT id FROM users WHERE email = 'farmer3@example.com'), 'David Chen', '+919876543212', '123456789014', 'Village C, District Z, State A', 'https://images.pexels.com/photos/2132250/pexels-photo-2132250.jpeg', 12, ARRAY['Precision Agriculture', 'Technology Integration', 'Data Analysis'], 60.00),
((SELECT id FROM users WHERE email = 'vendor1@example.com'), 'Mike Johnson', '+919876543213', '123456789015', 'City A, State B', 'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg', NULL, NULL, NULL),
((SELECT id FROM users WHERE email = 'vendor2@example.com'), 'Sarah Wilson', '+919876543214', '123456789016', 'City B, State C', 'https://images.pexels.com/photos/1595104/pexels-photo-1595104.jpeg', NULL, NULL, NULL);

-- Insert sample organic products
INSERT INTO organic_products (farmer_id, name, description, price, unit, quantity_available, category, location, is_organic, image_url) VALUES
((SELECT id FROM users WHERE email = 'farmer1@example.com'), 'Fresh Organic Tomatoes', 'Freshly harvested organic tomatoes from our farm. Grown without pesticides and chemical fertilizers.', 45.00, 'kg', 50, 'vegetables', 'Village A, District X, State Y', true, 'https://www.richardjacksonsgarden.co.uk/wp-content/uploads/2021/04/AdobeStock_554658202_1200px.jpg.webp'),
((SELECT id FROM users WHERE email = 'farmer1@example.com'), 'Premium Basmati Rice', 'High quality basmati rice, perfect for daily cooking. Grown using traditional methods.', 120.00, 'kg', 25, 'grains', 'Village A, District X, State Y', true, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHEnqmHwmb3jH5KBntBrMjSocfHUiu3zJKGQ&s'),
((SELECT id FROM users WHERE email = 'farmer2@example.com'), 'Fresh Mangoes', 'Sweet and juicy organic mangoes. Perfect for eating fresh or making desserts.', 80.00, 'kg', 30, 'fruits', 'Village B, District Y, State Z', true, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHEnqmHwmb3jH5KBntBrMjSocfHUiu3zJKGQ&s'),
((SELECT id FROM users WHERE email = 'farmer2@example.com'), 'Organic Spinach', 'Fresh organic spinach leaves. Rich in iron and perfect for salads and cooking.', 35.00, 'kg', 40, 'vegetables', 'Village B, District Y, State Z', true, 'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg'),
((SELECT id FROM users WHERE email = 'farmer3@example.com'), 'Organic Turmeric', 'Pure organic turmeric powder. Great for cooking and medicinal purposes.', 200.00, 'kg', 15, 'spices', 'Village C, District Z, State A', true, 'https://images.pexels.com/photos/1595104/pexels-photo-1595104.jpeg'),
((SELECT id FROM users WHERE email = 'farmer3@example.com'), 'Fresh Milk', 'Fresh organic cow milk. Direct from our farm, no preservatives added.', 60.00, 'liter', 20, 'dairy', 'Village C, District Z, State A', true, 'https://images.pexels.com/photos/2132250/pexels-photo-2132250.jpeg');

-- Insert product images
INSERT INTO product_images (product_id, image_url, alt_text, display_order) VALUES
((SELECT id FROM organic_products WHERE name = 'Fresh Organic Tomatoes'), 'https://www.richardjacksonsgarden.co.uk/wp-content/uploads/2021/04/AdobeStock_554658202_1200px.jpg.webp', 'Fresh Organic Tomatoes', 1),
((SELECT id FROM organic_products WHERE name = 'Fresh Organic Tomatoes'), 'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg', 'Organic Tomatoes Close-up', 2),
((SELECT id FROM organic_products WHERE name = 'Premium Basmati Rice'), 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHEnqmHwmb3jH5KBntBrMjSocfHUiu3zJKGQ&s', 'Premium Basmati Rice', 1),
((SELECT id FROM organic_products WHERE name = 'Fresh Mangoes'), 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHEnqmHwmb3jH5KBntBrMjSocfHUiu3zJKGQ&s', 'Fresh Mangoes', 1),
((SELECT id FROM organic_products WHERE name = 'Organic Spinach'), 'https://images.pexels.com/photos/1300972/pexels-photo-1300972.jpeg', 'Organic Spinach Leaves', 1),
((SELECT id FROM organic_products WHERE name = 'Organic Turmeric'), 'https://images.pexels.com/photos/1595104/pexels-photo-1595104.jpeg', 'Organic Turmeric Powder', 1),
((SELECT id FROM organic_products WHERE name = 'Fresh Milk'), 'https://images.pexels.com/photos/2132250/pexels-photo-2132250.jpeg', 'Fresh Organic Milk', 1);

-- =====================================================
-- END OF SCRIPT
-- =====================================================

-- Verification queries to check setup
SELECT 'Database setup completed successfully!' as status;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_profiles FROM user_profiles;
SELECT COUNT(*) as total_products FROM organic_products;
SELECT COUNT(*) as total_guides FROM guides;
SELECT COUNT(*) as total_categories FROM product_categories;





insert into users (id, email, role, password_hash, is_verified, is_active)
values ('00000000-0000-0000-0000-000000000000', 'user@example.com', 'farmer', 'managed-by-supabase-auth', false, true)
on conflict do nothing;


insert into user_profiles (
  user_id, name, phone, aadhaar_number, address, profile_picture_url, experience_years
)
values (
  '00000000-0000-0000-0000-000000000000', 'Rahul Kumar', '+919876543210',
  '123456789012', 'Some Address', null, 8
)
on conflict do nothing;

