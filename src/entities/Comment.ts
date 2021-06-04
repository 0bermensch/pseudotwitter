// import { ObjectType, Field } from "type-graphql";
// import {
//   BaseEntity,
//   Column,
//   CreateDateColumn,
//   Entity,
//   OneToMany,
//   ManyToOne,
//   PrimaryGeneratedColumn,
//   UpdateDateColumn,
//   PrimaryColumn,
// } from "typeorm";
// import { Tweet } from "./Tweet";
// import { User } from "./User";

// @Entity()
// @ObjectType()
// export class Comment extends BaseEntity {
//   @Field()
//   @Column({ type: "string" })
//   value: string;

//   @Field()
//   @PrimaryColumn()
//   userId: number;

//   @Field(() => User)
//   @ManyToOne(() => User, (user) => user.comments)
//   creator: User;

//   @Field()
//   @PrimaryColumn()
//   postId: number;

//   @Field(() => Tweet)
//   @ManyToOne(() => Tweet, (tweet) => tweet.comments, {
//     onDelete: "CASCADE",
//   })
//   tweet: Tweet;
// }
