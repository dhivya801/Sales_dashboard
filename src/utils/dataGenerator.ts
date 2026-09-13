import type { SalesRecord, DatasetPresetKey, DatasetPreset } from '../types/sales';


export const DATASET_PRESETS: DatasetPreset[] = [
  {
    key: 'saas',
    title: 'Cloud SaaS & Software Subscriptions',
    description: 'B2B SaaS subscription revenue, API usage credits, enterprise seats, and add-on tiers.',
    industry: 'Software & Technology',
    recordCount: 350,
  },
  {
    key: 'ecommerce',
    title: 'Omnichannel Consumer Electronics',
    description: 'High-tech gadgets, wearables, home audio, accessories, and online sales channels.',
    industry: 'Retail & E-Commerce',
    recordCount: 420,
  },
  {
    key: 'b2b',
    title: 'B2B Enterprise Hardware & Infrastructure',
    description: 'High-value server infrastructure, networking equipment, optical fiber, and deployment services.',
    industry: 'Enterprise Infrastructure',
    recordCount: 280,
  },
  {
    key: 'retail',
    title: 'Global Consumer Products & Apparel',
    description: 'Fast-moving apparel, athletic gear, accessories, and regional retail outlets.',
    industry: 'Consumer Goods',
    recordCount: 500,
  },
];

interface ProductConfig {
  name: string;
  category: string;
  basePrice: number;
  costMargin: number; // e.g. 0.4 means cost is 40% of basePrice
}

const SAAS_PRODUCTS: ProductConfig[] = [
  { name: 'Enterprise Cloud AI Suite', category: 'AI & Analytics', basePrice: 4999, costMargin: 0.2 },
  { name: 'Developer API Pro Tier', category: 'Developer Tools', basePrice: 899, costMargin: 0.15 },
  { name: 'CyberShield Endpoint Security', category: 'Security', basePrice: 2499, costMargin: 0.25 },
  { name: 'Data Pipeline Automator', category: 'AI & Analytics', basePrice: 1500, costMargin: 0.2 },
  { name: 'SaaS Workspace Seats (50-pack)', category: 'Productivity', basePrice: 1200, costMargin: 0.1 },
  { name: 'Managed Kubernetes Cluster', category: 'Infrastructure', basePrice: 3200, costMargin: 0.3 },
  { name: 'Customer Support Bot AI', category: 'AI & Analytics', basePrice: 750, costMargin: 0.18 },
  { name: 'Identity & SSO Manager', category: 'Security', basePrice: 1800, costMargin: 0.22 },
];

const ECOMMERCE_PRODUCTS: ProductConfig[] = [
  { name: 'UltraBook Pro 16"', category: 'Laptops & Computers', basePrice: 1899, costMargin: 0.65 },
  { name: 'Noise-Canceling Wireless Pods', category: 'Audio & Wearables', basePrice: 249, costMargin: 0.4 },
  { name: 'Curved OLED Monitor 34"', category: 'Monitors & Displays', basePrice: 999, costMargin: 0.55 },
  { name: 'Ergonomic Standing Desk', category: 'Office Furniture', basePrice: 650, costMargin: 0.45 },
  { name: 'Smart Health Tracker Watch', category: 'Audio & Wearables', basePrice: 199, costMargin: 0.35 },
  { name: 'Thunderbolt 4 Docking Station', category: 'Accessories', basePrice: 299, costMargin: 0.5 },
  { name: 'Mechanical RGB Keyboard', category: 'Accessories', basePrice: 150, costMargin: 0.4 },
  { name: '4K Webcam Pro Studio', category: 'Accessories', basePrice: 220, costMargin: 0.45 },
];

const B2B_PRODUCTS: ProductConfig[] = [
  { name: 'Rack Server Blade X9', category: 'Servers', basePrice: 12500, costMargin: 0.6 },
  { name: 'Enterprise Fiber Switch 48P', category: 'Networking', basePrice: 8400, costMargin: 0.5 },
  { name: 'High-Density Storage Array 100TB', category: 'Storage', basePrice: 19500, costMargin: 0.55 },
  { name: 'Datacenter Cooling System', category: 'Infrastructure', basePrice: 25000, costMargin: 0.65 },
  { name: 'On-Site Migration Consultancy', category: 'Professional Services', basePrice: 6000, costMargin: 0.3 },
  { name: 'Custom AI GPU Cluster Node', category: 'Servers', basePrice: 38000, costMargin: 0.7 },
];

const RETAIL_PRODUCTS: ProductConfig[] = [
  { name: 'Performance Running Shoes', category: 'Footwear', basePrice: 140, costMargin: 0.35 },
  { name: 'All-Weather Tech Jacket', category: 'Apparel', basePrice: 210, costMargin: 0.4 },
  { name: 'Ergonomic Backpack 30L', category: 'Accessories', basePrice: 95, costMargin: 0.3 },
  { name: 'Smart Hydration Bottle', category: 'Fitness', basePrice: 45, costMargin: 0.25 },
  { name: 'Polarized Sport Sunglasses', category: 'Accessories', basePrice: 120, costMargin: 0.3 },
  { name: 'Breathable Yoga Mat Premium', category: 'Fitness', basePrice: 65, costMargin: 0.3 },
];

const REGIONS = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East & Africa'];
const SALESPERSONS = [
  'Alex Morgan', 'Sarah Chen', 'Michael Scott', 'Elena Rostova', 
  'David Kumar', 'Jessica Taylor', 'Carlos Mendez', 'Aisha Khan'
];
const CUSTOMER_TYPES = ['Enterprise', 'SMB', 'Consumer'];

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomDate(startDate: Date, endDate: Date): string {
  const time = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime());
  const date = new Date(time);
  return date.toISOString().split('T')[0];
}

export function generateDataset(preset: DatasetPresetKey = 'saas'): SalesRecord[] {
  let products = SAAS_PRODUCTS;
  let targetCount = 350;

  if (preset === 'ecommerce') {
    products = ECOMMERCE_PRODUCTS;
    targetCount = 420;
  } else if (preset === 'b2b') {
    products = B2B_PRODUCTS;
    targetCount = 280;
  } else if (preset === 'retail') {
    products = RETAIL_PRODUCTS;
    targetCount = 500;
  }

  const records: SalesRecord[] = [];
  const startDate = new Date('2025-01-01');
  const endDate = new Date('2026-09-10');

  for (let i = 1; i <= targetCount; i++) {
    const product = getRandomElement(products);
    const dateStr = getRandomDate(startDate, endDate);
    
    // Quantity distribution
    let quantity = Math.floor(Math.random() * 5) + 1;
    if (preset === 'saas' || preset === 'retail') {
      quantity = Math.floor(Math.random() * 12) + 1;
    }

    let unitPrice = product.basePrice;
    // Add slight variance to unit price (+/- 10%)
    const priceVariance = (Math.random() * 0.2) - 0.1;
    unitPrice = Math.round(unitPrice * (1 + priceVariance));

    let revenue = quantity * unitPrice;
    const cost = Math.round(revenue * product.costMargin);
    let profit = revenue - cost;
    let margin = revenue > 0 ? (profit / revenue) * 100 : 0;

    let region = getRandomElement(REGIONS);
    let salesperson = getRandomElement(SALESPERSONS);
    let customerType = getRandomElement(CUSTOMER_TYPES);
    let status = Math.random() > 0.06 ? 'Completed' : (Math.random() > 0.5 ? 'Pending' : 'Cancelled');

    let hasErrors = false;
    let hasWarnings = false;
    const errorMessages: string[] = [];
    const warningMessages: string[] = [];

    // Introduce 4% synthetic data quality issues for data validation engine demo
    const issueRoll = Math.random();
    if (issueRoll < 0.015) {
      // Missing unit price or zero revenue
      unitPrice = 0;
      revenue = 0;
      profit = 0;
      margin = 0;
      hasErrors = true;
      errorMessages.push('Missing or zero unit price / revenue entry');
    } else if (issueRoll < 0.03) {
      // Outlier value (e.g. 10x quantity or price surge)
      quantity = quantity * 15;
      revenue = quantity * unitPrice;
      profit = revenue - cost;
      hasWarnings = true;
      warningMessages.push('High volume outlier quantity detected');
    } else if (issueRoll < 0.04) {
      // Missing region
      region = 'Unassigned';
      hasWarnings = true;
      warningMessages.push('Unassigned or missing sales region');
    }

    records.push({
      id: `ORD-2026-${1000 + i}`,
      date: dateStr,
      rawDate: dateStr,
      productName: product.name,
      category: product.category,
      quantity,
      unitPrice,
      revenue,
      cost,
      profit,
      profitMargin: Math.round(margin * 10) / 10,
      region,
      salesperson,
      customerType,
      status,
      hasErrors,
      errorMessages,
      hasWarnings,
      warningMessages,
    });
  }

  // Sort by date ascending
  return records.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
