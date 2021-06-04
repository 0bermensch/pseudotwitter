import { Tweet } from "../entities/Tweet";
import {
  Resolver,
  Query,
  Arg,
  Mutation,
  InputType,
  Field,
  Ctx,
  UseMiddleware,
  Int,
  FieldResolver,
  Root,
  ObjectType,
} from "type-graphql";
import { MyContext } from "src/types";
import { getConnection } from "typeorm";
import { isAuth } from "src/middleware/isAuth";

@InputType()
class TweetInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

@Resolver(Tweet)
export class TweetResolver {
  /* 
  slicing the content of the tweet
  to 50 char
  */
  @FieldResolver(() => String)
  textSnippet(@Root() root: Tweet) {
    return root.text.slice(0, 50);
  }

  @Mutation(() => Tweet)
  @UseMiddleware(isAuth)
  async createTweet(
    @Arg("input") input: TweetInput,
    @Ctx() { req }: MyContext
  ): Promise<Tweet> {
    return Tweet.create({
      ...input,
      creatorId: req.session.userId,
    }).save();
  }

  @Mutation(() => Tweet, { nullable: true })
  @UseMiddleware(isAuth)
  async updateTweet(
    @Arg("id", () => Int) id: number,
    @Arg("title") title: string,
    @Arg("text") text: string,
    @Ctx() { req }: MyContext
  ): Promise<Tweet | null> {
    const result = await getConnection()
      .createQueryBuilder()
      .update(Tweet)
      .set({ title, text })
      .where('id = :id and "creatorId" = :creatorId', {
        id,
        creatorId: req.session.userId,
      })
      .returning("*")
      .execute();
    return result.raw[0];
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteTweet(
    @Arg("id", () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    await Tweet.delete({ id, creatorId: req.session.userId });
    return true;
  }
}
