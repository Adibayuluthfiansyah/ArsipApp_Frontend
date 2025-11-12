export interface User {
id: number;
name: string;
email: string;
role: 'admin' | 'staff';
is_active: boolean;
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
id: number;
title: string;
description?: string;
file_name: string;
file_path: string;
file_type: string;
file_size: number;
document_number: string;
document_date: string;
category_id: number;
uploaded_by: number;
status: 'active' | 'archived' | 'deleted';
metadata?: unknown;
category?: Category;
uploader?: User;
created_at: string;
updated_at: string;
}

export interface ActivityLog {
id: number;
user_id: number;
document_id?: number;
action: string;
description?: string;
ip_address?: string;
user_agent?: string;
user?: User;
document?: Document;
created_at: string;
}

export interface PaginatedResponse<T> {
data: T[];
current_page: number;
last_page: number;
per_page: number;
total: number;
from: number;
to: number;
}