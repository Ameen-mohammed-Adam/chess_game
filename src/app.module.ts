import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configValidationSchema } from './config.Schema';
import { AppController } from './app.controller';
import { UserModule } from './user/user.module';
import { GameModule } from './game/game.module';
import { AiAgentModule } from './ai-agent/ai-agent.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      envFilePath: `.env.stage.${process.env.STAGE}`,
      validationSchema: configValidationSchema,
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'postgres',
          url: configService.get('DB_URL'),
          ssl:
            process.env.NODE_ENV === 'prod'
              ? { rejectUnauthorized: false }
              : false,
          synchronize: false,
          autoLoadEntities: true,
        };
      },
    }),
    UserModule,
    GameModule,
    AiAgentModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
