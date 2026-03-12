import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('Samishti Schemes API')
    .setDescription(
      'Backend API for the Samishti Schemes management platform. ' +
      'Manage schemes, recipients, analytics, configurations, and more.',
    )
    .setVersion('1.0')
    .addTag('Schemes', 'Create, read, update, and delete loyalty schemes')
    .addTag('Recipients', 'Manage scheme recipients and filter options')
    .addTag('Analytics', 'KPI metrics and chart data')
    .addTag('Dashboard', 'Dashboard summary and upcoming schemes')
    .addTag('Settings', 'Application settings')
    .addTag('Scheme Config', 'Save and load scheme configurations')
    .addTag('Customers', 'Customer CRUD operations')
    .addTag('Products', 'Product CRUD operations')
    .addTag('Billings', 'Billing CRUD operations')
    .addTag('Payments', 'Payment CRUD operations')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Samishti Schemes API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      tagsSorter: 'alpha',
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Samishti Schemes API running on http://localhost:${port}`);
  console.log(
    `📚 Swagger docs available at http://localhost:${port}/api/docs`,
  );
}
bootstrap().catch(console.error);
