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
		const user = em.create(User, {
			username,
			password: hashedPassword
		});
		try {
			await em.persistAndFlush(user);
		} catch (error) {
			if (error.code === '23505') {
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
}
