import { ApolloServer } from 'apollo-server-express';
import 'dotenv-safe/config';
import connectRedis from 'connect-redis';
import express from 'express';
import session from 'express-session';
import Redis from 'ioredis';
import 'reflect-metadata';
import { buildSchema } from 'type-graphql';
import { createConnection } from 'typeorm';
import { COOKIE_NAME, __prod__ } from './constants';
import { Post, Updoot, User } from './entities';
import { HelloResolver, PostResolver, UserResolver } from './resolvers';
import path from 'path';
import { createUserLoader } from './utils/createUserLoader';
import { createUpdootLoader } from './utils/createVoteStatusLoader';

const main = async () => {
	const conn = await createConnection({
		type: 'postgres',
		url: process.env.DATABASE_URL,
		logging: true,
		synchronize: true,
		entities: [Post, User, Updoot],
		migrations: [path.join(__dirname, './migrations/*')]
	});
	await conn.runMigrations();
	/**
	 * Delete multiple posts
	 * await Post.delete({});
	 */

	const app = express();
	const RedisStore = connectRedis(session);
	const redis = new Redis(process.env.REDIS_URL);
	app.set('proxy', 1);
	app.use(
		session({
			name: COOKIE_NAME,
			store: new RedisStore({
				client: redis,
				disableTouch: true
			}),
			secret: process.env.SESSION_SECRET!,
			cookie: {
				maxAge: 1000 * 60 * 60 * 248365 * 10,
				sameSite: 'lax',
				httpOnly: true,
				secure: __prod__
			},
			saveUninitialized: false,
			resave: false
		})
	);
	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [HelloResolver, PostResolver, UserResolver],
			validate: false
		}),
		context: ({ req, res }) => ({
			req,
			res,
			redis,
			userLoader: createUserLoader(),
			updootLoader: createUpdootLoader()
		})
	});
	apolloServer.applyMiddleware({
		app,
		cors: { origin: process.env.CORS_ORIGIN, credentials: true }
	});
	app.listen(parseInt(process.env.PORT!), () => {
		console.log(`server started on localhost ${process.env.PORT}`);
	});
};

main().catch((err) => {
	console.error(err);
});
