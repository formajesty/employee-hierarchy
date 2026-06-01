import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Position } from './positions/entities/position.entity';
import { PositionsModule } from './positions/positions.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'root',
      database: 'orga_structure',
      entities: [Position],
      synchronize: true,
    }),
    PositionsModule,
  ],
})
export class AppModule {
  constructor(private dataSource: DataSource) {
    console.log(dataSource.toString());
  }
}
