import React from 'react';
import { Box, Flex, Link } from '@chakra-ui/layout';
import NextLink from 'next/link';
import { useMeQuery } from '../generated/graphql';
import { Button } from '@chakra-ui/button';

interface NavbarProps {}

const Navbar: React.FC<NavbarProps> = () => {
	const [{ data, fetching }] = useMeQuery();
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
				<Button variant='link' mr={4}>
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
