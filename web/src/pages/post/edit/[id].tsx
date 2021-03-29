import { Box, Button, Spinner, Stack } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import InputField from '../../../components/InputField';
import Layout from '../../../components/Layout';
import {
	useMeQuery,
	usePostQuery,
	useUpdatePostMutation
} from '../../../generated/graphql';
import { createUrqlClient } from '../../../utils/createUrqlClient';

interface EditPostProps {}

const EditPost: React.FC<EditPostProps> = () => {
	const router = useRouter();
	const intId =
		typeof router.query.id === 'string' ? parseInt(router.query.id) : -1;
	const [{ data: meData, fetching: meFetching }] = useMeQuery();
	const [{ data, fetching }] = usePostQuery({
		pause: intId === -1,
		variables: {
			id: intId
		}
	});
	const [, updatePost] = useUpdatePostMutation();
	useEffect(() => {
		if (
			!meFetching &&
			(!meData?.me || meData?.me?.id !== data?.post?.creator.id)
		)
			router.replace(`/`);
	}, [meFetching, meData, router]);
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
		<Layout variant='small'>
			<Formik
				initialValues={{ title: data.post.title, text: data.post.text }}
				onSubmit={async (values, { setErrors }) => {
					const { error } = await updatePost({
						id: intId,
						...values
					});
					if (!error) router.back();
				}}>
				{({ isSubmitting }) => (
					<Form>
						<InputField
							name='title'
							placeholder='title'
							label='Title'
							required
						/>
						<Box my={4}>
							<InputField
								name='text'
								placeholder='text...'
								label='Body'
								required
								textarea
							/>
						</Box>
						<Button type='submit' colorScheme='teal' isLoading={isSubmitting}>
							Update Post
						</Button>
					</Form>
				)}
			</Formik>
		</Layout>
	);
};

export default withUrqlClient(createUrqlClient)(EditPost);
