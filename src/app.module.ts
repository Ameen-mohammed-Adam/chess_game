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
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'postgres',
          host: configService.get('DB_HOST'),
          port: configService.get('DB_PORT'),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWOR'),
          database: configService.get('DB_DATABASE'),
          synchronize: true,
          autoLoadEntities: true,
        };
      },
    }),
    ConfigModule.forRoot({
      envFilePath: `.env.stage.${process.env.STAGE}`,
      validationSchema: configValidationSchema,
      isGlobal: true,
    }),
    UserModule,
    GameModule,
    AiAgentModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
