import {
	FormControl,
	FormLabel,
	Input,
	Textarea,
	FormErrorMessage
} from '@chakra-ui/react';
import { useField } from 'formik';
import React from 'react';

type InputFieldProps = React.InputHTMLAttributes<
	HTMLTextAreaElement | HTMLInputElement
> & {
	label: string;
	name: string;
	textarea?: boolean;
	placeholder?: string;
};

const InputField: React.FC<InputFieldProps> = ({
	label,
	textarea,
	size: _,
	...props
}) => {
	let InputOrTextarea;
	InputOrTextarea = Input;
	if (textarea) {
		InputOrTextarea = Textarea;
	}
	const [field, { error }] = useField(props);
	return (
		<div>
			<FormControl isInvalid={!!error}>
				<FormLabel htmlFor={field.name}>{label}</FormLabel>
				<InputOrTextarea {...field} {...props} id={field.name} />
				{error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
			</FormControl>
		</div>
	);
};

export default InputField;
