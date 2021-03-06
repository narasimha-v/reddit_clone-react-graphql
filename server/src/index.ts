import 'reflect-metadata';
import { MikroORM } from '@mikro-orm/core';
import { __prod__ } from './constants';
import mikroORMConfig from './mikro-orm.config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver, PostResolver, UserResolver } from './resolvers';
import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';

const main = async () => {
	const orm = await MikroORM.init(mikroORMConfig);
	await orm.getMigrator().up();
	const app = express();
	const RedisStore = connectRedis(session);
	const redisClient = redis.createClient();
	app.use(
		session({
			name: 'qid',
			store: new RedisStore({
				client: redisClient,
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
		context: ({ req, res }) => ({ em: orm.em, req, res })
	});
	apolloServer.applyMiddleware({ app });
	app.listen(4000, () => {
		console.log(`server started on localhost 4000`);
	});
};

main().catch((err) => {
	console.error(err);
});
