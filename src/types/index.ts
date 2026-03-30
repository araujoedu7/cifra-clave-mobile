export type UserRole = "owner" | "admin" | "viewer";

export type AppUser = {
  uid: string;
  nome: string;
  email: string;
  role: UserRole;
  createdAt?: string;
};

export type Pasta = {
  id: string;
  nome: string;
  criadaPor: string;
  createdAt?: string;
};

export type Musica = {
  id: string;
  titulo: string;
  artista?: string;
  tom?: string;
  cifra: string;
  pastaId?: string | null;
  criadaPor: string;
  createdAt?: string;
  updatedAt?: string;
};