export interface IOrder {
  _id: string;
  customerId: string | { _id: string, firstName: string, lastName: string, email: string };
  amount: number;
  status: 'Completed' | 'Pending' | 'Cancelled';
  orderDate: string;
}
