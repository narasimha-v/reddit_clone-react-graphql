import { Box, Button } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { NextPage } from 'next';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import InputField from '../../components/InputField';
import Wrapper from '../../components/Wrapper';
import { useChangePasswordMutation } from '../../generated/graphql';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { toErrorMap } from '../../utils/toErrorMap';

const ChangePassword: NextPage<{ token?: string }> = ({ token }) => {
	const [{}, changePassword] = useChangePasswordMutation();
	const [tokenError, setTokenError] = useState('');
	const router = useRouter();
	return (
		<Wrapper variant='small'>
			<Formik
				initialValues={{ newPassword: '' }}
				onSubmit={async (values, { setErrors }) => {
					const response = await changePassword({
						token: token!,
						newPassword: values.newPassword
					});
					if (response.data?.changePassword.errors) {
						const errorMap = toErrorMap(response.data.changePassword.errors);
						if ('token' in errorMap) setTokenError(errorMap.token);
						setErrors(errorMap);
					} else if (response.data?.changePassword.user) {
						router.push('/');
					}
				}}>
				{({ isSubmitting }) => (
					<Form>
						<InputField
							name='newPassword'
							placeholder='new password'
							label='New Password'
							type='password'
							required={true}
						/>
						{tokenError && <Box color='red.500'>{tokenError}</Box>}
						<Button
							my={4}
							type='submit'
							colorScheme='teal'
							isLoading={isSubmitting}>
							Change Password
						</Button>
					</Form>
				)}
			</Formik>
		</Wrapper>
	);
};

ChangePassword.getInitialProps = ({ query }) => {
	return {
		token: query.token as string
	};
};

export default withUrqlClient(createUrqlClient)(ChangePassword);
