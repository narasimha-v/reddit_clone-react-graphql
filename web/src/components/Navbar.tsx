import React from 'react';
import { Box, Flex, Link } from '@chakra-ui/layout';
import NextLink from 'next/link';
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { Button } from '@chakra-ui/button';
import { isServer } from '../utils/isServer';

interface NavbarProps {}

const Navbar: React.FC<NavbarProps> = () => {
	const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
	const [{ data, fetching }] = useMeQuery({ pause: isServer() });
	let body;
	if (fetching) {
		body = null;
	} else if (!data?.me) {
		body = (
			<>
				<NextLink href='/login'>
					<Link color={'whiteAlpha.900'} fontWeight={'semibold'} mr={4}>
						Login
					</Link>
				</NextLink>
				<NextLink href='/register'>
					<Link color={'whiteAlpha.900'} fontWeight={'semibold'} mr={4}>
						Register
					</Link>
				</NextLink>
			</>
		);
	} else {
		body = (
			<Flex>
				<Box color={'whiteAlpha.900'} fontWeight={'semibold'} mr={4}>
					{data.me.username}
				</Box>
				<Button
					variant='link'
					mr={4}
					isLoading={logoutFetching}
					onClick={() => {
						logout();
					}}>
					Logout
				</Button>
			</Flex>
		);
	}
	return (
		<Flex bg='whatsapp.700' p={4}>
			<Box ml={'auto'}>{body}</Box>
		</Flex>
	);
};

export default Navbar;
