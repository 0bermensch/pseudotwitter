"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TweetResolver = void 0;
const Tweet_1 = require("../entities/Tweet");
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const isAuth_1 = require("../middleware/isAuth");
const User_1 = require("../entities/User");
const Comment_1 = require("../entities/Comment");
let TweetInput = class TweetInput {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], TweetInput.prototype, "title", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], TweetInput.prototype, "text", void 0);
TweetInput = __decorate([
    type_graphql_1.InputType()
], TweetInput);
let PaginatedTweets = class PaginatedTweets {
};
__decorate([
    type_graphql_1.Field(() => [Tweet_1.Tweet]),
    __metadata("design:type", Array)
], PaginatedTweets.prototype, "tweets", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Boolean)
], PaginatedTweets.prototype, "hasMore", void 0);
PaginatedTweets = __decorate([
    type_graphql_1.ObjectType()
], PaginatedTweets);
let TweetResolver = class TweetResolver {
    textSnippet(root) {
        return root.text.slice(0, 50);
    }
    creator(tweet, { userLoader }) {
        return userLoader.load(tweet.creatorId);
    }
    comments(tweet) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield typeorm_1.getConnection().query(`
        SELECT c.id,
        c.comment,
        c."createdAt",
        c."userId",
        CASE
          WHEN COUNT(r.id) > 0 THEN(
            json_agg(
              json_build_object(
                'id', r.id,
                'comment', r.comment,
                'createdAt', r."createdAt",
                'userId',  r."userId"
              )
            )
          )
          ELSE NULL
                END AS "childComments"
            FROM "comment" AS c
                LEFT JOIN comment AS r ON r."parentCommentId" = c.id
                 WHERE c."postId" = $1
                AND c."parentCommentId" IS NULL
            GROUP BY c.id,
                c.comment,
                c."createdAt",
                c."userId"
            ORDER BY c."createdAt" DESC
`, [tweet.id]);
        });
    }
    tweets(limit, cursor, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const realLimit = Math.min(50, limit);
            const realLimitPlusOne = realLimit + 1;
            const replacements = [realLimitPlusOne];
            if (cursor) {
                replacements.push(new Date(parseInt(cursor)));
            }
            const tweets = yield typeorm_1.getConnection().query(`
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
      `, replacements);
            return {
                tweets: tweets.splice(0, realLimit),
                hasMore: tweets.length === realLimitPlusOne,
            };
        });
    }
    tweet(id) {
        return Tweet_1.Tweet.findOne(id);
    }
    createTweet(input, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            return Tweet_1.Tweet.create(Object.assign(Object.assign({}, input), { creatorId: req.session.userId })).save();
        });
    }
    updateTweet(id, title, text, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield typeorm_1.getConnection()
                .createQueryBuilder()
                .update(Tweet_1.Tweet)
                .set({ title, text })
                .where('id = :id and "creatorId" = :creatorId', {
                id,
                creatorId: req.session.userId,
            })
                .returning("*")
                .execute();
            return result.raw[0];
        });
    }
    deleteTweet(id, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Tweet_1.Tweet.delete({ id, creatorId: req.session.userId });
            return true;
        });
    }
};
__decorate([
    type_graphql_1.FieldResolver(() => String),
    __param(0, type_graphql_1.Root()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Tweet_1.Tweet]),
    __metadata("design:returntype", void 0)
], TweetResolver.prototype, "textSnippet", null);
__decorate([
    type_graphql_1.FieldResolver(() => User_1.User),
    __param(0, type_graphql_1.Root()), __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Tweet_1.Tweet, Object]),
    __metadata("design:returntype", void 0)
], TweetResolver.prototype, "creator", null);
__decorate([
    type_graphql_1.FieldResolver(() => [Comment_1.Comment], { nullable: true }),
    __param(0, type_graphql_1.Root()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Tweet_1.Tweet]),
    __metadata("design:returntype", Promise)
], TweetResolver.prototype, "comments", null);
__decorate([
    type_graphql_1.Query(() => PaginatedTweets),
    __param(0, type_graphql_1.Arg("limit", () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Arg("cursor", () => String, { nullable: true })),
    __param(2, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], TweetResolver.prototype, "tweets", null);
__decorate([
    type_graphql_1.Query(() => Tweet_1.Tweet, { nullable: true }),
    __param(0, type_graphql_1.Arg("id", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], TweetResolver.prototype, "tweet", null);
__decorate([
    type_graphql_1.Mutation(() => Tweet_1.Tweet),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg("input")),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [TweetInput, Object]),
    __metadata("design:returntype", Promise)
], TweetResolver.prototype, "createTweet", null);
__decorate([
    type_graphql_1.Mutation(() => Tweet_1.Tweet, { nullable: true }),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg("id", () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Arg("title")),
    __param(2, type_graphql_1.Arg("text")),
    __param(3, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, Object]),
    __metadata("design:returntype", Promise)
], TweetResolver.prototype, "updateTweet", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg("id", () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], TweetResolver.prototype, "deleteTweet", null);
TweetResolver = __decorate([
    type_graphql_1.Resolver(Tweet_1.Tweet)
], TweetResolver);
exports.TweetResolver = TweetResolver;
//# sourceMappingURL=tweets.js.map