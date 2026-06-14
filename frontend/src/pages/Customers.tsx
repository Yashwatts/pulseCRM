import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { ICustomer } from '../types/customer.types';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { 
  Search, SlidersHorizontal, ArrowUpDown, MoreHorizontal, 
  User, Mail, Phone, Calendar, ShoppingCart, Activity, X
} from 'lucide-react';

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<keyof ICustomer>('totalSpent');
  const [sortDirection, setSortDirection] = useState<'asc'|'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [selectedCustomer, setSelectedCustomer] = useState<ICustomer | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(false);

  const { data: customers = [], isLoading } = useQuery<ICustomer[]>({
    queryKey: ['customers'],
    queryFn: () => api.get('/customers').then(res => res.data),
  });

  // Client-side filtering and sorting
  const filteredAndSorted = useMemo(() => {
    let result = [...customers];

    // Search
    if (searchTerm) {
      const lowerQuery = searchTerm.toLowerCase();
      result = result.filter(c => 
        c.firstName.toLowerCase().includes(lowerQuery) || 
        c.lastName.toLowerCase().includes(lowerQuery) ||
        c.email.toLowerCase().includes(lowerQuery)
      );
    }

    // Filter by Tag
    if (filterTag) {
      result = result.filter(c => c.aiTags?.includes(filterTag));
    }

    // Sort
    result.sort((a, b) => {
      const aVal = a[sortField] || '';
      const bVal = b[sortField] || '';
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [customers, searchTerm, filterTag, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage);
  const paginatedData = filteredAndSorted.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  const toggleSort = (field: keyof ICustomer) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc'); // default to desc for new sorts
    }
  };

  const getTagColor = (tag: string) => {
    if (tag.includes('Churn')) return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
    if (tag.includes('Value') || tag.includes('VIP')) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative flex h-[calc(100vh-8rem)]">
      
      {/* Main Table Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${selectedCustomer ? 'pr-[380px]' : ''}`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Customer Directory</h1>
            <p className="text-muted-foreground mt-1 text-sm">Manage and analyze your entire audience base.</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search customers..." 
                className="pl-9 bg-background"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <Button 
              variant={showFilters ? "secondary" : "outline"} 
              className="shrink-0"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="flex gap-2 mb-6 p-4 bg-muted/30 rounded-md border border-muted items-center animate-in slide-in-from-top-2">
            <span className="text-sm font-medium text-muted-foreground mr-2">Filter by AI Tag:</span>
            {['VIP', 'Churn Risk', 'Coffee Lover'].map(tag => (
              <Badge 
                key={tag} 
                variant={filterTag === tag ? "default" : "outline"}
                className={`cursor-pointer transition-colors ${filterTag === tag ? 'bg-indigo-600 hover:bg-indigo-700 text-white border-transparent' : 'hover:bg-muted'}`}
                onClick={() => {
                  setFilterTag(filterTag === tag ? null : tag);
                  setCurrentPage(1);
                }}
              >
                {tag}
              </Badge>
            ))}
            {filterTag && (
              <Button variant="ghost" size="sm" onClick={() => setFilterTag(null)} className="h-6 px-2 text-xs ml-auto text-muted-foreground hover:text-foreground">
                <X className="w-3 h-3 mr-1" /> Clear
              </Button>
            )}
          </div>
        )}

        <div className="rounded-md border bg-card flex-1 overflow-hidden flex flex-col shadow-sm">
          <div className="overflow-auto flex-1">
            <Table>
              <TableHeader className="bg-muted/50 sticky top-0 z-10 backdrop-blur-sm">
                <TableRow>
                  <TableHead className="w-[250px]">Customer</TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/80 transition-colors" onClick={() => toggleSort('totalSpent')}>
                    <div className="flex items-center">
                      Lifetime Value <ArrowUpDown className="ml-2 h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/80 transition-colors" onClick={() => toggleSort('lastOrderDate')}>
                    <div className="flex items-center">
                      Last Purchase <ArrowUpDown className="ml-2 h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>AI Insights</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><div className="h-10 w-48 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-5 w-24 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-5 w-32 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-6 w-20 bg-muted animate-pulse rounded-full" /></TableCell>
                      <TableCell className="text-right"><div className="h-8 w-8 bg-muted animate-pulse rounded ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center">
                        <User className="h-8 w-8 mb-2 opacity-50" />
                        <p>No customers found.</p>
                        {searchTerm && <Button variant="link" onClick={() => setSearchTerm('')}>Clear search</Button>}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((customer) => (
                    <TableRow 
                      key={customer._id} 
                      className={`cursor-pointer transition-colors hover:bg-muted/50 ${selectedCustomer?._id === customer._id ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''}`}
                      onClick={() => setSelectedCustomer(customer)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-semibold text-sm">
                            {customer.firstName[0]}{customer.lastName[0]}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{customer.firstName} {customer.lastName}</div>
                            <div className="text-xs text-muted-foreground">{customer.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        ${customer.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : 'Never'}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {customer.aiTags?.map(tag => (
                            <span key={tag} className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getTagColor(tag)} border-transparent`}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
            <div className="text-xs text-muted-foreground">
              Showing <span className="font-medium">{filteredAndSorted.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredAndSorted.length)}</span> of <span className="font-medium">{filteredAndSorted.length}</span> results
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1 || isLoading}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages || isLoading}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Profile Drawer (Absolute Right) */}
      <div 
        className={`absolute top-0 right-0 h-full w-[380px] bg-card border-l shadow-2xl transition-transform duration-300 ease-in-out transform flex flex-col z-20 ${selectedCustomer ? 'translate-x-0' : 'translate-x-[110%]'}`}
      >
        {selectedCustomer && (
          <>
            <div className="flex items-center justify-between p-4 border-b bg-muted/10">
              <h2 className="font-semibold">Customer Profile</h2>
              <Button variant="ghost" size="icon" onClick={() => setSelectedCustomer(null)} className="h-8 w-8 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Header Info */}
              <div className="flex flex-col items-center text-center">
                <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-indigo-500/20 mb-4">
                  {selectedCustomer.firstName[0]}{selectedCustomer.lastName[0]}
                </div>
                <h3 className="text-xl font-bold">{selectedCustomer.firstName} {selectedCustomer.lastName}</h3>
                <div className="flex items-center text-muted-foreground mt-1 text-sm">
                  <Mail className="h-3 w-3 mr-1.5" />
                  {selectedCustomer.email}
                </div>
                {selectedCustomer.phone && (
                  <div className="flex items-center text-muted-foreground mt-1 text-sm">
                    <Phone className="h-3 w-3 mr-1.5" />
                    {selectedCustomer.phone}
                  </div>
                )}
              </div>

              {/* Tags */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">AI Segmentation</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCustomer.aiTags?.map(tag => (
                    <Badge key={tag} variant="secondary" className={`${getTagColor(tag)} border-transparent`}>
                      {tag}
                    </Badge>
                  )) || <span className="text-sm text-muted-foreground">No tags identified.</span>}
                </div>
              </div>

              {/* Metrics Grid */}
              <div>
                 <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Value Metrics</h4>
                 <div className="grid grid-cols-2 gap-3">
                   <Card className="bg-muted/30 shadow-none border-dashed">
                     <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                       <Activity className="h-4 w-4 text-emerald-500 mb-2" />
                       <div className="text-lg font-bold">${selectedCustomer.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                       <p className="text-[10px] text-muted-foreground uppercase">Lifetime Value</p>
                     </CardContent>
                   </Card>
                   <Card className="bg-muted/30 shadow-none border-dashed">
                     <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                       <Calendar className="h-4 w-4 text-indigo-500 mb-2" />
                       <div className="text-sm font-bold truncate w-full">
                         {selectedCustomer.lastOrderDate ? new Date(selectedCustomer.lastOrderDate).toLocaleDateString() : 'N/A'}
                       </div>
                       <p className="text-[10px] text-muted-foreground uppercase">Last Purchase</p>
                     </CardContent>
                   </Card>
                 </div>
              </div>

              {/* Mock Purchase History */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center">
                  <ShoppingCart className="h-3 w-3 mr-1" />
                  Recent Activity
                </h4>
                <div className="space-y-4">
                   <div className="flex justify-between items-start p-3 bg-muted/40 rounded-md border border-muted">
                      <div>
                         <p className="text-sm font-semibold text-foreground">Order #1042</p>
                         <p className="text-xs text-muted-foreground mt-0.5">2 days ago</p>
                      </div>
                      <div className="text-right">
                         <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">$124.50</p>
                         <p className="text-xs text-muted-foreground mt-0.5">Completed</p>
                      </div>
                   </div>
                   <div className="flex justify-between items-start p-3 bg-muted/40 rounded-md border border-muted">
                      <div>
                         <p className="text-sm font-semibold text-foreground">Campaign Interaction</p>
                         <p className="text-xs text-muted-foreground mt-0.5">1 week ago</p>
                      </div>
                      <div className="text-right">
                         <p className="text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 px-2 py-1 rounded-md font-medium">Clicked Link</p>
                      </div>
                   </div>
                </div>
              </div>
            </div>
            
            {/* Drawer Footer Actions */}
            <div className="p-4 border-t bg-muted/10 grid grid-cols-2 gap-2">
              <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">Edit Details</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Customer</DialogTitle>
                    <DialogDescription>Update the details for {selectedCustomer.firstName}.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>First Name</Label>
                        <Input defaultValue={selectedCustomer.firstName} />
                      </div>
                      <div className="space-y-2">
                        <Label>Last Name</Label>
                        <Input defaultValue={selectedCustomer.lastName} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input defaultValue={selectedCustomer.email} />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input defaultValue={selectedCustomer.phone} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                    <Button onClick={() => { setIsEditOpen(false); alert('Customer updated successfully!'); }}>Save Changes</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={isMessageOpen} onOpenChange={setIsMessageOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700">Send Message</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Send Message</DialogTitle>
                    <DialogDescription>Send a direct email or SMS to {selectedCustomer.firstName}.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Message content</Label>
                      <textarea 
                        className="w-full min-h-[120px] p-3 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        placeholder="Type your message here..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsMessageOpen(false)}>Cancel</Button>
                    <Button onClick={() => { setIsMessageOpen(false); alert('Message sent successfully!'); }}>Send Message</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </>
        )}
      </div>
      
      {/* Drawer Overlay (Mobile only) */}
      {selectedCustomer && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-10 md:hidden"
          onClick={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  );
}
