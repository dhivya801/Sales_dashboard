import type { SalesRecord, QualityReport } from '../types/sales';


interface RawInputRow {
  [key: string]: any;
}

export function autoMapHeaders(row: RawInputRow): { [standardKey: string]: string } {
  const mapping: { [standardKey: string]: string } = {};
  const keys = Object.keys(row);

  const headerRules: { [key: string]: string[] } = {
    date: ['date', 'order date', 'transaction date', 'time', 'day'],
    productName: ['product', 'product name', 'item', 'item name', 'product_name', 'description'],
    category: ['category', 'product category', 'type', 'group', 'department'],
    quantity: ['quantity', 'qty', 'units', 'volume', 'count', 'quantity sold', 'units sold'],
    unitPrice: ['unit price', 'unitprice', 'price', 'rate', 'cost/unit', 'unit_price'],
    revenue: ['revenue', 'sales', 'total sales', 'total revenue', 'amount', 'total_amount', 'total'],
    region: ['region', 'territory', 'location', 'country', 'area', 'zone'],
    salesperson: ['salesperson', 'rep', 'sales rep', 'agent', 'account manager', 'owner'],
    customerType: ['customer type', 'segment', 'customer', 'tier', 'channel'],
    status: ['status', 'order status', 'state'],
  };

  keys.forEach((rawKey) => {
    const cleanKey = rawKey.trim().toLowerCase();
    for (const [standardKey, matches] of Object.entries(headerRules)) {
      if (matches.some((match) => cleanKey === match || cleanKey.includes(match))) {
        if (!mapping[standardKey]) {
          mapping[standardKey] = rawKey;
        }
      }
    }
  });

  return mapping;
}

export function validateAndCleanRecord(rawRow: RawInputRow, index: number, headerMap?: { [key: string]: string }): SalesRecord {
  const getVal = (key: string, defaultVal: any = '') => {
    if (headerMap && headerMap[key]) {
      return rawRow[headerMap[key]] ?? defaultVal;
    }
    // direct lookup fallback
    for (const rawKey of Object.keys(rawRow)) {
      if (rawKey.toLowerCase().includes(key.toLowerCase())) {
        return rawRow[rawKey] ?? defaultVal;
      }
    }
    return rawRow[key] ?? defaultVal;
  };

  const rawDateVal = String(getVal('date', '2026-01-01')).trim();
  let parsedDate = '2026-01-01';
  try {
    const d = new Date(rawDateVal);
    if (!isNaN(d.getTime())) {
      parsedDate = d.toISOString().split('T')[0];
    }
  } catch {
    parsedDate = '2026-01-01';
  }

  const productName = String(getVal('productName', `Product ${index + 1}`)).trim() || 'General Product';
  const category = String(getVal('category', 'General')).trim() || 'General';
  
  let quantity = parseFloat(getVal('quantity', 1));
  if (isNaN(quantity) || quantity <= 0) quantity = 1;

  let unitPrice = parseFloat(getVal('unitPrice', 0));
  let revenue = parseFloat(getVal('revenue', 0));

  const hasErrors: boolean[] = [];
  const errorMessages: string[] = [];
  const hasWarnings: boolean[] = [];
  const warningMessages: string[] = [];

  // Validation rules
  if (unitPrice === 0 && revenue === 0) {
    hasErrors.push(true);
    errorMessages.push('Missing pricing data (Unit price & Revenue are 0)');
  } else if (unitPrice === 0 && revenue > 0 && quantity > 0) {
    unitPrice = revenue / quantity;
  } else if (revenue === 0 && unitPrice > 0 && quantity > 0) {
    revenue = quantity * unitPrice;
  }

  if (quantity > 1000) {
    hasWarnings.push(true);
    warningMessages.push('Large quantity outlier (>1000 units)');
  }

  const region = String(getVal('region', 'Unassigned')).trim() || 'Unassigned';
  if (region === 'Unassigned') {
    hasWarnings.push(true);
    warningMessages.push('Unassigned region');
  }

  const salesperson = String(getVal('salesperson', 'Unassigned')).trim() || 'Unassigned';
  const customerType = String(getVal('customerType', 'SMB')).trim() || 'SMB';
  const status = String(getVal('status', 'Completed')).trim() || 'Completed';

  // Cost and Profit estimation
  const estimatedCost = Math.round(revenue * 0.45);
  const profit = revenue - estimatedCost;
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

  return {
    id: String(getVal('id', `ORD-IMP-${1000 + index}`)),
    date: parsedDate,
    rawDate: rawDateVal,
    productName,
    category,
    quantity,
    unitPrice: Math.round(unitPrice * 100) / 100,
    revenue: Math.round(revenue * 100) / 100,
    cost: estimatedCost,
    profit: Math.round(profit * 100) / 100,
    profitMargin: Math.round(margin * 10) / 10,
    region,
    salesperson,
    customerType,
    status,
    hasErrors: hasErrors.length > 0,
    errorMessages,
    hasWarnings: hasWarnings.length > 0,
    warningMessages,
  };
}

export function autoCleanDataset(records: SalesRecord[]): SalesRecord[] {
  // Step 1: Compute product average unit prices for imputation
  const priceMap: { [product: string]: { total: number; count: number } } = {};
  records.forEach((r) => {
    if (r.unitPrice > 0) {
      if (!priceMap[r.productName]) priceMap[r.productName] = { total: 0, count: 0 };
      priceMap[r.productName].total += r.unitPrice;
      priceMap[r.productName].count += 1;
    }
  });

  return records.map((r) => {
    let clean = { ...r };
    const errs: string[] = [];
    const warns: string[] = [];

    // Impute missing unit price
    if (clean.unitPrice === 0 && priceMap[clean.productName]) {
      const avgPrice = priceMap[clean.productName].total / priceMap[clean.productName].count;
      clean.unitPrice = Math.round(avgPrice * 100) / 100;
      clean.revenue = Math.round(clean.quantity * clean.unitPrice * 100) / 100;
      clean.profit = Math.round((clean.revenue - clean.revenue * 0.45) * 100) / 100;
      clean.profitMargin = clean.revenue > 0 ? Math.round((clean.profit / clean.revenue) * 1000) / 10 : 0;
    }

    // Assign default region if unassigned
    if (clean.region === 'Unassigned') {
      clean.region = 'North America';
    }

    // Clear resolved errors
    clean.hasErrors = false;
    clean.errorMessages = errs;
    clean.hasWarnings = warns.length > 0;
    clean.warningMessages = warns;

    return clean;
  });
}

export function computeQualityReport(records: SalesRecord[]): QualityReport {
  let cleanRows = 0;
  let warningRows = 0;
  let errorRows = 0;
  let missingValuesCount = 0;
  let negativeValuesCount = 0;
  let outlierCount = 0;
  let invalidDatesCount = 0;

  records.forEach((r) => {
    if (r.hasErrors) {
      errorRows++;
    } else if (r.hasWarnings) {
      warningRows++;
    } else {
      cleanRows++;
    }

    if (r.unitPrice === 0 || r.revenue === 0) missingValuesCount++;
    if (r.quantity < 0 || r.revenue < 0) negativeValuesCount++;
    if (r.quantity > 1000) outlierCount++;
    if (!r.date || r.date === 'Invalid Date') invalidDatesCount++;
  });

  return {
    totalRows: records.length,
    cleanRows,
    warningRows,
    errorRows,
    missingValuesCount,
    negativeValuesCount,
    outlierCount,
    invalidDatesCount,
  };
}
