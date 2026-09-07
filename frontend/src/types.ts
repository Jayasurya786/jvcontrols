export type ProductCategory = 'all' | 'ups' | 'inverter' | 'tubular-battery' | 'smf-battery';

export interface ProductSpecification {
  categoryName: string;
  items: { [key: string]: string };
}

export interface LoadChartItem {
  appliance: string;
  count: number | string;
}

export interface LoadScenario {
  name: string;
  items: LoadChartItem[];
}

export interface ProductItem {
  id: string;
  name: string;
  brand: string;
  category: 'ups' | 'inverter' | 'tubular-battery' | 'smf-battery';
  subCategory?: string;
  capacity?: string;
  tagline?: string;
  description: string;
  image: string;
  gallery?: string[];
  features: string[];
  specs?: { [key: string]: string };
  detailedSpecTables?: {
    title: string;
    rows: { label: string; value: string }[];
  }[];
  loadChart?: {
    headers: string[];
    rows: (string | number)[][];
  };
  warranty?: string;
  inStock?: boolean;
}

export interface ServiceItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  description: string;
  points: string[];
}

