import { NestFactory } from "@nestjs/core";
import { Logger } from "@nestjs/common";
import { AppModule } from "./app.module";

const PORT = parseInt(process.env.SERVER_PORT || "3000", 10);

async function bootstrap() {
  const bootstrapLogger = new Logger("Bootstrap");
  const app = await NestFactory.create(AppModule);

  await app.listen(PORT);
  bootstrapLogger.log(`Listening on port ${PORT}`);
}

bootstrap();
