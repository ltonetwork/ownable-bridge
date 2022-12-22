import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function swagger(app: INestApplication) {
  const options = new DocumentBuilder()
    .setTitle('Ownable Bridge')
    .setDescription('Swap Ownable for NFT and visa-versa')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api-docs', app, document);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await swagger(app);
  await app.listen(3000);
}

bootstrap();
