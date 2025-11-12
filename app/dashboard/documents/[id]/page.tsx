'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { documentAPI, categoryAPI } from '@/lib/api';
import { Document, Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Edit, Download, Trash2, Save, X, FileText, Calendar, User, FolderOpen, Hash } from 'lucide-react';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';

export default function DocumentDetailPage() {
const router = useRouter();
const params = useParams();
const [documentData, setDocumentData] = useState<Document | null>(null);
const [categories, setCategories] = useState<Category[]>([]);
const [loading, setLoading] = useState(true);
const [isEditing, setIsEditing] = useState(false);
const [formData, setFormData] = useState({
    title: '',
    description: '',
    document_date: '',
    category_id: '',
});

useEffect(() => {
    const fetchAllData = async () => {
    await fetchDocument();
    await fetchCategories();
    };
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [params.id]);

const fetchDocument = async () => {
    try {
    const doc = await documentAPI.getById(Number(params.id));
    setDocumentData(doc);
    setFormData({
        title: doc.title,
        description: doc.description || '',
        document_date: doc.document_date,
        category_id: String(doc.category_id),
    });
    } catch (error) {
    console.error('Error fetching document:', error);
    toast.error('Gagal memuat dokumen');
    } finally {
    setLoading(false);
    }
};

const fetchCategories = async () => {
    try {

    const response = await categoryAPI.getAll() as unknown as Category[];
    setCategories(response);
    } catch (error) {
    console.error('Error fetching categories:', error);
    toast.error('Gagal memuat kategori');
    }
};

const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
    await documentAPI.update(Number(params.id), formData);
    setIsEditing(false);
    fetchDocument();
    } catch (error: unknown) {
    console.error('Error updating document:', error);
    toast.error('Gagal update dokumen');

      // Type guard untuk error handling
    if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
        response?: {
            data?: {
            message?: string;
            };
        };
    };
        alert(axiosError.response?.data?.message || 'Gagal update dokumen');
    } else if (error instanceof Error) {
        alert(error.message);
    } else {
        alert('Gagal update dokumen');
        toast.error('Gagal update dokumen');
    }
    }
};

    const handleDownload = async () => {
    if (!documentData) return;
    try {
    const response = await documentAPI.download(documentData.id);
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', documentData.file_name);
    document.body.appendChild(link);
    link.click();
    link.remove();
    } catch (error) {
    console.error('Error downloading document:', error);
    toast.error('Gagal mendownload dokumen');
    }
};

const handleDelete = async () => {
    if (!confirm('Yakin ingin menghapus dokumen ini?')) return;

    try {
    await documentAPI.delete(Number(params.id));
    router.push('/dashboard/documents');
    } catch (error) {
    console.error('Error deleting document:', error);
    toast.error('Gagal menghapus dokumen');
    }
};

    const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    });
};

if (loading) {
    return (
    <div className="flex items-center justify-center ">
        <Spinner className="h-12 w-12" />
    </div>
    );
}

if (!documentData) {
    return (
    <div className="text-center py-12">
        <p className="text-muted-foreground">Dokumen tidak ditemukan</p>
    </div>
    );
}

return (
    <div className="space-y-6 max-w-4xl">
    <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
            </Button>
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Detail Dokumen</h1>
            <p className="text-muted-foreground mt-2">
                Lihat dan kelola informasi dokumen
            </p>
        </div>
        </div>
        {!isEditing && (
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setIsEditing(true)}>
            <Edit className="mr-2 h-4 w-4" />
                Edit
            </Button>
            <Button variant="outline" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus
            </Button>
        </div>
        )}
        </div>

    <Card>
        <CardHeader>
            <div className="flex items-start justify-between">
                <div className="flex-1">
            <CardTitle className="text-2xl">{documentData.title}</CardTitle>
            <CardDescription className="mt-2">
                Nomor: {documentData.document_number}
            </CardDescription>
            </div>
            <Badge variant={documentData.status === 'active' ? 'default' : 'secondary'}>
            {documentData.status}
            </Badge>
        </div>
        </CardHeader>
        <CardContent>
        {isEditing ? (
            <form onSubmit={handleUpdate} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="title">Judul Dokumen</Label>
                <Input
                id="title"
                required
                value={formData.title}
                onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
                }
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                <Label htmlFor="document_date">Tanggal Dokumen</Label>
                <Input
                    id="document_date"
                    type="date"
                    required
                    value={formData.document_date}
                    onChange={(e) =>
                    setFormData({ ...formData, document_date: e.target.value })
                    }
                />
                </div>

                <div className="space-y-2">
                <Label htmlFor="category">Kategori</Label>
                <Select
                    value={formData.category_id}
                    onValueChange={(value) =>
                    setFormData({ ...formData, category_id: value })
                    }
                >
                    <SelectTrigger id="category">
                    <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                    {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                }
                />
            </div>

            <div className="flex justify-end gap-3">
                <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
                >
                <X className="mr-2 h-4 w-4" />
                Batal
                </Button>
                <Button type="submit">
                    <Save className="mr-2 h-4 w-4" />
                    Simpan Perubahan
                </Button>
            </div>
            </form>
        ) : (
            <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                <div className="flex items-start gap-3">
                    <Hash className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                    <p className="text-sm font-medium text-muted-foreground">Nomor Dokumen</p>
                    <p className="text-base font-mono">{documentData.document_number}</p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                    <p className="text-sm font-medium text-muted-foreground">Tanggal Dokumen</p>
                    <p className="text-base">{formatDate(documentData.document_date)}</p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <FolderOpen className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                    <p className="text-sm font-medium text-muted-foreground">Kategori</p>
                    <p className="text-base">{documentData.category?.name}</p>
                    </div>
                </div>
                </div>

                <div className="space-y-4">
                <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                    <p className="text-sm font-medium text-muted-foreground">Nama File</p>
                    <p className="text-base break-all">{documentData.file_name}</p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                    <p className="text-sm font-medium text-muted-foreground">Info File</p>
                    <p className="text-base">
                        {formatFileSize(documentData.file_size)} • {documentData.file_type}
                    </p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                    <p className="text-sm font-medium text-muted-foreground">Diupload Oleh</p>
                    <p className="text-base">{documentData.uploader?.name}</p>
                    <p className="text-sm text-muted-foreground">
                        {formatDate(documentData.created_at)}
                    </p>
                    </div>
                </div>
                </div>
            </div>

            {documentData.description && (
                <>
                <Separator />
                <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Deskripsi</p>
                    <p className="text-base whitespace-pre-wrap">{documentData.description}</p>
                </div>
                </>
            )}
            </div>
        )}
        </CardContent>
    </Card>
    </div>
);
}