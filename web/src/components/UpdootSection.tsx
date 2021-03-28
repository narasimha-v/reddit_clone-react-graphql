import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons';
import { Flex, IconButton } from '@chakra-ui/react';
import React from 'react';
import { PostSnippetFragment, useVoteMutation } from '../generated/graphql';

interface UpdootSectionProps {
	post: PostSnippetFragment;
}

const UpdootSection: React.FC<UpdootSectionProps> = ({
	post: { id, points, voteStatus }
}) => {
	const [{}, vote] = useVoteMutation();
	return (
		<Flex direction='column' justifyContent='center' alignItems='center' mr={4}>
			<IconButton
				aria-label='Upvote'
				size='xs'
				icon={
					<TriangleUpIcon
						w={4}
						h={4}
						color={voteStatus === 1 ? 'green.400' : 'linkedin.300'}
					/>
				}
				onClick={() => {
					if (voteStatus === 1) return;
					vote({
						postId: id,
						value: 1
					});
				}}
			/>
			{points}
			<IconButton
				aria-label='Downvote'
				size='xs'
				icon={
					<TriangleDownIcon
						w={4}
						h={4}
						color={voteStatus === -1 ? 'red.400' : 'linkedin.300'}
					/>
				}
				onClick={() => {
					if (voteStatus === -1) return;
					vote({
						postId: id,
						value: -1
					});
				}}
			/>
		</Flex>
	);
};

export default UpdootSection;
