import React from 'react';
import { Form, Formik } from 'formik';
import Wrapper from '../components/Wrapper';
import InputField from '../components/InputField';
import { Box } from '@chakra-ui/layout';
import { Button } from '@chakra-ui/button';
import { useRegisterMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from 'next/router';

interface RegisterProps {}

const Register: React.FC<RegisterProps> = () => {
	const [{}, register] = useRegisterMutation();
	const router = useRouter();
	return (
		<Wrapper variant='small'>
			<Formik
				initialValues={{ username: '', password: '' }}
				onSubmit={async (values, { setErrors }) => {
					const response = await register(values);
					if (response.data?.register.errors) {
						setErrors(toErrorMap(response.data.register.errors));
					} else if (response.data?.register.user) {
						router.push('/');
					}
				}}>
				{({ isSubmitting }) => (
					<Form>
						<InputField
							name='username'
							placeholder='username'
							label='Username'
							required={true}
						/>
						<Box my={4}>
							<InputField
								name='password'
								placeholder='password'
								label='Password'
								type='password'
								required={true}
							/>
						</Box>
						<Button type='submit' colorScheme='teal' isLoading={isSubmitting}>
							Register
						</Button>
					</Form>
				)}
			</Formik>
		</Wrapper>
	);
};

export default Register;
