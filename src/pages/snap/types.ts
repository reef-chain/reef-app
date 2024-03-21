export type GetSnapsResponse = Record<string, Snap>;

export type Snap = {
  permissionName: string;
  id: string;
  version: string;
  initialPermissions: Record<string, unknown>;
};

export interface SendRequest {
  (message: string, request: any): Promise<any>;
  (
    message: string,
    request: any,
    subscriber: (data: any) => void,
  ): Promise<any>;
}

export interface Network {
  name: string;
  rpcUrl: string;
}

export interface Account {
  address: string;
  name: string;
  isSelected: boolean;
}
