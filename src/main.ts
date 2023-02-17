import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from './common/config/config.service';
import bodyParser from 'body-parser';

async function swagger(app: INestApplication, config: ConfigService) {
  const { description, version } = config.getPackageInfo();

  const options = new DocumentBuilder()
    .setTitle('LTO Ownable Bridge')
    .setDescription(description)
    .setVersion(version !== '0.0.0' ? version : config.get('env'))
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api-docs', app, document);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  const config = await app.get<ConfigService>(ConfigService);
  await config.load();

  app.use(
    bodyParser.json({}),
    bodyParser.raw({
      type: ['application/octet-stream', 'application/zip'],
      limit: '100MB',
    }),
  );

  app.enableShutdownHooks();

  await swagger(app, config);
  await app.listen(3000);
}

bootstrap();
