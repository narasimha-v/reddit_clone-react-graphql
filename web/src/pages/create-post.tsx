import { Box, Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react';
import InputField from '../components/InputField';
import Layout from '../components/Layout';
import { useCreatePostMutation } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { useIsAuth } from '../utils/useIsAuth';

interface CreatePostProps {}

const CreatePost: React.FC<CreatePostProps> = () => {
	const router = useRouter();
	useIsAuth();
	const [, createPost] = useCreatePostMutation();
	return (
		<Layout variant='small'>
			<Formik
				initialValues={{ title: '', text: '' }}
				onSubmit={async (values, { setErrors }) => {
					const { error } = await createPost({ options: values });
					if (!error) router.push('/');
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
							Create Post
						</Button>
					</Form>
				)}
			</Formik>
		</Layout>
	);
};

export default withUrqlClient(createUrqlClient)(CreatePost);
