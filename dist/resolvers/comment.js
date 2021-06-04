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
exports.CommentResolver = void 0;
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const Comment_1 = require("../entities/Comment");
const Tweet_1 = require("../entities/Tweet");
const isAuth_1 = require("../middleware/isAuth");
let CommentResolver = class CommentResolver {
    user(comment, { userLoader }) {
        return userLoader.load(comment.userId);
    }
    createdAt(comment) {
        if (typeof comment.createdAt === "string")
            return new Date(comment.createdAt);
        return comment.createdAt;
    }
    createComment(comment, tweetId, parentCommentId, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId } = req.session;
            yield typeorm_1.getConnection().transaction((tm) => __awaiter(this, void 0, void 0, function* () {
                if (parentCommentId) {
                    yield tm.insert(Comment_1.Comment, {
                        comment,
                        tweetId,
                        userId,
                        parentCommentId,
                    });
                }
                else {
                    yield tm.insert(Comment_1.Comment, {
                        comment,
                        tweetId,
                        userId,
                    });
                }
                yield tm.increment(Tweet_1.Tweet, { id: tweetId }, "commentCount", 1);
            }));
            return true;
        });
    }
};
__decorate([
    type_graphql_1.FieldResolver(),
    __param(0, type_graphql_1.Root()), __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Comment_1.Comment, Object]),
    __metadata("design:returntype", void 0)
], CommentResolver.prototype, "user", null);
__decorate([
    type_graphql_1.FieldResolver(),
    __param(0, type_graphql_1.Root()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Comment_1.Comment]),
    __metadata("design:returntype", void 0)
], CommentResolver.prototype, "createdAt", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    type_graphql_1.UseMiddleware(isAuth_1.isAuth),
    __param(0, type_graphql_1.Arg("comment")),
    __param(1, type_graphql_1.Arg("tweetId", () => type_graphql_1.Int)),
    __param(2, type_graphql_1.Arg("parentCommentId", () => type_graphql_1.Int, { nullable: true })),
    __param(3, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Object, Object]),
    __metadata("design:returntype", Promise)
], CommentResolver.prototype, "createComment", null);
CommentResolver = __decorate([
    type_graphql_1.Resolver(Comment_1.Comment)
], CommentResolver);
exports.CommentResolver = CommentResolver;
//# sourceMappingURL=comment.js.map