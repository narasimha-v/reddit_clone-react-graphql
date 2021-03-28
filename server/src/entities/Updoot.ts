import { Field, ObjectType } from 'type-graphql';
import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Post, User } from '.';

@Entity()
@ObjectType()
export class Updoot extends BaseEntity {
	@Column({ type: 'int' })
	value: number;

	@PrimaryColumn()
	userId: number;

	@ManyToOne(() => User, (user) => user.updoots)
	user: User;

	@PrimaryColumn()
	postId: number;

	@ManyToOne(() => Post, (post) => post.updoots, { onDelete: 'CASCADE' })
	post: Post;
}
