import './env-config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.enableCors({
    origin: [
      'https://app.flutterflow.io',
      'https://run.flutterflow.io',
      'https://test.flutterflow.io',
      /\.flutterflow\.app$/, 
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
