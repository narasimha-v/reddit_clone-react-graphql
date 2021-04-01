import { Button } from '@chakra-ui/button';
import { Box, Flex, Heading, Link } from '@chakra-ui/layout';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { isServer } from '../utils/isServer';

interface NavbarProps {}

const Navbar: React.FC<NavbarProps> = () => {
	const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
	const [{ data, fetching }] = useMeQuery({ pause: isServer() });
	const router = useRouter();
	const body = () => {
		if (fetching) {
			return null;
		} else if (!data?.me) {
			return (
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
			return (
				<Flex>
					<Box color={'whiteAlpha.900'} fontWeight={'semibold'} mr={4}>
						{data.me.username}
					</Box>
					<Button
						variant='link'
						mr={4}
						isLoading={logoutFetching}
						onClick={async () => {
							await logout();
							router.reload();
						}}>
						Logout
					</Button>
				</Flex>
			);
		}
	};
	return (
		<Flex
			bg='linkedin.500'
			p={4}
			position='sticky'
			top={0}
			zIndex={1}
			alignItems='center'>
			<NextLink href='/'>
				<Link>
					<Heading color={'whiteAlpha.900'}>LiReddit</Heading>
				</Link>
			</NextLink>
			<Box ml={'auto'}>{body()}</Box>
		</Flex>
	);
};

export default Navbar;
