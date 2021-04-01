import { Request, Response } from 'express';
import session from 'express-session';
import { Redis } from 'ioredis';
import { createUserLoader } from './utils/createUserLoader';
import { createUpdootLoader } from './utils/createVoteStatusLoader';

export type MyContext = {
	req: Request & {
		session: session.Session &
			Partial<session.SessionData> & { userId: number };
	};
	res: Response;
	redis: Redis;
	userLoader: ReturnType<typeof createUserLoader>;
	updootLoader: ReturnType<typeof createUpdootLoader>;
};
