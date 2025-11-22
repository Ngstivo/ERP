import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Global prefix
    app.setGlobalPrefix('api');

    // Enable CORS
    app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
    });

    // Global validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    // Swagger API Documentation
    const config = new DocumentBuilder()
        .setTitle('ERP Inventory & Warehouse Management API')
        .setDescription(`
      Comprehensive API for managing inventory, warehouses, and warehouse operations.
      
      ## Features
      - **Authentication**: JWT-based authentication with role-based access control
      - **Inventory Management**: Real-time stock tracking, movements, and valuations
      - **Batch & Lot Tracking**: Complete traceability with expiration management
      - **Barcode System**: Multi-format barcode/QR code generation and scanning
      - **Warehouse Operations**: Goods receipt, quality inspection, put-away, picking, and shipping
      - **Multi-Warehouse**: Inter-warehouse transfers and consolidated inventory views
      - **Reporting**: Comprehensive reports with PDF/Excel export
      - **Webhooks**: Real-time event notifications
      
      ## Authentication
      Most endpoints require JWT authentication. Include the token in the Authorization header:
      \`Authorization: Bearer <your-token>\`
      
      ## Rate Limiting
      API requests are rate-limited to prevent abuse:
      - **Short**: 10 requests per second
      - **Medium**: 50 requests per 10 seconds
      - **Long**: 100 requests per minute
      
      Rate limit headers are included in responses:
      - \`X-RateLimit-Limit\`: Maximum requests allowed
      - \`X-RateLimit-Remaining\`: Requests remaining
      - \`X-RateLimit-Reset\`: Time when limit resets
      
      ## Webhooks
      Subscribe to real-time events via webhooks. See the /webhooks endpoints for configuration.
    `)
        .setVersion('1.0.0')
        .setContact(
            'API Support',
            'https://your-company.com/support',
            'api-support@your-company.com'
        )
        .setLicense('MIT', 'https://opensource.org/licenses/MIT')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                name: 'JWT',
                description: 'Enter JWT token',
                in: 'header',
            },
            'JWT-auth',
        )
        .addApiKey(
            {
                type: 'apiKey',
                name: 'X-API-Key',
                in: 'header',
                description: 'API Key for external integrations',
            },
            'API-Key',
        )
        .addTag('auth', 'Authentication and authorization')
        .addTag('products', 'Product management')
        .addTag('warehouses', 'Warehouse management')
        .addTag('inventory', 'Inventory tracking and stock levels')
        .addTag('batches', 'Batch and lot management')
        .addTag('barcodes', 'Barcode and QR code operations')
        .addTag('goods-receipt', 'Goods receipt and quality inspection')
        .addTag('purchase-return', 'Purchase return management')
        .addTag('picking', 'Picking, packing, and shipping')
        .addTag('transfers', 'Inter-warehouse transfers')
        .addTag('reports', 'Reporting and analytics')
        .addTag('webhooks', 'Webhook configuration and management')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
        customSiteTitle: 'ERP API Documentation',
        customfavIcon: 'https://your-company.com/favicon.ico',
        customCss: '.swagger-ui .topbar { display: none }',
        swaggerOptions: {
            persistAuthorization: true,
            docExpansion: 'none',
            filter: true,
            showRequestDuration: true,
        },
    });

    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`🚀 Application is running on: http://localhost:${port}`);
    console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
    console.log(`🛡️  Rate Limiting: 100 requests/minute, 50 requests/10s, 10 requests/second`);
}

bootstrap();
