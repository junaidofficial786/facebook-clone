// Components
import { Head, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

export default function ForgotPassword({ status }: { status?: string }) {
    const { name } = usePage().props as any;
    const { data, setData, post, processing, errors } = useForm<Required<{ email: string }>>({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <AuthLayout title="Forgot password" description="Enter your email to receive a password reset link">
            <Head title="Forgot password" />

            <form
                className="mx-auto w-full max-w-md rounded-3xl bg-white/70 dark:bg-background/70 shadow-2xl px-6 py-6 flex flex-col gap-6 border border-white/30 dark:border-border backdrop-blur-md transition-all duration-300"
                onSubmit={submit}
                style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)' }}
            >
                <div className="flex flex-col items-center gap-2 mb-1">
                    <div className="flex items-center justify-center mb-2">
                        {/* App Logo with gradient background */}
                        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-4 shadow-lg">
                            <span className="text-3xl font-bold text-white">{name?.charAt(0)?.toUpperCase() || 'A'}</span>
                        </div>
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight text-primary drop-shadow-sm">Forgot Password</h1>
                    <p className="text-sm text-muted-foreground font-normal tracking-wide">Reset your {name || 'account'} password</p>
                </div>
                {status && <div className="mb-2 text-center text-sm font-medium text-green-600">{status}</div>}
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email" className="text-base font-medium">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            autoComplete="off"
                            value={data.email}
                            autoFocus
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="email@example.com"
                            className="h-12 text-base rounded-xl bg-white/80 dark:bg-background/80 border border-white/40 dark:border-border focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition-all duration-200 shadow-sm"
                        />
                        <InputError message={errors.email} />
                    </div>
                    <Button
                        variant="default"
                        className="mt-2 h-12 w-full rounded-full text-base font-semibold shadow-lg"
                        disabled={processing}
                    >
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Email password reset link
                    </Button>
                </div>
                <div className="text-center text-sm text-muted-foreground mt-1">
                    <span>Or, return to </span>
                    <TextLink href={route('login')}>log in</TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
