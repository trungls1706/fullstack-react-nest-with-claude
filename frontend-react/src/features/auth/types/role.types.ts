export interface Role {
  id: number;
  name: string;
}

export interface CreateRolePayload {
  name: string;
}

export interface UpdateRolePayload {
  name: string;
}
