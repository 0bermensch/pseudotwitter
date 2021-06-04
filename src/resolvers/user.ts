import {
  Resolver,
  Mutation,
  Arg,
  Field,
  Ctx,
  ObjectType,
  Query,
} from "type-graphql";
import { MyContext, COOKIE_NAME } from "../types";
import { User } from "../entities/User";
import argon2 from "argon2";
import { getConnection } from "typeorm";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";

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

  /*
   login mutation
   the api will receive the username input from the frontend
   and find whether the username exists in the database,
   if it exists then it will store the user id in session and
   allow the user to remain logged in, if not it will return an error message
  */

  @Mutation(() => UserResponse)
  async login(
    @Arg("username") username: string,
    @Arg("password") password: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOne({ where: { username: username } });
    if (!user) {
      return {
        errors: [
          {
            field: "username",
            message: "that username does not exist",
          },
        ],
      };
    }
    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      return {
        errors: [
          {
            field: "passowrd",
            message: "incorrect password",
          },
        ],
      };
    }
    /*
    by store user id in session with cookie on the user
    the user will remain logged in when they register
    */

    req.session.userId = user.id;

    return { user };
  }
  @Query(() => User, { nullable: true })
  me(@Ctx() { req }: MyContext) {
    // you are not logged in
    if (!req.session.userId) {
      return null;
    }

    return User.findOne(req.session.userId);
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          resolve(false);
          return;
        }
        resolve(true);
      })
    );
  }
}
