export type LoginResponse = {
  access_token: string;
  refresh_token?: string;
  token_type: 'bearer';
};
