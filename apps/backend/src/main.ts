import { loadSwagger } from '@gitroom/helpers/swagger/load.swagger';
import cookieParser from 'cookie-parser';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SubscriptionExceptionFilter } from '@gitroom/backend/services/auth/permissions/subscription.exception';
import { HttpExceptionFilter } from '@gitroom/nestjs-libraries/services/exception.filter';

process.env.TZ = 'UTC';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
    cors: {
      credentials: true,
      exposedHeaders: ['reload', 'onboarding', 'activate'],
      origin: [
        process.env.FRONTEND_URL,
        ...(process.env.MAIN_URL ? [process.env.MAIN_URL] : []),
      ],
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    })
  );

  app.use(cookieParser());
  app.useGlobalFilters(new SubscriptionExceptionFilter());
  app.useGlobalFilters(new HttpExceptionFilter());

  loadSwagger(app);

  const port = process.env.PORT || 3000;
  
  await app.listen(port, '0.0.0.0');
  
  Logger.log(
    `🚀 Application is running on: ${await app.getUrl()}`,
    'Bootstrap'
  );
  Logger.log(
    `🌍 Environment: ${process.env.NODE_ENV || 'development'}`,
    'Bootstrap'
  );
}

bootstrap().catch((error) => {
  Logger.error('Failed to start the application', error, 'Bootstrap');
  process.exit(1);
});