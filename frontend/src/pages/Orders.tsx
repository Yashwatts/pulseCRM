import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { IOrder } from '../types/order.types';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, SlidersHorizontal, ArrowUpDown, ShoppingCart, Calendar, CreditCard, Link as LinkIcon
} from 'lucide-react';

export default function Orders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof IOrder>('orderDate');
  const [sortDirection, setSortDirection] = useState<'asc'|'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const { data: orders = [], isLoading } = useQuery<IOrder[]>({
    queryKey: ['orders'],
    queryFn: () => api.get('/orders').then(res => res.data),
  });

  const filteredAndSorted = useMemo(() => {
    let result = [...orders];

    if (searchTerm) {
      const lowerQuery = searchTerm.toLowerCase();
      result = result.filter(o => {
        // Safe check in case customerId is populated or just a string
        const customerName = typeof o.customerId === 'object' 
          ? `${o.customerId.firstName} ${o.customerId.lastName}`.toLowerCase() 
          : o.customerId.toLowerCase();
        
        return o._id.toLowerCase().includes(lowerQuery) || customerName.includes(lowerQuery);
      });
    }

    result.sort((a, b) => {
      const aVal = a[sortField] || '';
      const bVal = b[sortField] || '';
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [orders, searchTerm, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage);
  const paginatedData = filteredAndSorted.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  const toggleSort = (field: keyof IOrder) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'Pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'Cancelled': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative flex flex-col h-[calc(100vh-8rem)]">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-primary" />
            Orders Ledger
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Track and manage all customer purchases across your platform.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by Order ID or Customer..." 
              className="pl-9 bg-background"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <Button variant="outline" className="shrink-0">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filter Status
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-card flex-1 overflow-hidden flex flex-col shadow-sm">
        <div className="overflow-auto flex-1 relative">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 z-10 backdrop-blur-md">
              <TableRow>
                <TableHead className="w-[120px]">Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="cursor-pointer hover:bg-muted/80 transition-colors" onClick={() => toggleSort('orderDate')}>
                  <div className="flex items-center">
                    Date <ArrowUpDown className="ml-2 h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-muted/80 transition-colors" onClick={() => toggleSort('amount')}>
                  <div className="flex items-center">
                    Amount <ArrowUpDown className="ml-2 h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><div className="h-4 w-16 bg-muted animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-5 w-32 bg-muted animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-4 w-24 bg-muted animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-5 w-16 bg-muted animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-6 w-20 bg-muted animate-pulse rounded-full" /></TableCell>
                    <TableCell className="text-right"><div className="h-8 w-16 bg-muted animate-pulse rounded ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center">
                      <CreditCard className="h-8 w-8 mb-3 opacity-50 text-primary" />
                      <p className="text-lg font-medium text-foreground">No orders found</p>
                      <p className="text-sm">We couldn't find any orders matching your criteria.</p>
                      {searchTerm && (
                        <Button variant="link" onClick={() => setSearchTerm('')} className="mt-2">
                          Clear search filters
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((order) => (
                  <TableRow key={order._id} className="transition-colors hover:bg-muted/50 group">
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {order._id.substring(order._id.length - 8).toUpperCase()}
                    </TableCell>
                    <TableCell>
                      {typeof order.customerId === 'object' ? (
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{order.customerId.firstName} {order.customerId.lastName}</span>
                          <span className="text-xs text-muted-foreground hidden sm:inline-block">({order.customerId.email})</span>
                        </div>
                      ) : (
                        <span className="font-medium text-sm text-muted-foreground">ID: {order.customerId}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1.5 opacity-70" />
                        {new Date(order.orderDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">
                      ${order.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`${getStatusColor(order.status)} border-transparent font-medium shadow-sm`}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50" asChild>
                          <Link to={`/customers`}>
                            <LinkIcon className="h-4 w-4 mr-1.5" />
                            View Customer
                          </Link>
                       </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/30 shrink-0">
          <div className="text-xs text-muted-foreground">
            Showing <span className="font-medium text-foreground">{filteredAndSorted.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-foreground">{Math.min(currentPage * itemsPerPage, filteredAndSorted.length)}</span> of <span className="font-medium text-foreground">{filteredAndSorted.length}</span> orders
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1 || isLoading}
              className="shadow-sm"
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || isLoading}
              className="shadow-sm"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
