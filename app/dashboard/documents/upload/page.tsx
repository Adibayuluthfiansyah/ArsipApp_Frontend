"use client";

import { useState } from "react";
import { documentAPI } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Upload, FileText, AlertCircle } from "lucide-react";

interface ApiCreateDocumentResponse {
  message: string;
  file_id: string;
  file_name: string;
  document: {
    id: string;
    sender: string;
    subject: string;
    letter_type: string;
    file_name: string;
  };
}

export default function UploadDocumentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    sender: "",
    subject: "",
    letter_type: "masuk" as "masuk" | "keluar",
    user_id: user?.id || "",
  });
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("Pilih file terlebih dahulu");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Ukuran file maksimal 10MB");
      return;
    }

    setLoading(true);

    try {
      // Backend FormData Handle
      const data = new FormData();
      data.append("sender", formData.sender);
      data.append("subject", formData.subject);
      data.append("letter_type", formData.letter_type);
      data.append("user_id", formData.user_id);
      data.append("file", file);

      const response = (await documentAPI.create(
        data
      )) as ApiCreateDocumentResponse;
      // Response: { message, file_id, file_name, document }
      alert(response.message || "Dokumen berhasil diupload ke Google Drive");
      router.push("/dashboard/documents");
    } catch (err: unknown) {
      console.error("Error uploading document:", err);
      setError(err instanceof Error ? err.message : "Gagal mengupload dokumen");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("Ukuran file maksimal 10MB");
        return;
      }
      setFile(selectedFile);
      setError("");
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Upload Dokumen Surat
          </h1>
          <p className="text-muted-foreground mt-2">
            Upload dokumen ke Google Drive
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Dokumen</CardTitle>
          <CardDescription>
            Isi form di bawah ini untuk mengupload dokumen baru
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="sender">Pengirim Surat *</Label>
              <Input
                id="sender"
                required
                placeholder="Nama pengirim surat"
                value={formData.sender}
                onChange={(e) =>
                  setFormData({ ...formData, sender: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subjek Surat *</Label>
              <Input
                id="subject"
                required
                placeholder="Subjek/perihal surat"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="letter_type">Tipe Surat *</Label>
              <Select
                value={formData.letter_type}
                onValueChange={(value: "masuk" | "keluar") =>
                  setFormData({ ...formData, letter_type: value })
                }
              >
                <SelectTrigger id="letter_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="masuk">Surat Masuk</SelectItem>
                  <SelectItem value="keluar">Surat Keluar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">File Dokumen * (Max 10MB)</Label>
              <div className="relative">
                <Input
                  id="file"
                  type="file"
                  required
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                  className="cursor-pointer"
                />
              </div>
              {file && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg mt-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                File akan diupload ke Google Drive
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Batal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <div className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Mengupload...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload ke Google Drive
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
