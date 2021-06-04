import {
  Arg,
  Ctx,
  FieldResolver,
  Int,
  Mutation,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { getConnection } from "typeorm";
import { Comment } from "../entities/Comment";
import { Tweet } from "../entities/Tweet";
import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types";

@Resolver(Comment)
export class CommentResolver {
  @FieldResolver()
  user(@Root() comment: Comment, @Ctx() { userLoader }: MyContext) {
    return userLoader.load(comment.userId);
  }

  @FieldResolver()
  createdAt(@Root() comment: Comment) {
    if (typeof comment.createdAt === "string")
      return new Date(comment.createdAt);

    return comment.createdAt;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async createComment(
    @Arg("comment") comment: string,
    @Arg("tweetId", () => Int) tweetId: number,
    @Arg("parentCommentId", () => Int, { nullable: true })
    parentCommentId: number | null,
    @Ctx() { req }: MyContext
  ) {
    const { userId } = req.session;

    await getConnection().transaction(async (tm) => {
      if (parentCommentId) {
        await tm.insert(Comment, {
          comment,
          tweetId,
          userId,
          parentCommentId,
        });
      } else {
        await tm.insert(Comment, {
          comment,
          tweetId,
          userId,
        });
      }
      await tm.increment(Tweet, { id: tweetId }, "commentCount", 1);
    });
    return true;
  }
}
