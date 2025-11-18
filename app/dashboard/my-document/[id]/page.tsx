"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { documentStaffAPI, getErrorMessage } from "@/lib/api";
import { DocumentStaff } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Loader2, ExternalLink, Download } from "lucide-react";
import { toast } from "sonner";

export default function EditDocumentStaffPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [document, setDocument] = useState<DocumentStaff | null>(null);
  const [formData, setFormData] = useState({
    sender: "",
    subject: "",
    letter_type: "masuk" as "masuk" | "keluar",
  });

  useEffect(() => {
    if (id) {
      fetchDocument();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      const doc = await documentStaffAPI.getById(id);
      console.log("📄 Fetched document:", doc); // Debug log

      setDocument(doc);
      setFormData({
        sender: doc.sender || "",
        subject: doc.subject || "",
        letter_type: (doc.letter_type as "masuk" | "keluar") || "masuk",
      });
    } catch (error) {
      console.error("Error fetching document:", error);
      toast.error(getErrorMessage(error));
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subject.trim() || !formData.sender.trim()) {
      toast.error("Sender dan Subjek wajib diisi");
      return;
    }

    try {
      setSaving(true);
      await documentStaffAPI.update(id, {
        sender: formData.sender.trim(),
        subject: formData.subject.trim(),
        letter_type: formData.letter_type,
      });
      toast.success("Dokumen berhasil diupdate");
      router.push("/dashboard/my-document");
    } catch (error) {
      console.error("Update error:", error);
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: "masuk" | "keluar") => {
    setFormData((prev) => ({ ...prev, letter_type: value }));
  };

  // ✅ Handler untuk buka file
  const handleOpenFile = () => {
    if (!document?.file_name) {
      toast.error("URL file tidak ditemukan");
      return;
    }
    window.open(document.file_name, "_blank");
    toast.success("Membuka file di tab baru");
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p className="text-muted-foreground">Dokumen tidak ditemukan</p>
        <Button onClick={() => router.back()} className="mt-4">
          Kembali
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6"
        disabled={saving}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Kembali
      </Button>

      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6">Edit Dokumen (Staff)</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ✅ FILE INFO WITH DOWNLOAD BUTTON */}
          <div className="space-y-2">
            <Label>File Dokumen</Label>
            <div className="flex items-center gap-2">
              <Input
                value={
                  document.file_name
                    ? document.file_name.split("/").pop() || "File tersedia"
                    : "File tidak ditemukan"
                }
                disabled
                className="bg-muted flex-1"
              />

              {/* ✅ TOMBOL DOWNLOAD/BUKA FILE */}
              {document.file_name && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleOpenFile}
                  title="Buka File"
                >
                  <Download className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* ✅ LINK LANGSUNG KE CLOUDINARY */}
            {document.file_name && (
              <div className="flex items-center gap-2 text-sm">
                <ExternalLink className="h-3 w-3 text-muted-foreground" />
                <a
                  href={document.file_name}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline truncate"
                >
                  {document.file_name}
                </a>
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              File tidak dapat diubah. Jika perlu mengubah file, hapus dokumen
              ini dan upload ulang.
            </p>
          </div>

          {/* SENDER */}
          <div className="space-y-2">
            <Label htmlFor="sender">
              Pengirim <span className="text-destructive">*</span>
            </Label>
            <Input
              id="sender"
              name="sender"
              placeholder="Contoh: Instansi/Perusahaan Pengirim"
              value={formData.sender}
              onChange={handleFormChange}
              disabled={saving}
              required
            />
          </div>

          {/* SUBJECT */}
          <div className="space-y-2">
            <Label htmlFor="subject">
              Subjek Dokumen <span className="text-destructive">*</span>
            </Label>
            <Input
              id="subject"
              name="subject"
              placeholder="Contoh: Undangan Rapat Koordinasi"
              value={formData.subject}
              onChange={handleFormChange}
              disabled={saving}
              required
            />
          </div>

          {/* LETTER TYPE */}
          <div className="space-y-2">
            <Label htmlFor="letter_type">
              Jenis Surat <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.letter_type}
              onValueChange={handleSelectChange}
              disabled={saving}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis surat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="masuk">Surat Masuk</SelectItem>
                <SelectItem value="keluar">Surat Keluar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* UPLOAD INFO */}
          <div className="space-y-2">
            <Label>Informasi Upload</Label>
            <div className="text-sm text-muted-foreground space-y-1 p-3 bg-muted rounded-md">
              <p>
                <span className="font-medium text-foreground">
                  Diupload oleh:
                </span>{" "}
                {document.user?.name || "Unknown"}
              </p>
              <p>
                <span className="font-medium text-foreground">Tanggal:</span>{" "}
                {new Date(document.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              {document.updated_at !== document.created_at && (
                <p>
                  <span className="font-medium text-foreground">
                    Terakhir diupdate:
                  </span>{" "}
                  {new Date(document.updated_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={saving}
              className="flex-1"
            >
              Batal
            </Button>
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Simpan Perubahan
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
