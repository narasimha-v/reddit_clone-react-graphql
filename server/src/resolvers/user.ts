import {
	Arg,
	Ctx,
	Field,
	InputType,
	Mutation,
	ObjectType,
	Query,
	Resolver
} from 'type-graphql';
import { MyContext } from 'src/types';
import argon2 from 'argon2';
import { User } from '../entities/User';
import { EntityManager } from '@mikro-orm/postgresql';
import { COOKIE_NAME } from '../constants';

@InputType()
class UsenamePasswordInput {
	@Field()
	username: string;
	@Field()
	password: string;
}

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

@Resolver()
export class UserResolver {
	@Query(() => User, { nullable: true })
	async me(@Ctx() { em, req }: MyContext): Promise<User | null> {
		if (!req.session.userId) return null;
		const user = await em.findOne(User, { id: req.session.userId });
		return user;
	}

	@Mutation(() => Boolean)
	async deleteUser(@Ctx() { em }: MyContext, @Arg('id') id: number) {
		try {
			await em.nativeDelete(User, { id });
			return true;
		} catch (error) {
			return false;
		}
	}

	@Mutation(() => UserResponse)
	async register(
		@Arg('options', () => UsenamePasswordInput) options: UsenamePasswordInput,
		@Ctx() { em, req }: MyContext
	): Promise<UserResponse> {
		const { username, password } = options;
		if (username.length <= 2) {
			return {
				errors: [
					{
						field: 'Username',
						message: 'Length must be greater than 2 charecters'
					}
				]
			};
		}
		if (password.length <= 5) {
			return {
				errors: [
					{
						field: 'Password',
						message: 'Length must be greater than 5 charecters'
					}
				]
			};
		}
		const hashedPassword = await argon2.hash(password);
		let user;
		try {
			const result = await (em as EntityManager)
				.createQueryBuilder(User)
				.getKnexQuery()
				.insert({
					username,
					password: hashedPassword,
					created_at: new Date(),
					updated_at: new Date()
				})
				.returning('*');
			user = result[0];
		} catch (error) {
			if (error.detail.includes('already exists')) {
				return {
					errors: [
						{
							field: 'Username',
							message: 'Username already taken'
						}
					]
				};
			}
		}
		req.session.userId = user.id;
		return { user };
	}

	@Mutation(() => UserResponse)
	async login(
		@Arg('options', () => UsenamePasswordInput) options: UsenamePasswordInput,
		@Ctx() { em, req }: MyContext
	): Promise<UserResponse> {
		const user = await em.findOne(User, { username: options.username });
		if (!user) {
			return {
				errors: [
					{
						field: 'username',
						message: `Usernsme doesn't exist`
					}
				]
			};
		}
		const valid = await argon2.verify(user.password, options.password);
		if (!valid) {
			return {
				errors: [
					{
						field: 'password',
						message: `Incorrect password`
					}
				]
			};
		}
		req.session.userId = user.id;
		return {
			user
		};
	}

	@Mutation(() => Boolean)
	logout(@Ctx() { req, res }: MyContext): Promise<boolean> {
		return new Promise((resolve) =>
			req.session.destroy((err) => {
				res.clearCookie(COOKIE_NAME);
				if (err) {
					console.error(err);

					resolve(false);
					return;
				}
				resolve(true);
			})
		);
	}
}
