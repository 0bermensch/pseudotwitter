import {
  Arg,
  Ctx,
  FieldResolver,
  Int,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { Comment } from "../entities/Comment";
import { Tweet } from "../entities/Tweet";
import { User } from "../entities/User";
import { MyContext } from "../types";

@Resolver(Comment)
export default class CommentResolver {
  @FieldResolver(() => Tweet)
  tweet(@Root() comment: Comment) {
    return Tweet.findOne(comment.tweetId);
  }

  @FieldResolver(() => User)
  user(@Root() comment: Comment) {
    return User.findOne(comment.userId);
  }
}
