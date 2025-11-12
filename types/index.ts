export interface User {
id: string; 
name: string;
username: string; 
role: 'admin' | 'staff'; 
created_at: string;
updated_at: string;
}

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

export interface Document {
id: string; 
title: string; 
description?: string;
file_name: string;
file_path: string;
file_type: string;
file_size: number;
document_number: string;
document_date: string;
category_id: number; 
uploaded_by: string; 
status: 'active' | 'archived' | 'deleted';
metadata?: unknown;
category?: Category;
uploader?: User;
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