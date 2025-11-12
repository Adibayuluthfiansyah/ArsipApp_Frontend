// app/login/page.tsx
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Image from 'next/image';
import { Spinner } from '@/components/ui/spinner';


export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        await login (email, password);
    } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Login Gagal');
    } finally {
        setLoading(false);
    }
};

    return (
    <div className="min-h-screen flex items-center justify-center p-4">
    <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-3 text-center">
        <div className="mx-auto rounded-2xl flex items-center justify-center shadow-lg">
            <Image
            src="/logodinsos.png"
            alt="Logo"
            width={200}
            height={200}
            />
        </div>
        <CardTitle className="text-2xl font-bold">Sistem Arsip Digital</CardTitle>
        <CardDescription className="text-foreground/70">
            Masuk ke akun Anda untuk mengakses dokumen
        </CardDescription>
        </CardHeader>
        <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
            <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
            </Alert>
            )}
            
            <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
                id="email"
                type="email"
                placeholder="nama@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            </div>

            <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Memproses...' : 'Masuk' } {loading && <Spinner className="ml-2" />}
            </Button>
        </form>
        </CardContent>
    </Card>
    </div>
);
}