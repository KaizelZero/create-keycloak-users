export type Organization = {
  name: string;
  url: string;
};

export type User = {
  created_at: string;
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
};

export const ROLES = ['Administrator', 'Data Administrator', 'Data Editor', 'Data Viewer'] as const;
