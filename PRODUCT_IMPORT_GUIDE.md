# Product Import Guide

## Overview

The ERP system supports importing products from CSV and Excel files. This guide explains how to format your files and use the import feature.

## File Format Requirements

### Required Columns

All import files must contain the following columns (exact column names):

| Column Name | Type | Description | Example |
|------------|------|-------------|---------|
| `sku` | Text | Unique product identifier | `PROD-001` |
| `name` | Text | Product name | `Wireless Mouse` |
| `categoryCode` | Text | Category code (must exist) | `CAT001` |
| `uomAbbreviation` | Text | Unit of measure abbreviation | `PCS` |
| `unitPrice` | Number | Selling price | `29.99` |
| `costPrice` | Number | Cost price | `15.50` |
| `reorderPoint` | Number | Reorder threshold quantity | `10` |

### Optional Columns

| Column Name | Type | Description | Example |
|------------|------|-------------|---------|
| `description` | Text | Product description | `Ergonomic wireless mouse` |

## Available Categories

Use these category codes in your import file:

- `CAT001` - Electronics
- `CAT002` - Clothing
- `CAT003` - Home Goods
- `CAT004` - Sports Equipment

## Available Units of Measure

Use these UOM abbreviations in your import file:

- `PCS` - Piece (Individual item)
- `BOX` - Box of items
- `KG` - Kilogram
- `SET` - Set of items

## CSV Template

Create a CSV file with the following format:

```csv
sku,name,description,categoryCode,uomAbbreviation,unitPrice,costPrice,reorderPoint
PROD-001,Wireless Mouse,Ergonomic wireless mouse with USB receiver,CAT001,PCS,29.99,15.50,10
PROD-002,Office Desk,Standing desk with adjustable height,CAT003,PCS,499.99,299.00,5
PROD-003,Yoga Mat,Non-slip exercise mat,CAT004,PCS,34.99,18.75,20
```

## Excel Template

Create an Excel file (.xlsx or .xls) with:
- **Sheet 1** as the active sheet
- **Row 1** containing column headers (same as CSV template)
- **Row 2 onwards** containing product data

## Using the Import Feature

### Via Swagger API Documentation

1. Navigate to `http://localhost:3001/api/docs`
2. Login to get your access token
3. Click "Authorize" and enter your Bearer token
4. Navigate to **Products** section
5. Choose either:
   - `POST /api/products/import/csv` for CSV files
   - `POST /api/products/import/excel` for Excel files
6. Click "Try it out"
7. Upload your file
8. Click "Execute"

### Via API Call (cURL)

**CSV Import:**
```bash
curl -X POST http://localhost:3001/api/products/import/csv \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@products.csv"
```

**Excel Import:**
```bash
curl -X POST http://localhost:3001/api/products/import/excel \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@products.xlsx"
```

## Import Response

The API returns a detailed import result:

```json
{
  "successCount": 2,
  "failureCount": 1,
  "totalCount": 3,
  "successfulProducts": [
    "PROD-001",
    "PROD-002"
  ],
  "errors": [
    {
      "row": 4,
      "sku": "PROD-003",
      "error": "Invalid category code: CAT999"
    }
  ]
}
```

## Validation Rules

1. **SKU Uniqueness**: Each SKU must be unique across all products
2. **Required Fields**: `sku`, `name`, `categoryCode`, `uomAbbreviation`, `unitPrice`, `costPrice`, and `reorderPoint` are mandatory
3. **Valid References**: Category codes and UOM abbreviations must match existing values
4. **Positive Numbers**: `unitPrice`, `costPrice`, and `reorderPoint` must be >= 0
5. **Data Types**: Numeric fields must contain valid numbers

## Common Errors

| Error Message | Cause | Solution |
|--------------|-------|----------|
| `Missing required fields: sku and name are mandatory` | SKU or name column is empty | Fill in all required fields |
| `Product with SKU XXX already exists` | Duplicate SKU in database | Use a different SKU |
| `Invalid category code: XXX` | Category doesn't exist | Use one of the available category codes |
| `Invalid UOM abbreviation: XXX` | UOM doesn't exist | Use one of the available UOM abbreviations |
| `Invalid unitPrice: must be a positive number` | Price is negative or not a number | Enter a valid positive number |

## Best Practices

1. **Start Small**: Test with a few products first before importing large batches
2. **Validate Data**: Check your file for typos and invalid references before importing
3. **Use Templates**: Download and use the provided templates to ensure correct formatting
4. **Review Errors**: If imports fail, check the error array for specific issues
5. **Backup**: Keep a copy of your import files for reference

## Download Templates

### CSV Template
Save the following as `products_template.csv`:
```
sku,name,description,categoryCode,uomAbbreviation,unitPrice,costPrice,reorderPoint
EXAMPLE-001,Product Name,Product Description,CAT001,PCS,99.99,59.99,10
```

### Excel Template
Create an Excel file with the same column structure as the CSV template.

## Need Help?

- Review the error messages in the import response
- Check that all category codes and UOM abbreviations are correct
- Ensure all numeric values are positive numbers
- Verify that SKUs are unique and not already in the system
