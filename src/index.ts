// import { COOKIE_NAME, __prod__ } from "./constants";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import Redis from "ioredis";
import session from "express-session";
import connectRedis from "connect-redis";
import cors from "cors";
import { createConnection } from "typeorm";
import path from "path";

const main = async () => {
  const connection = await createConnection({
    type: "postgres",
    database: "lireddit",
    username: "postgres",
    password: "admin",
    logging: true,
    synchronize: false,
    migrations: [path.join(__dirname, "./migrations/*")],
    entities: [],
  });

  const app = express();

  //connecting to redis
  const RedisStore = connectRedis(session);

  //redis location
  const redis = new Redis({
    port: 6379,
    host: "localhost",
  });

  // enabling cross-origin resource sharing(CORS)
  // to ensure there would be any issues from making api calls from the frontend
  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );

  // using redis to allow users remain logged in
  // by associating a cookie with the user when they logged in
  app.use(
    session({
      store: new RedisStore({
        client: redis,
        // disableTouch: true,
      }),
      name: "qid",
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365, // 10 years
        httpOnly: true,
        // secure: false,
        // sameSite: "lax", // csrf
        // secure: __prod__, // cookie only works in https
      },
      saveUninitialized: false,
      secret: "qowiueojwojfalksdjoqiwueo",
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers,
      validate: false,
    }),
    context: ({ req, res }) => ({
      req,
      res,
      redis,
    }),
  });

  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(4000, () => {
    console.log("server started on localhost:4000");
  });
};

main().catch((err) => {
  console.error(err);
});
