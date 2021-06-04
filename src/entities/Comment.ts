import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { User } from "./User";
import { Tweet } from "./Tweet";

@ObjectType()
@Entity()
export class Comment extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => Int)
  @PrimaryColumn()
  userId!: number;

  @Field()
  @ManyToOne(() => User, (user) => user.comments, {
    onDelete: "CASCADE",
  })
  user!: User;

  // @Field(() => User)
  // @ManyToOne(() => User, (user) => user.comments)
  // creator: User;

  @Field()
  @PrimaryColumn()
  tweetId: number;

  @Field(() => Tweet)
  @ManyToOne(() => Tweet, (tweet) => tweet.comments, {
    onDelete: "CASCADE",
  })
  tweet: Tweet;

  @Field()
  @Column()
  comment: string;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;

  //   @Field(() => Int)
  //   @PrimaryGeneratedColumn()
  //   id!: number;

  //   @Field()
  //   @ManyToOne(() => User, (user) => user.comments, { onDelete: "CASCADE" })
  //   user: User;

  //   @Field(() => Int)
  //   @PrimaryColumn()
  //   tweetId!: number;

  //   @Field(() => Tweet)
  //   @ManyToOne(() => Tweet, (tweet) => tweet.comments, {
  //     onDelete: "CASCADE",
  //   })
  //   @Field()
  //   @Column()
  //   commit: string;
}
