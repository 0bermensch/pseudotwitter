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

  @Field()
  @Column({ type: "text" })
  comment: string;

  @Field(() => Int)
  @PrimaryColumn()
  userId!: number;

  @Field()
  @PrimaryColumn()
  tweetId: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.comments)
  user: User;

  @ManyToOne(() => Tweet, (tweet) => tweet.comments, { onDelete: "CASCADE" })
  tweet: Tweet;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true, type: "int" })
  parentCommentId: number;

  @Field(() => [Comment], { nullable: true })
  childComments: Partial<Comment>[];

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
