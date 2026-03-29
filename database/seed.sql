-- Sample data for Cook Book Bake development/testing

-- Insert sample categories
INSERT INTO categories (name, slug, description, display_order) VALUES
  ('Baking', 'baking', 'Comprehensive guides to baking bread, cakes, pastries, and more', 1),
  ('International Cuisine', 'international-cuisine', 'Recipes and techniques from around the world', 2),
  ('Vegetarian & Vegan', 'vegetarian-vegan', 'Plant-based cooking and dietary guides', 3),
  ('Desserts', 'desserts', 'Sweet treats, chocolates, and confectionery', 4),
  ('Specialty Diets', 'specialty-diets', 'Gluten-free, keto, paleo, and other dietary options', 5),
  ('Classic Cookbooks', 'classic-cookbooks', 'Timeless culinary references', 6)
ON CONFLICT DO NOTHING;

-- Insert sample books with cover images
INSERT INTO books (title, author, isbn, description, price, stock_quantity, category_id, featured, bestseller, cover_image_url) VALUES
  (
    'The Art of French Cooking',
    'Julia Child',
    '9780394721934',
    'The definitive guide to French culinary techniques by the legendary Julia Child. A must-have for anyone serious about cooking.',
    29.99,
    15,
    (SELECT id FROM categories WHERE slug = 'international-cuisine'),
    TRUE,
    TRUE,
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop'
  ),
  (
    'Salt Fat Acid Heat',
    'Samin Nosrat',
    '9781492204916',
    'Master the fundamentals of good cooking with this beautifully illustrated guide to the four pillars of flavor.',
    24.99,
    22,
    (SELECT id FROM categories WHERE slug = 'classic-cookbooks'),
    TRUE,
    TRUE,
    'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=400&h=600&fit=crop'
  ),
  (
    'The Bread Baker''s Handbook',
    'Sarah Beeny',
    '9781848091231',
    'Everything you need to know about baking traditional and modern breads with detailed recipes and techniques.',
    18.99,
    10,
    (SELECT id FROM categories WHERE slug = 'baking'),
    FALSE,
    FALSE,
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=600&fit=crop'
  ),
  (
    'Chocolate: From Bean to Bar',
    'Jennifer Earle',
    '9781913018702',
    'Explore the world of chocolate with recipes, techniques, and the history of this beloved ingredient.',
    35.00,
    8,
    (SELECT id FROM categories WHERE slug = 'desserts'),
    FALSE,
    FALSE,
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=600&fit=crop'
  ),
  (
    'The Plant-Based Kitchen',
    'Alain Passard',
    '9781849498319',
    'A masterclass in vegetable cooking from Michelin-starred chef Alain Passard. Celebrating plants in all their glory.',
    32.99,
    12,
    (SELECT id FROM categories WHERE slug = 'vegetarian-vegan'),
    TRUE,
    FALSE,
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=600&fit=crop'
  ),
  (
    'Gluten-Free All Year',
    'Michele Brinegar & Allyson Reedy',
    '9781449428920',
    'Over 175 recipes for gluten-free baking and cooking, with seasonal variations and helpful tips.',
    26.99,
    7,
    (SELECT id FROM categories WHERE slug = 'specialty-diets'),
    FALSE,
    FALSE,
    'https://images.unsplash.com/photo-1534080564513-e96416b471da?w=400&h=600&fit=crop'
  ),
  (
    'Mastering the Art of Pasta',
    'Giuliano Hazan',
    '9781419743955',
    'Learn to make fresh pasta at home with traditional Italian techniques and authentic recipes.',
    28.50,
    14,
    (SELECT id FROM categories WHERE slug = 'international-cuisine'),
    FALSE,
    TRUE,
    'https://images.unsplash.com/photo-1473093295203-cad00df16e50?w=400&h=600&fit=crop'
  ),
  (
    'The Complete Tart Book',
    'Carole Bloom',
    '9781558324359',
    'From savory to sweet, learn to make beautiful tarts with this comprehensive collection of recipes.',
    31.99,
    9,
    (SELECT id FROM categories WHERE slug = 'baking'),
    FALSE,
    FALSE,
    'https://images.unsplash.com/photo-1585080872051-9bac9a55afd4?w=400&h=600&fit=crop'
  ),
  (
    'Modern Vegan Baking',
    'Allyson Reedy',
    '9780760347560',
    'Create delicious plant-based baked goods that everyone will enjoy, vegan or not.',
    24.99,
    20,
    (SELECT id FROM categories WHERE slug = 'vegetarian-vegan'),
    FALSE,
    FALSE,
    'https://images.unsplash.com/photo-1599599810694-b5ac4dd94210?w=400&h=600&fit=crop'
  ),
  (
    'Fermentation: The Essential Guide',
    'Douglas Katz & Koji Ito',
    '9781594745584',
    'Master fermented foods including kimchi, kombucha, miso, and more with expert techniques.',
    29.99,
    6,
    (SELECT id FROM categories WHERE slug = 'specialty-diets'),
    FALSE,
    FALSE,
    'https://images.unsplash.com/photo-1608897261409-5e5b9d346f44?w=400&h=600&fit=crop'
  );

-- Create a sample admin user (you'll need to set a proper bcrypt hash in production)
-- NOTE: In production, use a secure password hash. This is for testing only.
INSERT INTO users (email, password_hash, first_name, last_name, is_admin, email_verified) VALUES
  (
    'admin@cookbookbake.co.uk',
    '$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86AGR57XSi6',
    'Admin',
    'User',
    TRUE,
    TRUE
  )
ON CONFLICT DO NOTHING;

-- Create a sample customer user
INSERT INTO users (email, password_hash, first_name, last_name, is_admin, email_verified) VALUES
  (
    'customer@example.com',
    '$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86AGR57XSi6',
    'John',
    'Doe',
    FALSE,
    TRUE
  )
ON CONFLICT DO NOTHING;

-- Create a sample address
INSERT INTO addresses (user_id, address_line1, address_line2, city, county, postcode, country, is_default)
SELECT id, '123 Main Street', 'Apt 4', 'Hove', 'East Sussex', 'BN3 2WB', 'United Kingdom', TRUE
FROM users WHERE email = 'customer@example.com';
