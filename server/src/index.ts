import { ApolloServer } from 'apollo-server-express';
import connectRedis from 'connect-redis';
import express from 'express';
import session from 'express-session';
import Redis from 'ioredis';
import 'reflect-metadata';
import { buildSchema } from 'type-graphql';
import { createConnection } from 'typeorm';
import { COOKIE_NAME, __prod__ } from './constants';
import { Post, User } from './entities';
import { HelloResolver, PostResolver, UserResolver } from './resolvers';
import path from 'path';

const main = async () => {
	const conn = await createConnection({
		type: 'postgres',
		database: 'liredditv2',
		username: 'postgres',
		password: 'postgres',
		logging: true,
		synchronize: true,
		entities: [Post, User],
		migrations: [path.join(__dirname, './migrations/*')]
	});
	await conn.runMigrations();
	/**
	 * Delete multiple posts
	 * await Post.delete({});
	 */

	const app = express();
	const RedisStore = connectRedis(session);
	const redis = new Redis();
	app.use(
		session({
			name: COOKIE_NAME,
			store: new RedisStore({
				client: redis,
				disableTouch: true
			}),
			secret: 'bdc97e5d-0bff-41e2-aa10-ff6628053290',
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
		context: ({ req, res }) => ({ req, res, redis })
	});
	apolloServer.applyMiddleware({
		app,
		cors: { origin: 'http://localhost:3000', credentials: true }
	});
	app.listen(4000, () => {
		console.log(`server started on localhost 4000`);
	});
};

main().catch((err) => {
	console.error(err);
});
