-- ilovesql demo dataset
-- An idempotent seed for a small e-commerce database.

CREATE TABLE IF NOT EXISTS _ilovesql_meta (
  key text PRIMARY KEY,
  value text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
  id serial PRIMARY KEY,
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS products (
  id serial PRIMARY KEY,
  name text NOT NULL,
  category_id integer NOT NULL REFERENCES categories (id),
  price numeric(10, 2) NOT NULL,
  stock integer NOT NULL DEFAULT 0,
  rating numeric(2, 1) NOT NULL DEFAULT 4.0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customers (
  id serial PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  country text NOT NULL,
  city text NOT NULL,
  plan text NOT NULL DEFAULT 'free',
  signup_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id serial PRIMARY KEY,
  customer_id integer NOT NULL REFERENCES customers (id),
  ordered_at timestamptz NOT NULL,
  status text NOT NULL,
  channel text NOT NULL,
  total numeric(12, 2) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS order_items (
  id serial PRIMARY KEY,
  order_id integer NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  product_id integer NOT NULL REFERENCES products (id),
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric(10, 2) NOT NULL
);

CREATE INDEX IF NOT EXISTS orders_customer_id_idx ON orders (customer_id);
CREATE INDEX IF NOT EXISTS orders_ordered_at_idx ON orders (ordered_at);
CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items (order_id);
CREATE INDEX IF NOT EXISTS order_items_product_id_idx ON order_items (product_id);

CREATE OR REPLACE VIEW order_summary AS
SELECT
  o.id,
  o.ordered_at,
  c.name AS customer,
  c.country,
  o.status,
  o.channel,
  o.total,
  count(oi.id)::int AS line_items
FROM orders o
JOIN customers c ON c.id = o.customer_id
LEFT JOIN order_items oi ON oi.order_id = o.id
GROUP BY o.id, c.name, c.country, o.status, o.channel, o.total;

BEGIN;

SELECT pg_advisory_xact_lock(7281993);

INSERT INTO categories (name, slug)
SELECT v.name, v.slug
FROM (
  VALUES
    ('Electronics', 'electronics'),
    ('Home & Kitchen', 'home-kitchen'),
    ('Books', 'books'),
    ('Sports & Outdoors', 'sports-outdoors'),
    ('Beauty', 'beauty'),
    ('Office', 'office'),
    ('Toys & Games', 'toys-games'),
    ('Apparel', 'apparel')
) AS v (name, slug)
WHERE NOT EXISTS (SELECT 1 FROM _ilovesql_meta WHERE key = 'seeded');

INSERT INTO products (name, category_id, price, stock, rating, created_at)
SELECT
  (ARRAY[
    'Aurora', 'Nimbus', 'Atlas', 'Lumen', 'Vertex', 'Orbit',
    'Halcyon', 'Ember', 'Drift', 'Kestrel', 'Terra', 'Nova'
  ])[((s.g - 1) % 12 + 1)::int]
  || ' ' ||
  (ARRAY[
    'Headphones', 'Keyboard', 'Desk Lamp', 'Backpack', 'Bottle',
    'Speaker', 'Notebook', 'Chair', 'Mouse', 'Charger', 'Mug', 'Jacket'
  ])[((s.g - 1) % 12 + 1)::int] AS name,
  1 + ((s.g - 1) % 8)::int AS category_id,
  round((18 + random() * 460)::numeric, 2) AS price,
  (random() * 180)::int AS stock,
  round((3.2 + random() * 1.8)::numeric, 1) AS rating,
  now() - (s.g * 5 || ' days')::interval AS created_at
FROM generate_series(1, 48) AS s (g)
WHERE NOT EXISTS (SELECT 1 FROM _ilovesql_meta WHERE key = 'seeded');

INSERT INTO customers (name, email, country, city, plan, signup_at)
SELECT
  (ARRAY[
    'Ada', 'Grace', 'Linus', 'Margaret', 'Alan', 'Barbara', 'Dennis', 'Radia',
    'Ken', 'Frances', 'Tim', 'Anita', 'Guido', 'Hedy', 'Bjarne', 'Katherine',
    'James', 'Mary', 'Donald', 'Shafi'
  ])[((s.g - 1) % 20 + 1)::int]
  || ' ' ||
  (ARRAY[
    'Lovelace', 'Hopper', 'Torvalds', 'Hamilton', 'Turing', 'Liskov', 'Ritchie', 'Perlman',
    'Thompson', 'Allen', 'Berners-Lee', 'Borg', 'van Rossum', 'Lamarr', 'Stroustrup', 'Johnson',
    'Gosling', 'Keller', 'Knuth', 'Goldwasser'
  ])[((s.g - 1) % 20 + 1)::int] AS name,
  'user' || s.g || '@example.com' AS email,
  (ARRAY[
    'United States', 'Germany', 'India', 'Brazil',
    'United Kingdom', 'Japan', 'Canada', 'Australia'
  ])[((s.g - 1) % 8 + 1)::int] AS country,
  (ARRAY[
    'San Francisco', 'Berlin', 'Bengaluru', 'São Paulo',
    'London', 'Tokyo', 'Toronto', 'Sydney'
  ])[((s.g - 1) % 8 + 1)::int] AS city,
  (ARRAY['free', 'pro', 'team'])[((s.g - 1) % 3 + 1)::int] AS plan,
  now() - (s.g * 3 || ' days')::interval AS signup_at
FROM generate_series(1, 120) AS s (g)
WHERE NOT EXISTS (SELECT 1 FROM _ilovesql_meta WHERE key = 'seeded');

INSERT INTO orders (customer_id, ordered_at, status, channel, total)
SELECT
  1 + ((s.g - 1) % 120)::int AS customer_id,
  now()
    - (((s.g * 7) % 540) || ' days')::interval
    - ((s.g % 24) || ' hours')::interval AS ordered_at,
  (ARRAY[
    'completed', 'completed', 'completed',
    'shipped', 'processing', 'cancelled'
  ])[((s.g - 1) % 6 + 1)::int] AS status,
  (ARRAY['web', 'mobile', 'store'])[((s.g - 1) % 3 + 1)::int] AS channel,
  0 AS total
FROM generate_series(1, 500) AS s (g)
WHERE NOT EXISTS (SELECT 1 FROM _ilovesql_meta WHERE key = 'seeded');

INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT
  o.id AS order_id,
  p.id AS product_id,
  1 + ((o.id + i) % 4) AS quantity,
  p.price AS unit_price
FROM orders o
CROSS JOIN generate_series(1, 3) AS s (i)
JOIN products p ON p.id = 1 + (((o.id * 3 + i) - 1) % 48)
WHERE i <= 1 + (o.id % 3)
  AND NOT EXISTS (SELECT 1 FROM _ilovesql_meta WHERE key = 'seeded');

UPDATE orders o
SET total = t.total
FROM (
  SELECT oi.order_id, sum(oi.quantity * oi.unit_price) AS total
  FROM order_items oi
  GROUP BY oi.order_id
) AS t
WHERE o.id = t.order_id
  AND NOT EXISTS (SELECT 1 FROM _ilovesql_meta WHERE key = 'seeded');

INSERT INTO _ilovesql_meta (key, value)
VALUES ('seeded', now()::text)
ON CONFLICT (key) DO NOTHING;

COMMIT;
