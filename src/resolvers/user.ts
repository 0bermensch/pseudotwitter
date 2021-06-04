import {
  Resolver,
  Mutation,
  Arg,
  Field,
  Ctx,
  ObjectType,
  Query,
  FieldResolver,
  Root,
} from "type-graphql";
import { MyContext } from "../types";
import { User } from "../entities/User";
import argon2 from "argon2";
import { v4 } from "uuid";
import { getConnection } from "typeorm";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { validateRegister } from "src/utils/validateRegister";

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver(User)
export class UserResolver {
  /*
  the following logic is for registering a user, the user will have to 
  input a valid username (more than 2 letter) 
  and valid password (more than 2 letters)
  then the password will get hashed by argon2
  and passed into a querybuilder to send it to the database

 */
  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options);
    if (errors) {
      return { errors };
    }

    const hashedPassword = await argon2.hash(options.password);
    let user;
    try {
      const result = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          username: options.username,
          password: hashedPassword,
        })
        .returning("*")
        .execute();
      user = result.raw[0];
    } catch (err) {
      // error code 23505 means that username entered already exist
      if (err.code === "23505") {
        return {
          errors: [{ field: "username", message: "username already taken" }],
        };
      }
    }
    /*
    by store user id in session with cookie on the user
    the user will remain logged in when they register
    */

    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => UserResponse)
  async login();
}
