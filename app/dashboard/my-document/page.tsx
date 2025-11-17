"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { documentStaffAPI } from "@/lib/api";
import { DocumentStaff } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, FileText, Download, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MyDocumentsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentStaff[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await documentStaffAPI.getAll();
      setDocuments(response.documents || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = () => {
    router.push("/dashboard/my-documents/upload");
  };

  const handleDownload = async (id: string, fileName: string) => {
    try {
      const response = await documentStaffAPI.download(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus dokumen ini?")) return;

    try {
      await documentStaffAPI.delete(id);
      fetchDocuments();
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dokumen Saya</h1>
          <p className="text-muted-foreground">
            Kelola dokumen yang Anda upload
          </p>
        </div>
        <Button onClick={handleUpload}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Dokumen
        </Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : documents.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Belum ada dokumen</h3>
          <p className="text-muted-foreground mb-4">
            Upload dokumen pertama Anda
          </p>
          <Button onClick={handleUpload}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Dokumen
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <Card key={doc.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <FileText className="h-10 w-10 text-primary" />
                  <div>
                    <h3 className="font-semibold">{doc.file_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {doc.subject}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(doc.created_at).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDownload(doc.id, doc.file_name)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(doc.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
