import { Head, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

interface ResetPasswordProps {
    token: string;
    email: string;
}

type ResetPasswordForm = {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const { name } = usePage().props as any;
    const { data, setData, post, processing, errors, reset } = useForm<Required<ResetPasswordForm>>({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title="Reset password" description="Please enter your new password below">
            <Head title="Reset password" />

            <form
                className="mx-auto w-full max-w-md rounded-3xl bg-white/70 dark:bg-background/70 shadow-2xl px-6 py-6 flex flex-col gap-6 border border-white/30 dark:border-border backdrop-blur-md transition-all duration-300"
                onSubmit={submit}
                style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)' }}
            >
                <div className="flex flex-col items-center gap-2 mb-1">
                    <div className="flex items-center justify-center mb-2">
                        {/* App Logo with gradient background */}
                        <div className="rounded-2xl bg-gradient-to-br from-primary to-blue-600 p-4 shadow-lg">
                            <span className="text-3xl font-bold text-white">{name?.charAt(0)?.toUpperCase() || 'A'}</span>
                        </div>
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight text-primary drop-shadow-sm">Reset Password</h1>
                    <p className="text-sm text-muted-foreground font-normal tracking-wide">Set your new {name || 'account'} password</p>
                </div>
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email" className="text-base font-medium">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            autoComplete="email"
                            value={data.email}
                            className="h-12 text-base rounded-xl bg-white/80 dark:bg-background/80 border border-white/40 dark:border-border focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition-all duration-200 shadow-sm"
                            readOnly
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password" className="text-base font-medium">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            autoComplete="new-password"
                            value={data.password}
                            className="h-12 text-base rounded-xl bg-white/80 dark:bg-background/80 border border-white/40 dark:border-border focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition-all duration-200 shadow-sm"
                            autoFocus
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Password"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation" className="text-base font-medium">Confirm password</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            className="h-12 text-base rounded-xl bg-white/80 dark:bg-background/80 border border-white/40 dark:border-border focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition-all duration-200 shadow-sm"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            placeholder="Confirm password"
                        />
                        <InputError message={errors.password_confirmation} className="mt-2" />
                    </div>

                    <Button
                        type="submit"
                        variant="default"
                        className="mt-2 h-12 w-full rounded-full text-base font-semibold shadow-lg"
                        disabled={processing}
                    >
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Reset password
                    </Button>
                </div>
            </form>
        </AuthLayout>
    );
}
