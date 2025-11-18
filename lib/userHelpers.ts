import { User } from "@/types";

export const getUserId = (user: User): string | undefined => {
  return user.ID ?? user.id;
};


export const formatUserDate = (user: User): string => {
  const dateStr = user.created_at || user.CreatedAt;
  if (!dateStr) return "-";
  
  return new Date(dateStr).toLocaleDateString("id-ID");
};