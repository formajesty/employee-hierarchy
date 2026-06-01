import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Check,
} from 'typeorm';

@Entity('positions')
@Check(`"id" <> "parentId"`)
export class Position {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;
  // Parent Position
  @ManyToOne(() => Position, (position) => position.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  parent: Position | null;

  // Child Positions
  @OneToMany(() => Position, (position) => position.parent)
  children: Position[] | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
