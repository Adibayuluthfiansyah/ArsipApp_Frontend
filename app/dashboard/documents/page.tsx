'use client';
import { useEffect, useState, useCallback } from 'react';
import { documentAPI, categoryAPI } from '@/lib/api';
import { Document, Category, PaginatedResponse } from '@/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner'; 
import { Spinner } from '@/components/ui/spinner';
import { Upload, Download, Eye, Trash2, Search, Filter, FileText } from 'lucide-react';

const initialPaginationState: PaginatedResponse<Document> = {
    data: [],
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
    from: 0,
    to: 0,
};

interface ConfirmationDialogProps {
isOpen: boolean;
onConfirm: () => void;
onCancel: () => void;
}


function ConfirmationDialog({ isOpen, onConfirm, onCancel }: ConfirmationDialogProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="w-full max-w-sm">
            <CardHeader>
            <CardTitle>Konfirmasi Hapus</CardTitle>
            </CardHeader>
        <CardContent className='space-y-4'>
        <p>Apakah Anda yakin ingin menghapus dokumen ini secara permanen?</p>
        <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onCancel}>
                Batal
            </Button>
            <Button variant="destructive" onClick={onConfirm}>
                Hapus
            </Button>
        </div>
        </CardContent>
    </Card>
    </div>
);
}


export default function DocumentsPage() {
    const [documents, setDocuments] = useState<PaginatedResponse<Document>>(initialPaginationState);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all'); 
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [documentToDelete, setDocumentToDelete] = useState<number | null>(null);


    const fetchCategories = useCallback(async () => {
        try {
            const response = await categoryAPI.getAll(); 
            setCategories(response as Category[]); 
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Gagal memuat kategori.');
        }
    }, []);


    const fetchDocuments = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params: {
                page: number;
                search?: string;
                category_id?: string | number;
            } = { page };


            if (search) {
                params.search = search;
            }


            if (categoryFilter && categoryFilter !== 'all') {
                params.category_id = categoryFilter; 
            }


    const response = await documentAPI.getAll(params); 
    const typedResponse: PaginatedResponse<Document> = {
            data: response.data as Document[], // Mengasumsikan data adalah array Document[]
            current_page: response.pagination.current_page,
            last_page: response.pagination.last_page,
            per_page: response.pagination.per_page,
            total: response.pagination.total,
            from: response.pagination.from,
            to: response.pagination.to,
        };
        setDocuments(typedResponse); 

        } catch (error) {
            console.error('Error fetching documents:', error);
            toast.error('Gagal memuat dokumen.');
        } finally {
            setLoading(false);
        }
    }, [search, categoryFilter]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]); 

    useEffect(() => {
        fetchDocuments();
    }, [search, categoryFilter, fetchDocuments]); 


    const handleDownload = async (doc: Document) => {
        toast.loading(`Mendownload ${doc.file_name}...`);
        try {
            const response = await documentAPI.download(doc.id);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', doc.file_name);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url); 
            toast.dismiss();
            toast.success('Dokumen berhasil didownload!');
        } catch (error) {
            console.error('Error downloading document:', error);
            toast.dismiss();
            toast.error('Gagal mendownload dokumen.');
        }
    };

    // Handler untuk membuka dialog konfirmasi
    const handleConfirmDelete = (id: number) => {
        setDocumentToDelete(id);
        setIsConfirmOpen(true);
    };

    // Handler untuk aksi hapus yang sebenarnya
    const handleDelete = async () => {
        if (!documentToDelete) return;

        setIsConfirmOpen(false);
        toast.loading('Menghapus dokumen...');
        
        try {
            await documentAPI.delete(documentToDelete);
            toast.dismiss();
            toast.success('Dokumen berhasil dihapus.');
            fetchDocuments(documents.current_page); 
        } catch (error) {
            console.error('Error deleting document:', error);
            toast.dismiss();
            toast.error('Gagal menghapus dokumen.');
        } finally {
            setDocumentToDelete(null);
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
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="space-y-6">
            <ConfirmationDialog 
                isOpen={isConfirmOpen}
                onConfirm={handleDelete}
                onCancel={() => setIsConfirmOpen(false)}
            />
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Arsip Dokumen</h1>
                    <p className="text-muted-foreground mt-2">
                        Kelola dan cari dokumen dinas Anda
                    </p>
                </div>
                {/* Link ini mengarah ke halaman upload */}
                <Link href="/dashboard/documents/upload"> 
                    <Button>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Dokumen Baru
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Filter className="h-5 w-5 text-primary" />
                        Filter & Pencarian
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="search">Cari Dokumen (Judul/Nomor)</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="search"
                                    placeholder="Cari berdasarkan judul, nomor dokumen..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category">Filter Kategori</Label>
                            <Select 
                                value={categoryFilter} 
                                onValueChange={(value) => setCategoryFilter(value)}
                            >
                                <SelectTrigger id="category">
                                    <SelectValue placeholder="Semua Kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    {/* Nilai 'all' akan membuat category_id tidak dikirim ke API */}
                                    <SelectItem value="all">Semua Kategori</SelectItem>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id.toString()}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Documents Table */}
            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-primary">
                            <Spinner className="h-8 w-8 text-primary" /> 
                            <p className="mt-2 text-sm text-muted-foreground">Memuat dokumen...</p>
                        </div>
                    ) : documents.data.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                            <p>Tidak ada dokumen ditemukan.</p>
                            {/* Jika filter diterapkan dan hasilnya nol */}
                            {(search || categoryFilter !== 'all') && (
                                <p className='text-sm mt-1'>Coba ubah kata kunci pencarian atau filter.</p>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Judul</TableHead>
                                            <TableHead>Nomor Dokumen</TableHead>
                                            <TableHead>Kategori</TableHead>
                                            <TableHead>Ukuran</TableHead>
                                            <TableHead>Tanggal Dokumen</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {documents.data.map((doc) => (
                                            <TableRow key={doc.id}>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{doc.title}</p>
                                                        {/* Optional Chaining, karena uploader bisa null */}
                                                        <p className="text-sm text-muted-foreground">
                                                            Diunggah oleh: {doc.uploader?.name || 'Unknown'} 
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-mono text-sm">
                                                    {doc.document_number}
                                                </TableCell>
                                                <TableCell>
                                                    {/* Optional Chaining, karena category bisa null */}
                                                    <Badge variant="secondary">{doc.category?.name || 'Uncategorized'}</Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {formatFileSize(doc.file_size)}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {formatDate(doc.document_date)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link href={`/dashboard/documents/${doc.id}`}>
                                                            <Button variant="ghost" size="icon" title="Lihat Detail">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            title="Download"
                                                            onClick={() => handleDownload(doc)}
                                                        >
                                                            <Download className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            title="Hapus Dokumen"
                                                            onClick={() => handleConfirmDelete(doc.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t gap-3">
                                <div className="text-sm text-muted-foreground">
                                    Menampilkan {documents.from} - {documents.to} dari {documents.total} total dokumen.
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => fetchDocuments(documents.current_page - 1)}
                                        disabled={documents.current_page === 1 || loading}
                                    >
                                        Previous
                                    </Button>
                                    <div className="text-sm">
                                        Halaman {documents.current_page} dari {documents.last_page}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => fetchDocuments(documents.current_page + 1)}
                                        disabled={documents.current_page === documents.last_page || loading}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}