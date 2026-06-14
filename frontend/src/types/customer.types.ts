export interface ICustomer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  totalSpent: number;
  lastOrderDate?: string;
  aiTags: string[];
}
