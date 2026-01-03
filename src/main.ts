import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { corsOptions, PORT } from './common/constants.common';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  // Configure Swagger options
  const config = new DocumentBuilder()
    .setTitle('Centralized Membership Management Application Service API')
    .setDescription('Backend service for handling membership applications')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Authentication', 'User authentication and authorization endpoints')
    .build();

  // Create the Swagger document
  const document = SwaggerModule.createDocument(app, config);

  // Setup Swagger module
  SwaggerModule.setup('api-docs', app, document);

  app.use(helmet());
  app.enableCors(corsOptions);
  app.useGlobalPipes(new ValidationPipe());


  const port = PORT || 3000;


  await app.listen(port, () => {
    console.log(`Application is running on port ${port}`);
  });
}
bootstrap();
