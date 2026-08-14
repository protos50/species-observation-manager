export type user = {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  created_at: Date;
  deleted_at?: Date;
  role_id: number;
  role?: {
    role_id: number;
    name: string;
    description?: string;
  };
};
