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
import { Post } from '../entities/index';
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
	textSnippet(@Root() root: Post) {
		return root.text.slice(0, 50);
	}

	@Query(() => PaginatedPosts)
	async posts(
		@Arg('limit', () => Int) limit: number,
		@Arg('cursor', () => String, { nullable: true }) cursor: string | null
	): Promise<PaginatedPosts> {
		const realLimit = Math.min(50, limit);
		const realLimitPlusOne = realLimit + 1;
		const qb = getConnection()
			.getRepository(Post)
			.createQueryBuilder('p')
			.orderBy('"createdAt"', 'DESC')
			.take(realLimitPlusOne);
		if (cursor)
			qb.where(' "createdAt" < :cursor', {
				cursor: new Date(parseInt(cursor))
			});
		const posts = await qb.getMany();

		return {
			posts: posts.slice(0, realLimit),
			hasMore: posts.length === realLimitPlusOne
		};
	}

	@Query(() => Post, { nullable: true })
	post(@Arg('id') id: number): Promise<Post | undefined> {
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
	async updatePost(
		@Arg('id') id: number,
		@Arg('title') title: string
	): Promise<Post | null> {
		const post = await Post.findOne(id);
		if (!post) return null;
		if (typeof title !== 'undefined') {
			post.title = title;
			await Post.update({ id }, { title });
		}
		return post;
	}

	@Mutation(() => Boolean)
	async deletePost(@Arg('id') id: number): Promise<boolean> {
		try {
			await Post.delete(id);
			return true;
		} catch (error) {
			return false;
		}
	}
}
