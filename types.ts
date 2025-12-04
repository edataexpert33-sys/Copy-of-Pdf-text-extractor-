export enum AppState {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface Transaction {
  date: string;
  paymentType?: string; // e.g., CR, BP, DD
  details: string;      // e.g., DEPOSIT PROTECTION
  paidOut?: number;
  paidIn?: number;
  balance?: number;
}

export interface UploadedFile {
  file: File;
  previewUrl?: string;
  base64?: string;
}