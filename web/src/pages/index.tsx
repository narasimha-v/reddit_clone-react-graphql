import { Flex, Stack } from '@chakra-ui/layout';
import { Box, Button, Heading, Spinner, Text } from '@chakra-ui/react';
import { withUrqlClient } from 'next-urql';
import NextLink from 'next/link';
import React, { useState } from 'react';
import Layout from '../components/Layout';
import UpdootSection from '../components/UpdootSection';
import { usePostsQuery } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';

const Index = () => {
	const [variables, setVariables] = useState({
		limit: 10,
		cursor: null as null | string
	});
	const [{ data, fetching }] = usePostsQuery({
		variables
	});
	if (!data && !fetching) {
		return (
			<Flex my={4}>
				<Box fontWeight='bold' m='auto' color='red.600'>
					Failed to fetch data.
				</Box>
			</Flex>
		);
	}

	return (
		<Layout>
			<Flex align='center'>
				<Heading>LiReddit</Heading>
				<NextLink href='/create-post'>
					<Button ml='auto' colorScheme='linkedin' variant='outline'>
						Create Post
					</Button>
				</NextLink>
			</Flex>
			<Box py={4} />
			{!data && fetching ? (
				<Stack direction='row' spacing={4}>
					<Spinner m='auto' size='xl' />
				</Stack>
			) : (
				<Stack>
					{data!.posts.posts.map((p) => (
						<Flex key={p.id} p={4} shadow='md' borderWidth='1px'>
							<UpdootSection post={p} />
							<Box>
								<Heading fontSize='xl'>{p.title}</Heading>
								<Text>Posted by {p.creator.username}</Text>
								<Text mt={4}>{p.textSnippet}</Text>
							</Box>
						</Flex>
					))}
				</Stack>
			)}
			{data && data.posts.hasMore && (
				<Flex my={4}>
					<Button
						isLoading={fetching}
						onClick={() => {
							setVariables({
								limit: variables.limit,
								cursor: data.posts.posts[data.posts.posts.length - 1].createdAt
							});
						}}
						m={'auto'}
						colorScheme='linkedin'
						variant='outline'>
						Load More
					</Button>
				</Flex>
			)}
		</Layout>
	);
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
