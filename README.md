# ERP Inventory & Warehouse Management System

A comprehensive, full-stack ERP system for inventory and warehouse management built with NestJS, React, TypeScript, and PostgreSQL.

## 🚀 Features

### Core Functionality
- **Inventory Management**: Real-time stock tracking, movements, and valuations
- **Multi-Warehouse Support**: Manage multiple warehouses with inter-warehouse transfers
- **Batch & Lot Tracking**: Complete traceability with expiration management and FEFO logic
- **Barcode System**: Multi-format barcode/QR code generation and scanning (UPC, EAN, CODE128, QR)

### Warehouse Operations
- **Goods Receipt**: Purchase order processing with quality inspection workflows
- **Put-Away Strategies**: Fixed location, nearest available, FEFO, bulk storage, cross-docking
- **Picking & Packing**: FIFO/FEFO/LIFO picking strategies with shipment tracking
- **Purchase Returns**: Complete return management with approval workflows

### Advanced Features
- **Reporting & Analytics**: Comprehensive reports with PDF/Excel export
- **Webhooks**: Real-time event notifications for integrations
- **API Documentation**: Complete Swagger/OpenAPI documentation
- **Rate Limiting**: Multi-tier API protection
- **Role-Based Access Control**: Granular permissions system

## 📋 Tech Stack

### Backend
- **Framework**: NestJS (Node.js/TypeScript)
- **Database**: PostgreSQL 15+
- **ORM**: TypeORM
- **Authentication**: JWT with Passport
- **Documentation**: Swagger/OpenAPI
- **Caching**: Redis (optional)

### Frontend
- **Framework**: React 18 with TypeScript
- **UI Library**: Material-UI (MUI)
- **State Management**: Redux Toolkit
- **Routing**: React Router
- **Build Tool**: Vite

## 🛠️ Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL 15+
- Redis 7+ (optional)
- npm or yarn

### Quick Start

1. **Clone the repository**
```bash
git clone <repository-url>
cd ERP
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run migration:run
npm run seed
npm run start:dev
```

3. **Frontend Setup**
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

4. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Documentation: http://localhost:3001/api/docs

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT.md) - Complete deployment instructions
- [API Documentation](http://localhost:3001/api/docs) - Interactive API docs (when running)
- [Architecture Overview](./docs/ARCHITECTURE.md) - System architecture
- [Database Schema](./docs/DATABASE.md) - Database design

## 🗂️ Project Structure

```
ERP/
├── backend/                 # NestJS backend
│   ├── src/
│   │   ├── database/       # Entities and migrations
│   │   ├── modules/        # Feature modules
│   │   ├── common/         # Shared utilities
│   │   └── main.ts         # Application entry
│   └── test/               # Tests
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Redux store
│   │   └── App.tsx         # App entry
│   └── public/             # Static assets
├── docker-compose.yml      # Docker configuration
└── .github/workflows/      # CI/CD pipelines
```

## 🔑 Key Modules

### Backend Modules
- **Auth**: JWT authentication and RBAC
- **Products**: Product catalog management
- **Warehouses**: Warehouse and location management
- **Inventory**: Stock levels and movements
- **Batches**: Batch/lot tracking with expiration
- **Barcodes**: Barcode generation and scanning
- **Goods Receipt**: Inbound processing
- **Picking**: Outbound processing
- **Transfers**: Inter-warehouse transfers
- **Reports**: Analytics and exports
- **Webhooks**: Event notifications

### Database Entities (25+)
- User, Role, Permission
- Product, Category, UnitOfMeasure
- Warehouse, StorageLocation
- StockLevel, StockMovement
- Batch, BatchStockLevel, BatchMovement
- Barcode
- PurchaseOrder, PurchaseOrderItem
- GoodsReceipt, GoodsReceiptItem
- PurchaseReturn, PurchaseReturnItem
- PickingList, PickingListItem
- Shipment, ShipmentItem
- WarehouseTransfer, TransferItem
- Webhook, WebhookDelivery
- PutAwayRule

## 🧪 Testing

```bash
# Backend tests
cd backend
npm run test              # Unit tests
npm run test:cov          # Coverage report
npm run test:e2e          # E2E tests

# Frontend tests
cd frontend
npm run test
```

## 🚢 Deployment

### Docker (Recommended)
```bash
docker-compose up -d
```

### Manual Deployment
See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## 📊 API Endpoints (100+)

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Inventory
- `GET /api/inventory/stock-levels` - Get stock levels
- `POST /api/inventory/movements` - Record movement
- `GET /api/inventory/movements` - Get movement history

### Warehouse Operations
- `POST /api/goods-receipt` - Create goods receipt
- `POST /api/picking/lists` - Create picking list
- `POST /api/transfers` - Create transfer

### Reports
- `GET /api/reports/dashboard` - Dashboard metrics
- `GET /api/reports/stock-levels/export/pdf` - Export to PDF
- `GET /api/reports/stock-levels/export/excel` - Export to Excel

See full API documentation at `/api/docs`

## 🔒 Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- API rate limiting (100 req/min)
- CORS configuration
- SQL injection protection (TypeORM)
- XSS protection headers
- HTTPS/SSL support

## 📈 Performance

- Redis caching for frequently accessed data
- Database connection pooling
- Optimized database indexes
- Lazy loading for large datasets
- Pagination for list endpoints
- Gzip compression

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Your Company Team

## 🙏 Acknowledgments

- NestJS team for the amazing framework
- Material-UI for the component library
- All open-source contributors

## 📞 Support

- Email: support@your-company.com
- Documentation: [API Docs](http://localhost:3001/api/docs)
- Issues: [GitHub Issues](<repository-url>/issues)
