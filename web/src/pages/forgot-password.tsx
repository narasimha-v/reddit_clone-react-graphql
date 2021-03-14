import React, { useState } from 'react';
import { Box, Link, Button } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import InputField from '../components/InputField';
import Wrapper from '../components/Wrapper';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { useForgotPasswordMutation } from '../generated/graphql';
import NextLink from 'next/link';

const ForgotPassword: React.FC<{}> = () => {
	const [complete, setComplete] = useState(false);
	const [, forgotPassword] = useForgotPasswordMutation();
	return (
		<Wrapper variant='small'>
			<Formik
				initialValues={{ email: '' }}
				onSubmit={async (values) => {
					await forgotPassword(values);
					setComplete(true);
				}}>
				{({ isSubmitting }) =>
					complete ? (
						<>
							<Box my={4} color={'teal.400'}>
								Please check your email
							</Box>
							<NextLink href='/'>
								<Link color={'teal.400'} fontWeight={'semibold'}>
									back to home
								</Link>
							</NextLink>
						</>
					) : (
						<Form>
							<Box my={4}>
								<InputField
									name='email'
									placeholder='email'
									label='Email'
									required={true}
								/>
							</Box>
							<Button type='submit' colorScheme='teal' isLoading={isSubmitting}>
								Forgot Password
							</Button>
						</Form>
					)
				}
			</Formik>
		</Wrapper>
	);
};

export default withUrqlClient(createUrqlClient)(ForgotPassword);
