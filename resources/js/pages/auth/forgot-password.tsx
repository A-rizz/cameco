import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Send } from 'lucide-react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('password.request.store'));
    };

    return (
        <AuthLayout
            title="Password Recovery Request"
            description="Enter your email and the superadmin will be notified to reset your password"
        >
            <Head title="Password Recovery" />

            {status && (
                <div className="mb-4 rounded-md bg-green-50 p-3 text-center text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-6">
                <div className="grid gap-2">
                    <Label htmlFor="email">Your email address</Label>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        autoComplete="email"
                        autoFocus
                        placeholder="email@example.com"
                        required
                    />
                    <InputError message={errors.email} />
                </div>

                <Button className="w-full" disabled={processing} type="submit">
                    {processing ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                        <Send className="h-4 w-4" />
                    )}
                    Send Reset Request
                </Button>
            </form>

            <div className="mt-4 space-x-1 text-center text-sm text-muted-foreground">
                <span>Remembered your password?</span>
                <TextLink href={route('login')}>Log in</TextLink>
            </div>
        </AuthLayout>
    );
}
