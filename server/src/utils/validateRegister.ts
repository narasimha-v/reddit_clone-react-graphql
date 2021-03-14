import { UsernamePasswordInput } from './UsernamePasswordInput';

export const validateRegister = (options: UsernamePasswordInput) => {
	const { username, password, email } = options;
	if (!email.includes('@')) {
		return [
			{
				field: 'Email',
				message: 'Invalid email'
			}
		];
	}
	if (username.length <= 2) {
		return [
			{
				field: 'Username',
				message: 'Length must be greater than 2 charecters'
			}
		];
	}
	if (username.includes('@')) {
		return [
			{
				field: 'Username',
				message: `Cannot include an '@'`
			}
		];
	}
	if (password.length <= 5) {
		return [
			{
				field: 'Password',
				message: 'Length must be greater than 5 charecters'
			}
		];
	}
	return null;
};
