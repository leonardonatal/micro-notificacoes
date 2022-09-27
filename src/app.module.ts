import { ProxyRMQModule } from './proxyrmq/proxyrmq.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    ProxyRMQModule,
    ConfigModule.forRoot({ isGlobal: true }),
    MailerModule.forRoot({
      transport: {
        host: 'email-smtp.us-east-1.amazonaws.com',
        port: 587,
        secure: false,
        tls: {
          ciphers: 'SLLv3',
        },
        auth: {
          user: 'AKIAXGJ32B6VB2DEXV5S',
          pass: 'BDIUTT9gyoWGolSM5fi4NiZZjKFPlmFQj7oosr4ryw+m',
        },
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
