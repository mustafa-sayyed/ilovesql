import { format } from 'sql-formatter'

export function formatSqlQuery(sql: string): string {
  if (!sql.trim()) return sql
  try {
    return format(sql, {
      language: 'postgresql',
      tabWidth: 2,
      keywordCase: 'upper',
      linesBetweenQueries: 1,
      expressionWidth: 64,
    })
  } catch {
    return sql
  }
}

export interface SampleQuery {
  title: string
  description: string
  sql: string
}

export const SAMPLE_QUERIES: SampleQuery[] = [
  {
    title: 'Revenue by month',
    description: 'Aggregate orders into a monthly revenue series.',
    sql: `SELECT
  date_trunc('month', ordered_at)::date AS month,
  count(*) AS orders,
  round(sum(total), 2) AS revenue
FROM orders
WHERE status <> 'cancelled'
GROUP BY 1
ORDER BY 1;`,
  },
  {
    title: 'Top products',
    description: 'Rank products by units sold and revenue.',
    sql: `SELECT
  p.name AS product,
  c.name AS category,
  sum(oi.quantity) AS units,
  round(sum(oi.quantity * oi.unit_price), 2) AS revenue
FROM order_items oi
JOIN products p ON p.id = oi.product_id
JOIN categories c ON c.id = p.category_id
GROUP BY p.id, p.name, c.name
ORDER BY revenue DESC
LIMIT 10;`,
  },
  {
    title: 'Customer lifetime value',
    description: 'Join customers to orders and rank by spend.',
    sql: `SELECT
  cu.name AS customer,
  cu.country,
  count(o.id) AS orders,
  round(coalesce(sum(o.total), 0), 2) AS lifetime_value
FROM customers cu
LEFT JOIN orders o ON o.customer_id = cu.id
GROUP BY cu.id, cu.name, cu.country
ORDER BY lifetime_value DESC
LIMIT 10;`,
  },
  {
    title: 'Running revenue',
    description: 'Use a window function to build a cumulative total.',
    sql: `SELECT
  ordered_at::date AS day,
  round(total, 2) AS total,
  round(sum(total) OVER (ORDER BY ordered_at), 2) AS running_total
FROM orders
WHERE status <> 'cancelled'
ORDER BY ordered_at
LIMIT 50;`,
  },
]
