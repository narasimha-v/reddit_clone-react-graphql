import DataLoader from 'dataloader';
import { Updoot, User } from '../entities';

export const createUpdootLoader = () =>
	new DataLoader<{ postId: number; userId: number }, Updoot | null>(
		async (keys) => {
			const updoots = await Updoot.findByIds(keys as any);
			const updootIdsToUpdoot: Record<string, Updoot> = {};
			updoots.forEach((u) => {
				updootIdsToUpdoot[`${u.userId}|${u.postId}`] = u;
			});
			return keys.map((k) => updootIdsToUpdoot[`${k.userId}|${k.postId}`]);
		}
	);
