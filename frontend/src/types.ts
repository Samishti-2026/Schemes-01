export interface Recipient {
  id: number;
  name: string;
  currentTO: number;
  avgDaily: number;
  category?: string;
  type?: string;
  region?: string; // North, South, East, West
  paymentStatus?: string; // Pending, Completed, Failed
  products?: string[]; // List of products they deal in
  // Computed fields
  projectedTO?: number;
  totalTO?: number;
  isQualifying?: boolean;
}
