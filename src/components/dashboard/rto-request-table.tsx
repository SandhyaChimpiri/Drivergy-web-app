
'use client';

import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { RtoAssistanceRequest } from '@/types';
import { RtoAssistanceStatusOptions } from '@/types';
import { User, CalendarDays, AlertCircle, Settings2, FileText, Link as LinkIcon, ChevronDown, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { updateRtoAssistanceStatus } from '@/lib/server-actions';
import { format, parseISO } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

interface RtoRequestTableProps {
  title: ReactNode;
  requests: RtoAssistanceRequest[];
  isLoading: boolean;
  onActioned: () => void;
}

const ITEMS_PER_PAGE = 5;

const InfoItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value?: string | null }) => {
    if (!value) return null;
    return (
        <div className="flex items-start text-sm">
            <Icon className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
            <div className="flex flex-col">
                <span className="font-semibold text-foreground">{label}:</span>
                <span className="text-muted-foreground">{value}</span>
            </div>
        </div>
    );
};

export default function RtoRequestTable({ title, requests, isLoading, onActioned }: RtoRequestTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RtoAssistanceRequest | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setCurrentPage(1);
  }, [requests]);

  const totalPages = Math.ceil(requests.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedRequests = requests.slice(startIndex, endIndex);

  const handlePreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  const handleUpdateStatus = async (requestId: string, newStatus: RtoAssistanceRequest['status']) => {
    const success = await updateRtoAssistanceStatus(requestId, newStatus);
    if (success) {
        toast({ title: "Status Updated", description: `Request status set to ${newStatus}.` });
        onActioned();
    } else {
        toast({ title: "Update Failed", description: "Could not update request status.", variant: "destructive" });
    }
  };
  
  const handleViewDetails = (request: RtoAssistanceRequest) => {
    setSelectedRequest(request);
    setIsDetailsOpen(true);
  };

  const getStatusColor = (status: RtoAssistanceRequest['status']) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-700/30 dark:text-yellow-300';
      case 'In Progress': return 'bg-blue-100 text-blue-700 dark:bg-blue-700/30 dark:text-blue-300';
      case 'Completed': return 'bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-300';
      case 'Rejected': return 'bg-red-100 text-red-700 dark:bg-red-700/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700/30 dark:text-gray-300';
    }
  };

  const renderSkeletons = () => (
    Array(ITEMS_PER_PAGE).fill(0).map((_, index) => (
      <TableRow key={`skeleton-${index}`}>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell><Skeleton className="h-9 w-36" /></TableCell>
      </TableRow>
    ))
  );

  return (
    <>
    <Card className="shadow-lg border border-primary transition-shadow duration-300 flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline text-2xl font-semibold flex items-center">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><User className="inline-block mr-2 h-4 w-4" />Applicant Name</TableHead>
                <TableHead><FileText className="inline-block mr-2 h-4 w-4" />Service Type</TableHead>
                <TableHead><CalendarDays className="inline-block mr-2 h-4 w-4" />Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center"><Settings2 className="inline-block mr-2 h-4 w-4" />Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? renderSkeletons() : paginatedRequests.length > 0 ? (
                paginatedRequests.map((req) => (
                  <TableRow key={req.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">{req.fullName}</TableCell>
                    <TableCell>{req.serviceType}</TableCell>
                    <TableCell>{format(parseISO(req.createdAt), 'PP')}</TableCell>
                    <TableCell>
                      <Badge className={cn(getStatusColor(req.status))}>
                        {req.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleViewDetails(req)}>View Details</Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="w-[120px]">
                                        Update Status <ChevronDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {RtoAssistanceStatusOptions.map(status => (
                                        <DropdownMenuItem key={status} onClick={() => handleUpdateStatus(req.id, status)}>
                                            {status}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <AlertCircle className="w-12 h-12 mb-2 opacity-50" />
                      <p className="text-lg">No RTO assistance requests found.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      {requests.length > 0 && !isLoading && (
        <CardFooter className="flex items-center justify-between pt-4 border-t">
          <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages} ({requests.length} item{requests.length === 1 ? '' : 's'})</span>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={currentPage === 1}>Previous</Button>
            <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages}>Next</Button>
          </div>
        </CardFooter>
      )}
    </Card>

    <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle>Request Details: {selectedRequest?.fullName}</DialogTitle>
                <DialogDescription>
                    Review the information submitted for the {selectedRequest?.serviceType} service.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
                <InfoItem icon={User} label="Full Name" value={selectedRequest?.fullName} />
                <InfoItem icon={Mail} label="Email" value={selectedRequest?.email} />
                <InfoItem icon={Phone} label="Contact Number" value={selectedRequest?.contactNumber} />
                <InfoItem icon={MapPin} label="State" value={selectedRequest?.state} />
                <InfoItem icon={MapPin} label="District" value={selectedRequest?.district} />
                <InfoItem icon={MapPin} label="Pincode" value={selectedRequest?.pincode} />
                <InfoItem icon={MapPin} label="RTO Office" value={selectedRequest?.rtoOfficeName} />

                {selectedRequest?.serviceType === 'New License' && (
                    <>
                        <InfoItem icon={User} label="Father's Name" value={selectedRequest?.fathersName} />
                        <InfoItem icon={MapPin} label="Full Address" value={selectedRequest?.address} />
                    </>
                )}
                 {selectedRequest?.serviceType === 'Renew License' && (
                    <InfoItem icon={FileText} label="Old DL Number" value={selectedRequest?.oldDlNumber} />
                )}
                
                <h4 className="font-semibold mt-4 border-t pt-4">Uploaded Documents</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedRequest?.aadharFileUrl && <Button asChild variant="outline"><a href={selectedRequest.aadharFileUrl} target="_blank" rel="noopener noreferrer"><LinkIcon className="mr-2 h-4 w-4"/> View Aadhaar</a></Button>}
                    {selectedRequest?.passportPhotoUrl && <Button asChild variant="outline"><a href={selectedRequest.passportPhotoUrl} target="_blank" rel="noopener noreferrer"><LinkIcon className="mr-2 h-4 w-4"/> View Photo</a></Button>}
                    {selectedRequest?.signaturePhotoUrl && <Button asChild variant="outline"><a href={selectedRequest.signaturePhotoUrl} target="_blank" rel="noopener noreferrer"><LinkIcon className="mr-2 h-4 w-4"/> View Signature</a></Button>}
                    {selectedRequest?.oldDlFileUrl && <Button asChild variant="outline"><a href={selectedRequest.oldDlFileUrl} target="_blank" rel="noopener noreferrer"><LinkIcon className="mr-2 h-4 w-4"/> View Old DL</a></Button>}
                </div>
            </div>
        </DialogContent>
    </Dialog>
    </>
  );
}
