import { Head, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { Checkbox } from '@/components/ui/checkbox';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { name } = usePage().props as any;
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout title="Log in to your account" description="Enter your email and password below to log in">
            <Head title="Log in" />

            <form
                className="mx-auto w-full max-w-md rounded-3xl bg-white/70 dark:bg-background/70 shadow-2xl px-10 py-12 flex flex-col gap-10 border border-white/30 dark:border-border backdrop-blur-md transition-all duration-300"
                onSubmit={submit}
                style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)' }}
            >
                <div className="flex flex-col items-center gap-4 mb-2">
                    <div className="flex items-center justify-center mb-2">
                        {/* App Logo with gradient background */}
                        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-4 shadow-lg">
                            <span className="text-3xl font-bold text-white">{name?.charAt(0)?.toUpperCase() || 'A'}</span>
                        </div>
                    </div>
                    <h1 className="text-3xl font-semibold tracking-tight text-primary drop-shadow-sm">Welcome Back</h1>
                    <p className="text-base text-muted-foreground font-normal tracking-wide">Sign in to {name || 'your account'}</p>
                </div>
                <div className="grid gap-7">
                    <div className="grid gap-2">
                        <Label htmlFor="email" className="text-base font-semibold">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="email@example.com"
                            className="h-12 text-base rounded-lg bg-white/60 dark:bg-background/60 border border-border focus:ring-2 focus:ring-primary/30"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password" className="text-base font-semibold">Password</Label>
                            {canResetPassword && (
                                <TextLink href={route('password.request')} className="ml-auto text-xs text-muted-foreground hover:underline" tabIndex={5}>
                                    Forgot password?
                                </TextLink>
                            )}
                        </div>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Password"
                            className="h-12 text-base rounded-lg bg-white/60 dark:bg-background/60 border border-border focus:ring-2 focus:ring-primary/30"
                        />
                        <InputError message={errors.password} />
                    </div>

                    {/* Keep me signed in checkbox */}
                    <div className="flex items-center gap-2 mb-2">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onCheckedChange={(checked) => setData('remember', !!checked)}
                            tabIndex={3}
                        />
                        <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground select-none cursor-pointer">Keep me signed in</Label>
                    </div>

                    <Button
                        type="submit"
                        variant="default"
                        tabIndex={4}
                        disabled={processing}
                    >
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Log in
                    </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground mt-2">
                    Don't have an account?{' '}
                    <TextLink href={route('register')} tabIndex={5}>
                        Sign up
                    </TextLink>
                </div>
            </form>

            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
        </AuthLayout>
    );
}
