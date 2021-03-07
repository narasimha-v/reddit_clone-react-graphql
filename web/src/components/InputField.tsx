import {
	FormControl,
	FormLabel,
	Input,
	FormErrorMessage
} from '@chakra-ui/react';
import { useField } from 'formik';
import React from 'react';

type InputFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
	label: string;
	name: string;
	placeholder?: string;
};

const InputField: React.FC<InputFieldProps> = (props) => {
	const [field, { error }] = useField(props);
	return (
		<div>
			<FormControl isInvalid={!!error}>
				<FormLabel htmlFor={field.name}>{props.label}</FormLabel>
				<Input
					{...field}
					id={field.name}
					placeholder={props.placeholder}
					type={props.type}
					required={props.required}
				/>
				{error && <FormErrorMessage>{error}</FormErrorMessage>}
			</FormControl>
		</div>
	);
};

export default InputField;
