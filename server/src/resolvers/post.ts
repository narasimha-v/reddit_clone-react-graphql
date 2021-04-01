import { MyContext } from 'src/types';
import {
	Arg,
	Ctx,
	Field,
	FieldResolver,
	InputType,
	Int,
	Mutation,
	ObjectType,
	Query,
	Resolver,
	Root,
	UseMiddleware
} from 'type-graphql';
import { getConnection } from 'typeorm';
import { Post, Updoot, User } from '../entities/index';
import { isAuth } from '../middleware/isAuth';

@InputType()
class PostInput {
	@Field()
	title: string;
	@Field()
	text: string;
}

@ObjectType()
class PaginatedPosts {
	@Field(() => [Post])
	posts: Post[];
	@Field()
	hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
	@FieldResolver(() => String)
	textSnippet(@Root() post: Post) {
		return post.text.slice(0, 50);
	}

	@FieldResolver(() => User)
	creator(@Root() post: Post, @Ctx() { userLoader }: MyContext) {
		return userLoader.load(post.creatorId);
	}

	@FieldResolver(() => Int, { nullable: true })
	async voteStatus(
		@Root() post: Post,
		@Ctx() { updootLoader, req }: MyContext
	) {
		const userId = req.session.userId;
		if (!userId) return null;
		const updoot = await updootLoader.load({ postId: post.id, userId });
		return updoot ? updoot.value : null;
	}

	@Mutation(() => Boolean)
	@UseMiddleware(isAuth)
	async vote(
		@Arg('postId', () => Int) postId: number,
		@Arg('value', () => Int) value: number,
		@Ctx() { req }: MyContext
	) {
		const { userId } = req.session;
		const isUpdoot = value !== -1;
		const realValue = isUpdoot ? 1 : -1;
		const updoot = await Updoot.findOne({ where: { postId, userId } });
		if (updoot && updoot.value !== realValue) {
			await getConnection().transaction(async (tm) => {
				await tm.query(
					`
						update updoot
						set value = $1
						where "postId" = $2 and "userId" = $3
					`,
					[realValue, postId, userId]
				);
				await tm.query(
					`
					update post
					set points = points + $1
					where id = $2
					`,
					[2 * realValue, postId]
				);
			});
		} else if (!updoot) {
			await getConnection().transaction(async (tm) => {
				await tm.query(
					`
						insert into updoot("userId", "postId" ,value)
						values ($1, $2, $3)
					`,
					[userId, postId, realValue]
				);
				await tm.query(
					`
					update post
					set points = points + $1
					where id = $2
					`,
					[realValue, postId]
				);
			});
		}
		return true;
	}

	@Query(() => PaginatedPosts)
	async posts(
		@Arg('limit', () => Int) limit: number,
		@Arg('cursor', () => String, { nullable: true }) cursor: string | null,
		@Ctx() { req }: MyContext
	): Promise<PaginatedPosts> {
		const realLimit = Math.min(50, limit);
		const realLimitPlusOne = realLimit + 1;
		const replacements: any[] = [realLimitPlusOne];
		if (cursor) {
			replacements.push(new Date(parseInt(cursor)));
		}
		/*
		// Using query builder
		const qb = getConnection()
			.getRepository(Post)
			.createQueryBuilder('p')
			.innerJoinAndSelect('p.creator', 'user', 'user.id = p.creatorId')
			.orderBy('p.createdAt', 'DESC')
			.take(realLimitPlusOne);
		if (cursor)
			qb.where(' p.createdAt < :cursor', {
				cursor: new Date(parseInt(cursor))
			});
		const posts = await qb.getMany();
		*/
		const posts = await getConnection().query(
			`
			select p.*
			from post p
			inner join public.user u on u.id = p."creatorId"
			${cursor ? `where p."createdAt" < $2` : ''}
			order by p."createdAt" DESC
			limit $1
			`,
			replacements
		);

		return {
			posts: posts.slice(0, realLimit),
			hasMore: posts.length === realLimitPlusOne
		};
	}

	@Query(() => Post, { nullable: true })
	post(@Arg('id', () => Int) id: number): Promise<Post | undefined> {
		return Post.findOne(id);
	}

	@Mutation(() => Post)
	@UseMiddleware(isAuth)
	async createPost(
		@Arg('options') options: PostInput,
		@Ctx() { req }: MyContext
	): Promise<Post | undefined> {
		const creatorId = req.session.userId;
		return Post.create({
			...options,
			creatorId
		}).save();
	}

	@Mutation(() => Post, { nullable: true })
	@UseMiddleware(isAuth)
	async updatePost(
		@Arg('id', () => Int) id: number,
		@Arg('title') title: string,
		@Arg('text') text: string,
		@Ctx() { req }: MyContext
	): Promise<Post | null> {
		const post = await getConnection()
			.createQueryBuilder()
			.update(Post)
			.set({ title, text })
			.where('id = :id and creatorId = :creatorId', {
				id,
				creatorId: req.session.userId
			})
			.returning('*')
			.execute();
		return post.raw[0];
	}

	@Mutation(() => Boolean)
	async deletePost(
		@Arg('id', () => Int) id: number,
		@Ctx() { req }: MyContext
	): Promise<boolean> {
		try {
			await Post.delete({ id, creatorId: req.session.userId });
			return true;
		} catch (error) {
			return false;
		}
	}
}
