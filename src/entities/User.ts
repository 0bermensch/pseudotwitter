import { ObjectType, Field } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Tweet } from "./Tweet";
import { Comment } from "./Comment";

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ unique: true })
  username!: string;

  @Column()
  password!: string;

  /*
  creating relation with Tweet's data,
  where the oneToMany relationship defines that
  a singular user can make a tweet that be viewed
  and interacted by other users.
  */
  @OneToMany(() => Tweet, (tweet) => tweet.creator)
  tweets: Tweet[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
