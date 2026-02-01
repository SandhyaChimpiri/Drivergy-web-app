'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";
import { RtoAssistanceFormSchema, type RtoAssistanceFormValues, RtoServiceTypeOptions } from '@/types';
import { submitRtoAssistanceAction } from '@/lib/server-actions';
import { Loader2, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Textarea } from '../ui/textarea';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Pay ₹299 & Submit
        </Button>
    );
}

export function RtoAssistanceForm({ children, onOpenChange, open }: { children: React.ReactNode, open: boolean, onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();
  const [state, formAction] = useFormState(submitRtoAssistanceAction, { success: false, error: undefined });
  
  const form = useForm<RtoAssistanceFormValues>({
    resolver: zodResolver(RtoAssistanceFormSchema),
    defaultValues: {
      serviceType: undefined,
      fullName: '',
      fathersName: '',
      address: '',
      aadharNumber: '',
      oldDlNumber: '',
    },
    mode: 'onChange',
  });

  const { watch } = form;
  const serviceType = watch('serviceType');

  useEffect(() => {
    if (state.success) {
      toast({
        title: "Application Submitted!",
        description: "Our team will review your details and contact you shortly.",
      });
      form.reset();
      onOpenChange(false);
    } else if (state.error) {
      toast({
        title: "Submission Failed",
        description: state.error,
        variant: "destructive",
      });
    }
  }, [state, toast, form, onOpenChange]);

  const onClientSubmit = (data: RtoAssistanceFormValues) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (value) {
        formData.append(key, String(value));
      }
    });
    formAction(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><FileText />Drivergy RTO Assistance</DialogTitle>
          <DialogDescription>Fill out the form below to apply for license assistance. The official fee is ₹299.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onClientSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
            <FormField control={form.control} name="serviceType" render={({ field }) => ( <FormItem><FormLabel>Service Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select the service you need" /></SelectTrigger></FormControl><SelectContent>{RtoServiceTypeOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
            {serviceType && (
              <>
                <FormField control={form.control} name="fullName" render={({ field }) => ( <FormItem><FormLabel>Full Name (as per Aadhaar)</FormLabel><FormControl><Input placeholder="Enter your full name" {...field} /></FormControl><FormMessage /></FormItem> )} />
                {serviceType === 'New License' && (
                  <>
                    <FormField control={form.control} name="fathersName" render={({ field }) => (<FormItem><FormLabel>Father's Name</FormLabel><FormControl><Input placeholder="Enter father's name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel>Full Address</FormLabel><FormControl><Textarea placeholder="Enter your full address as per Aadhaar" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="aadharNumber" render={({ field }) => (<FormItem><FormLabel>Aadhaar Number</FormLabel><FormControl><Input type="text" maxLength={12} placeholder="Enter 12-digit Aadhaar number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="passportPhoto" render={({ field: { onChange } }) => (<FormItem><FormLabel>Passport Size Photo</FormLabel><FormControl><Input type="file" accept="image/jpeg, image/png" onChange={e => onChange(e.target.files?.[0])} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="signaturePhoto" render={({ field: { onChange } }) => (<FormItem><FormLabel>Signature Photo</FormLabel><FormControl><Input type="file" accept="image/jpeg, image/png" onChange={e => onChange(e.target.files?.[0])} /></FormControl><FormMessage /></FormItem>)} />
                  </>
                )}
                {serviceType === 'Renew License' && (
                  <>
                    <FormField control={form.control} name="oldDlNumber" render={({ field }) => (<FormItem><FormLabel>Old Driving License Number</FormLabel><FormControl><Input placeholder="Enter your existing DL number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="aadharFile" render={({ field: { onChange } }) => (<FormItem><FormLabel>Upload Aadhaar Card</FormLabel><FormControl><Input type="file" accept=".pdf, image/jpeg, image/png" onChange={e => onChange(e.target.files?.[0])} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="oldDlFile" render={({ field: { onChange } }) => (<FormItem><FormLabel>Upload Old DL Copy</FormLabel><FormControl><Input type="file" accept=".pdf, image/jpeg, image/png" onChange={e => onChange(e.target.files?.[0])} /></FormControl><FormMessage /></FormItem>)} />
                  </>
                )}
                <DialogFooter className="pt-4">
                  <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                  <SubmitButton />
                </DialogFooter>
              </>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
