export type User = {
  ID: number; 
  name: string;
  email: string;
  role: string;
};

export type Document = {
  id: number;
  title: string;
  description: string;
  category: string;
  fileURL: string;
  uploaderID: number;
  createdAt: string;
  updatedAt: string;
};

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent_id?: number;
  parent?: Category;
  children?: Category[];
  created_at: string;
  updated_at: string;
}


export interface ActivityLog {
  id: number;
  user_id: string;
  document_id?: string;
  action: string;
  description?: string;
  ip_address?: string;
  user_agent?: string;
  user?: User;
  document?: Document;
  created_at: string;
}

export interface PaginatedResponse<T> {
  status?: 'success' | 'error';
  message?: string;
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number;
  to?: number;
}

export interface DocumentsResponse {
  documents: Document[];
}

export interface DocumentResponse {
  document: Document;
}

export interface MessageResponse {
  message: string;
}

export interface CreateDocumentResponse {
  message: string;
  file_id: string;
  file_name: string;
  document: Document;
}

// API Response types - sesuai dengan backend response
export interface ApiDocumentsResponse {
  documents: Document[];
}

export interface ApiCreateDocumentResponse {
  message: string;
  file_id: string;
  file_name: string;
  document: Document;
}