"use client";

import { useEffect, useState } from "react";
import { documentStaffAPI } from "@/lib/api";
import { DocumentStaff } from "@/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Eye,
  Trash2,
  Search,
  Filter,
  FileText,
  Clock,
  MoreVertical,
  Download,
  Pencil, // Icon Edit
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function MyDocumentPage() {
  const [documents, setDocuments] = useState<DocumentStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [letterTypeFilter, setLetterTypeFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [docToDelete, setDocToDelete] = useState<DocumentStaff | null>(null);

  // Debounce Search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearch(searchTerm);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Fetch Data
  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, letterTypeFilter]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const params: { letter_type?: string; search?: string } = {};

      if (letterTypeFilter && letterTypeFilter !== "all") {
        params.letter_type = letterTypeFilter;
      }
      if (search) {
        params.search = search;
      }

      const response = await documentStaffAPI.getAll(params);
      setDocuments(response.documents || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error("Gagal memuat dokumen");
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle Delete
  const executeDelete = async () => {
    if (!docToDelete) return;

    try {
      await documentStaffAPI.delete(docToDelete.id);
      toast.success("Dokumen berhasil dihapus");
      fetchDocuments();
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Gagal menghapus dokumen");
    } finally {
      setDocToDelete(null);
    }
  };

  // Handle Download
  const handleDownload = async (doc: DocumentStaff) => {
    try {
      await documentStaffAPI.download(doc.id);
      toast.success("Membuka file...");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Gagal membuka file");
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const renderTypeBadge = (doc: DocumentStaff) => (
    <Badge
      variant={doc.letter_type === "masuk" ? "default" : "secondary"}
      className="capitalize"
    >
      {doc.letter_type === "masuk" ? "Surat Masuk" : "Surat Keluar"}
    </Badge>
  );

  return (
    <div className="space-y-6">
      {/* Header & Tombol Upload */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Arsip Staff</h1>
          <p className="text-muted-foreground mt-2">
            Kelola dokumen surat staff
          </p>
        </div>

        <Link href="/dashboard/my-document/upload">
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload Dokumen
          </Button>
        </Link>
      </div>

      {/* Card Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter & Pencarian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Cari Dokumen</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Cari pengirim, subjek, atau nama file..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabel Dokumen */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Belum ada dokumen yang diupload</p>
            </div>
          ) : (
            <div>
              {/* TAMPILAN DESKTOP */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pengirim</TableHead>
                      <TableHead>Subjek</TableHead>
                      <TableHead>Nama File</TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">
                          {doc.sender || "-"}
                        </TableCell>
                        <TableCell
                          className="max-w-[200px] truncate"
                          title={doc.subject}
                        >
                          {doc.subject || "-"}
                        </TableCell>
                        <TableCell className="font-mono text-sm max-w-[150px] truncate">
                          {doc.file_name?.split("/").pop() || "-"}
                        </TableCell>
                        <TableCell>{renderTypeBadge(doc)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(doc.created_at)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            {/* TOMBOL MATA (Preview / Detail) */}
                            <Link href={`/dashboard/my-document/${doc.id}`}>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Lihat Detail"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>

                            {/* TOMBOL EDIT */}
                            <Link
                              href={`/dashboard/my-document/${doc.id}/edit`}
                            >
                              <Button variant="ghost" size="icon" title="Edit">
                                <Pencil className="h-4 w-4 text-blue-600" />
                              </Button>
                            </Link>

                            {/* TOMBOL DOWNLOAD */}
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Download"
                              onClick={() => handleDownload(doc)}
                            >
                              <Download className="h-4 w-4 text-green-600" />
                            </Button>

                            {/* TOMBOL HAPUS */}
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Hapus"
                              onClick={() => setDocToDelete(doc)}
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

              {/* TAMPILAN MOBILE */}
              <div className="block md:hidden border-t">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="border-b p-4 grid grid-cols-[1fr_auto] gap-4"
                  >
                    <div className="space-y-2">
                      <span className="font-medium line-clamp-2">
                        {doc.subject}
                      </span>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>
                          <span className="font-medium text-foreground">
                            Pengirim:
                          </span>{" "}
                          {doc.sender}
                        </p>
                        <p className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          {formatDate(doc.created_at)}
                        </p>
                      </div>
                      <div>{renderTypeBadge(doc)}</div>
                    </div>

                    <div className="flex flex-col justify-start">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {/* Detail */}
                          <Link href={`/dashboard/my-document/${doc.id}`}>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Lihat Detail
                            </DropdownMenuItem>
                          </Link>

                          {/* Edit */}
                          <Link href={`/dashboard/my-document/${doc.id}/edit`}>
                            <DropdownMenuItem>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                          </Link>

                          {/* Download */}
                          <DropdownMenuItem onClick={() => handleDownload(doc)}>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>

                          {/* Hapus */}
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDocToDelete(doc)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Konfirmasi Hapus */}
      <AlertDialog
        open={!!docToDelete}
        onOpenChange={(open) => {
          if (!open) setDocToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Anda yakin ingin menghapus?</AlertDialogTitle>
            <AlertDialogDescription>
              Dokumen <span className="font-bold">{docToDelete?.subject}</span>{" "}
              akan dihapus secara permanen dari arsip Anda.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={executeDelete}
            >
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
