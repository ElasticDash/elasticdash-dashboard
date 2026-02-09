'use client';
import { Controller, useForm } from 'react-hook-form';
import { useLogin } from '@/services/authService';
import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Link from '@fuse/core/Link';
import _ from 'lodash';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import FormLabel from '@mui/material/FormLabel';

/**
 * Form Validation Schema
 */
const schema = z.object({
	email: z.string().email('You must enter a valid email').nonempty('You must enter an email'),
	password: z.string().min(1, 'Please enter your password.'),
	remember: z.boolean().optional()
});

type FormType = z.infer<typeof schema>;

const defaultValues = {
	email: '',
	password: '',
	remember: true
};

function SignInPageForm() {
	const { control, formState, handleSubmit, reset } = useForm<FormType>({
		mode: 'onChange',
		defaultValues,
		resolver: zodResolver(schema)
	});

	const { isValid, dirtyFields, errors } = formState;
	const { handleLogin, loading, error } = useLogin();
	const router = useRouter();

	async function onSubmit(data: FormType) {
		const success = await handleLogin(data.email, data.password, !!data.remember);

		if (success) {
			reset(defaultValues);
			router.push('/test-results');
		}
	}

	return (
		<form
			name="loginForm"
			noValidate
			className="flex w-full flex-col justify-center gap-4"
			onSubmit={handleSubmit(onSubmit)}
		>
			{error && (
				<Typography
					color="error"
					variant="body2"
					sx={{ mb: 1 }}
				>
					{error}
				</Typography>
			)}
			<Controller
				name="email"
				control={control}
				render={({ field }) => (
					<FormControl>
						<FormLabel htmlFor="email">Email address</FormLabel>
						<TextField
							{...field}
							autoFocus
							type="email"
							error={!!errors.email}
							helperText={errors?.email?.message}
							required
							fullWidth
						/>
					</FormControl>
				)}
			/>

			<Controller
				name="password"
				control={control}
				render={({ field }) => (
					<FormControl>
						<FormLabel htmlFor="password">Password</FormLabel>
						<TextField
							{...field}
							type="password"
							error={!!errors.password}
							helperText={errors?.password?.message}
							required
							fullWidth
						/>
					</FormControl>
				)}
			/>

			<div className="flex flex-col items-center justify-center sm:flex-row sm:justify-between">
				<Controller
					name="remember"
					control={control}
					render={({ field }) => (
						<FormControl>
							<FormControlLabel
								label="Remember me"
								control={
									<Checkbox
										size="small"
										{...field}
									/>
								}
							/>
						</FormControl>
					)}
				/>

				<Link
					className="text-md font-medium"
					// to="/pages/auth/forgot-password"
					to="mailto:contact@elasticdash.com"
				>
					Forgot password?
				</Link>
			</div>

			<Button
				variant="contained"
				color="secondary"
				className="w-full"
				aria-label="Sign in"
				disabled={_.isEmpty(dirtyFields) || !isValid || loading}
				type="submit"
				size="medium"
			>
				{loading ? 'Signing in...' : 'Sign in'}
			</Button>

			<div className="flex items-center py-4">
				<div className="mt-px flex-auto border-t" />
				<Typography
					className="mx-2"
					color="text.secondary"
				>
					Or continue with
				</Typography>
				<div className="mt-px flex-auto border-t" />
			</div>

			<div className="flex items-center gap-4">
				<Button
					variant="outlined"
					className="flex-auto"
				>
					<FuseSvgIcon
						size={20}
						color="action"
					>
						feather:facebook
					</FuseSvgIcon>
				</Button>
				<Button
					variant="outlined"
					className="flex-auto"
				>
					<FuseSvgIcon
						size={20}
						color="action"
					>
						feather:twitter
					</FuseSvgIcon>
				</Button>
				<Button
					variant="outlined"
					className="flex-auto"
				>
					<FuseSvgIcon
						size={20}
						color="action"
					>
						feather:github
					</FuseSvgIcon>
				</Button>
			</div>
		</form>
	);
}

export default SignInPageForm;
