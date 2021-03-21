import argon2 from 'argon2';
import { MyContext } from 'src/types';
import {
	Arg,
	Ctx,
	Field,
	Mutation,
	ObjectType,
	Query,
	Resolver
} from 'type-graphql';
import { getConnection } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { COOKIE_NAME, FORGOT_PASSWORD_PREFIX } from '../constants';
import { User } from '../entities/User';
import { sendMail } from '../utils/sendEmail';
import { UsernamePasswordInput } from '../utils/UsernamePasswordInput';
import { validateRegister } from '../utils/validateRegister';

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
	me(@Ctx() { req }: MyContext) {
		if (!req.session.userId) return undefined;
		return User.findOne(req.session.userId);
	}

	@Mutation(() => UserResponse)
	async changePassword(
		@Ctx() { redis, req }: MyContext,
		@Arg('token') token: string,
		@Arg('newPassword') newPassword: string
	): Promise<UserResponse> {
		if (newPassword.length <= 5) {
			return {
				errors: [
					{
						field: 'newPassword',
						message: 'Length must be greater than 5 charecters'
					}
				]
			};
		}
		const userId = await redis.get(FORGOT_PASSWORD_PREFIX + token);
		if (!userId) {
			return {
				errors: [
					{
						field: 'token',
						message: 'token expired'
					}
				]
			};
		}
		const userIdParsed = parseInt(userId);
		const user = await User.findOne(userIdParsed);
		if (!user) {
			return {
				errors: [
					{
						field: 'token',
						message: 'user no longer exists'
					}
				]
			};
		}
		const password = await argon2.hash(newPassword);
		await User.update({ id: userIdParsed }, { password });
		await redis.del(FORGOT_PASSWORD_PREFIX + token);
		req.session.userId = user.id;
		return { user };
	}

	@Mutation(() => Boolean)
	async forgotPassword(
		@Ctx() { redis }: MyContext,
		@Arg('email') email: string
	) {
		const user = await User.findOne({ where: { email } });
		if (!user) return true;
		const token = uuid();
		await redis.set(
			FORGOT_PASSWORD_PREFIX + token,
			user.id,
			'ex',
			1000 * 60 * 60 * 24 * 3
		);
		await sendMail(
			email,
			`<a href='http://localhost:3000/change-password/${token}'>reset password</a>`
		);
		return true;
	}

	@Mutation(() => Boolean)
	async deleteUser(@Arg('id') id: number) {
		try {
			await User.delete(id);
			return true;
		} catch (error) {
			return false;
		}
	}

	@Mutation(() => UserResponse)
	async register(
		@Arg('options', () => UsernamePasswordInput) options: UsernamePasswordInput,
		@Ctx() { req }: MyContext
	): Promise<UserResponse> {
		const { username, password, email } = options;
		const errors = validateRegister(options);
		if (errors) return { errors };
		const hashedPassword = await argon2.hash(password);
		let user;
		try {
			const result = await getConnection()
				.createQueryBuilder()
				.insert()
				.into(User)
				.values([{ username, password: hashedPassword, email }])
				.returning('*')
				.execute();
			user = result.raw[0];
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
		@Arg('usernameOrEmail') usernameOrEmail: string,
		@Arg('password') password: string,
		@Ctx() { req }: MyContext
	): Promise<UserResponse> {
		const user = await User.findOne(
			usernameOrEmail.includes('@')
				? { where: { email: usernameOrEmail } }
				: { where: { username: usernameOrEmail } }
		);
		if (!user) {
			return {
				errors: [
					{
						field: 'usernameOrEmail',
						message: `Usernsme doesn't exist`
					}
				]
			};
		}
		const valid = await argon2.verify(user.password, password);
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
