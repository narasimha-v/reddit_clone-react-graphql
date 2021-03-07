import React from 'react';
import { Form, Formik } from 'formik';
import Wrapper from '../components/Wrapper';
import InputField from '../components/InputField';
import { Box } from '@chakra-ui/layout';
import { Button } from '@chakra-ui/button';

interface RegisterProps {}

const Register: React.FC<RegisterProps> = () => {
	return (
		<Wrapper variant='small'>
			<Formik
				initialValues={{ username: '', password: '' }}
				onSubmit={(values) => {
					console.log(values);
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
