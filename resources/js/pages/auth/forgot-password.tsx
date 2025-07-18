// Components
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

export default function ForgotPassword({ status }: { status?: string }) {
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
                        {/* Larger logo with soft shadow */}
                        <span className="rounded-2xl bg-white/60 dark:bg-background/60 p-3 shadow-lg">
                            <svg className="size-14 fill-current text-primary drop-shadow-md" viewBox="0 0 40 42" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M17.2 5.63325L8.6 0.855469L0 5.63325V32.1434L16.2 41.1434L32.4 32.1434V23.699L40 19.4767V9.85547L31.4 5.07769L22.8 9.85547V18.2999L17.2 21.411V5.63325ZM38 18.2999L32.4 21.411V15.2545L38 12.1434V18.2999ZM36.9409 10.4439L31.4 13.5221L25.8591 10.4439L31.4 7.36561L36.9409 10.4439ZM24.8 18.2999V12.1434L30.4 15.2545V21.411L24.8 18.2999ZM23.8 20.0323L29.3409 23.1105L16.2 30.411L10.6591 27.3328L23.8 20.0323ZM7.6 27.9212L15.2 32.1434V38.2999L2 30.9666V7.92116L7.6 11.0323V27.9212ZM8.6 9.29991L3.05913 6.22165L8.6 3.14339L14.1409 6.22165L8.6 9.29991ZM30.4 24.8101L17.2 32.1434V38.2999L30.4 30.9666V24.8101ZM9.6 11.0323L15.2 7.92117V22.5221L9.6 25.6333V11.0323Z"
                                />
                            </svg>
                        </span>
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight text-primary drop-shadow-sm">Forgot Password</h1>
                    <p className="text-sm text-muted-foreground font-normal tracking-wide">Enter your email to reset</p>
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
                        className="mt-2 h-12 w-full rounded-full text-base font-semibold shadow-lg bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/80 transition-all duration-200"
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
