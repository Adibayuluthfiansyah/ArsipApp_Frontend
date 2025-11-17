import { User } from "@/types";

// Helper function untuk get user ID dari berbagai format
export const getUserId = (user: User): number | undefined => {
  return user.ID ? parseInt(user.ID) : user.id ? parseInt(user.id) : undefined;
};

// Helper untuk format tanggal
export const formatUserDate = (user: User): string => {
  const dateStr = user.created_at || user.CreatedAt;
  if (!dateStr) return "-";
  
  return new Date(dateStr).toLocaleDateString("id-ID");
};