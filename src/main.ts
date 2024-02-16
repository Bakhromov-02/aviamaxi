import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerDocumentOptions, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.API_PORT;
  const mode = process.env.NODE_ENV;

  app.use(helmet());
  app.enableCors()

  app.useGlobalPipes(
    new ValidationPipe({
      // whitelist: true,
      always: true,
      transform: true
    }),
  );

  // Swagger configuration part
  const config = new DocumentBuilder()
    .setTitle('Avia Maxi')
    .setDescription('Avia Maxi backend app')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name here is important for matching up with @ApiBearerAuth() in your controller!
    )
    .build();

  const options: SwaggerDocumentOptions = {
    operationIdFactory: (
      controllerKey: string,
      methodKey: string
    ) => methodKey
  };
  const document = SwaggerModule.createDocument(app, config, options);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port, () => {
    console.log(`The app started at port:${port}, in the mode of ${mode}`);
  });
}
bootstrap();
