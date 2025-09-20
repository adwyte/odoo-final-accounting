# Shiv Accounts Cloud: Orders, Invoices & Real-Time Reports

## Contributors
- Sanskar Kulkarni
- Adwyte Karandikar
- Jay Gadre
- Swarada Joshi

---

## Project Overview
Shiv Accounts Cloud is a professional, cloud-based accounting system designed for Shiv Furniture. The platform streamlines business operations by enabling:
- Entry and management of core master data (Contacts, Products, Taxes, Chart of Accounts)
- Seamless recording of sales, purchases, and payments
- Automated generation of financial and stock reports (Balance Sheet, Profit & Loss, Stock Statement)

## Problem Statement
Modern businesses require real-time, accurate accounting and inventory management. Shiv Accounts Cloud addresses this need by providing a robust solution for:
- Master data management
- Transaction recording
- Automated reporting
- Role-based access and workflows

## Primary Actors
- **Admin (Business Owner):** Create, modify, archive master data; record transactions; view reports
- **Invoicing User (Accountant):** Create master data; record transactions; view reports
- **Contact:** View own invoices/bills and make payments
- **System:** Validates data, computes taxes, updates ledgers, generates reports

## Master Data Modules
### 1. Contact Master
- Fields: Name, Type (Customer/Vendor/Both), Email, Mobile, Address (City, State, Pincode), Profile Image
- Example: Vendor: Azure Furniture | Customer: Nimesh Pathak

### 2. Product Master
- Fields: Product Name, Type (Goods/Service), Sales Price, Purchase Price, Sale Tax %, Purchase Tax %, HSN Code, Category
- Example: Office Chair, Wooden Table, Sofa, Dining Table

### 3. Tax Master
- Fields: Tax Name, Computation Method (Percentage/Fixed Value), Applicable on Sales/Purchase
- Example: GST 5%, GST 10%

### 4. Chart of Accounts Master
- Concept: Master list of all ledger accounts used to classify every financial transaction. Each account acts as a category for grouping related transactions (e.g., Cash, Bank, Sales Income, Purchase Expense).
- Fields: Account Name, Type (Asset, Liability, Expense, Income, Equity)
- Example: Assets: Cash, Bank, Debtors | Liabilities: Creditors | Income: Sale Income | Expenses: Purchases Expense

## Transaction Flow
Users leverage master data to create and link transactions:
- **Purchase Order:** Select Vendor, Product, Quantity, Unit Price, Tax
- **Vendor Bill:** Convert PO to Bill, record invoice date, due date, register payment (Cash/Bank)
- **Sales Order:** Select Customer, Product, Quantity, Unit Price, Tax
- **Customer Invoice:** Generate Invoice from SO, set tax, receive payment via Cash/Bank
- **Payment:** Register against bill/invoice, select bank or cash

## Reporting Requirements
After transactions are recorded, the system generates:
- **Balance Sheet:** Real-time snapshot of Assets, Liabilities, and Equity
- **Profit & Loss Account:** Income from product sales minus purchases/expenses to show net profit
- **Stock Account / Inventory Report:** Current quantity, valuation, and movement of products

## Key Use-Case Steps
### 1. Create Master Data
- Add Contacts (e.g., Azure Furniture, Nimesh Pathak)
- Add Products (e.g., Wooden Chair with Sales Tax 5%)
- Define Tax rates (5%, 10%)
- Set up Chart of Accounts

### 2. Record Purchase
- Create Purchase Order for Azure Furniture
- Convert PO to Vendor Bill
- Record payment via Bank

### 3. Record Sale
- Create Sales Order for Nimesh Pathak for 5 Office Chairs
- Generate Customer Invoice
- Record payment via Cash/Bank

### 4. Generate Reports
- Select reporting period
- System compiles:
	- Balance Sheet (Assets & Liabilities)
	- Profit & Loss (total sales, purchases, expenses, net profit)
	- Stock report (Purchased Qty [+], Sales Qty [-], Available)

---

Shiv Accounts Cloud empowers Shiv Furniture with modern, efficient, and real-time accounting and inventory management for business growth and compliance.