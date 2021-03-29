import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { Box, Heading, IconButton, Spinner, Stack } from '@chakra-ui/react';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react';
import Layout from '../../components/Layout';
import {
	useDeletePostMutation,
	useMeQuery,
	usePostQuery
} from '../../generated/graphql';
import { createUrqlClient } from '../../utils/createUrqlClient';

const Post = () => {
	const router = useRouter();
	const [{}, deletePost] = useDeletePostMutation();
	const [{ data: meData }] = useMeQuery();
	const intId =
		typeof router.query.id === 'string' ? parseInt(router.query.id) : -1;
	const [{ data, fetching }] = usePostQuery({
		pause: intId === -1,
		variables: {
			id: intId
		}
	});
	if (fetching) {
		return (
			<Layout>
				<Stack direction='row' spacing={4}>
					<Spinner m='auto' size='xl' />
				</Stack>
			</Layout>
		);
	}
	if (!data?.post) {
		return (
			<Layout>
				<Box>Could not find post</Box>
			</Layout>
		);
	}

	return (
		<Layout>
			<Heading mb={4}>{data.post.title}</Heading>
			{data.post.text}
			{meData?.me?.id === data.post.creator.id && (
				<Box my={4}>
					<IconButton
						aria-label='edit '
						colorScheme='green'
						size='lg'
						icon={<EditIcon w={4} h={4} color='whiteAlpha.900' />}
						onClick={async () => {
							if (!data.post) return;
							router.push(`/post/edit/${data.post.id}`);
						}}
						isActive
					/>
					<IconButton
						aria-label='delete '
						colorScheme='red'
						size='lg'
						mx={4}
						icon={<DeleteIcon w={4} h={4} color='whiteAlpha.900' />}
						onClick={async () => {
							if (!data.post) return;
							await deletePost({ id: data.post.id });
							router.replace('/');
						}}
						isActive
					/>
				</Box>
			)}
		</Layout>
	);
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
