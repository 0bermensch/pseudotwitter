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
import { isAuth } from "../middleware/isAuth";

@InputType()
class TweetInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

@ObjectType()
class PaginatedTweets {
  @Field(() => [Tweet])
  tweets: Tweet[];
  @Field()
  hasMore: boolean;
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

  /*
  adding a pagination to the tweets, because I am planning to use mock data,
  and showing all the mock tweets may be too long at once
  */

  //
  @Query(() => PaginatedTweets)
  async tweets(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
    @Ctx() { req }: MyContext
  ): Promise<PaginatedTweets> {
    const realLimit = Math.min(50, limit);
    /* 
    realLimitPlusOne is used so that when we reach all the end
    of all the tweet and plus will return false, then the
    load more button from pagination will be disabled
    */
    const realLimitPlusOne = realLimit + 1;
    const replacements: any[] = [realLimitPlusOne];

    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
    }
    const tweets = await getConnection().query(
      `
      select t.*,
      json_build_object(
        'id', u.id,
        'username', u.username,
        'createdat', u."createdAt",
        'updatedAt', u."updatedAt"
      ) creator
      from tweet t
      inner join public.user u on u.id = t."creatorId"
      ${cursor ? `where t."createdAt" < $2` : ""}
      order by t."createdAt" DESC
      limit $1
      `,
      replacements
    );
    return {
      tweets: tweets.splace(0, realLimit),
      hasMore: tweets.length === realLimitPlusOne,
    };
  }

  @Query(() => Tweet, { nullable: true })
  post(@Arg("id", () => Int) id: number): Promise<Tweet | undefined> {
    return Tweet.findOne(id);
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
