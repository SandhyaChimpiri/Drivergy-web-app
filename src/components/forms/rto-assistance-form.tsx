
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";
import { RtoAssistanceFormSchema, type RtoAssistanceFormValues, RtoServiceTypeOptions, RtoAllowedStates, RtoDistrictsByState } from '@/types';
import { submitRtoAssistanceAction } from '@/lib/server-actions';
import { Loader2 } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { Textarea } from '../ui/textarea';
import { useRouter } from 'next/navigation';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
          {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Pay ₹299 & Submit
        </Button>
    );
}

export function RtoAssistanceForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [state, formAction] = useFormState(submitRtoAssistanceAction, { success: false, error: undefined });
  
  const form = useForm<RtoAssistanceFormValues>({
    resolver: zodResolver(RtoAssistanceFormSchema),
    defaultValues: {
      serviceType: undefined,
      fullName: '',
      contactNumber: '',
      state: undefined,
      district: '',
      pincode: '',
      rtoOfficeName: '',
      fathersName: '',
      address: '',
      oldDlNumber: '',
    },
    mode: 'onChange',
  });

  const { watch, setValue } = form;
  const serviceType = watch('serviceType');
  const selectedState = watch('state');

  const availableDistricts = useMemo(() => {
    if (selectedState && RtoDistrictsByState[selectedState as keyof typeof RtoDistrictsByState]) {
      return RtoDistrictsByState[selectedState as keyof typeof RtoDistrictsByState];
    }
    return [];
  }, [selectedState]);

  useEffect(() => {
    const currentDistrict = form.getValues('district');
    if (selectedState && currentDistrict && !availableDistricts.includes(currentDistrict as any)) {
      setValue('district', '');
    }
  }, [selectedState, form, setValue, availableDistricts]);

  useEffect(() => {
    if (state.success) {
      toast({
        title: "Application Details Saved",
        description: "Redirecting you to the payment page to complete your request.",
      });
      router.push('/payment?plan=RTO%20Assistance&price=299');
    } else if (state.error) {
      toast({
        title: "Submission Failed",
        description: state.error,
        variant: "destructive",
      });
    }
  }, [state, toast, router]);

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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onClientSubmit)} className="space-y-6">
        <FormField control={form.control} name="serviceType" render={({ field }) => ( <FormItem><FormLabel>Service Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select the service you need" /></SelectTrigger></FormControl><SelectContent>{RtoServiceTypeOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
        {serviceType && (
          <>
            <FormField control={form.control} name="fullName" render={({ field }) => ( <FormItem><FormLabel>Full Name (as per Aadhaar)</FormLabel><FormControl><Input placeholder="Enter your full name" {...field} /></FormControl><FormMessage /></FormItem> )} />
             <FormField control={form.control} name="contactNumber" render={({ field }) => (
                <FormItem>
                    <FormLabel>Contact Number</FormLabel>
                    <div className="flex items-center">
                        <span className="inline-flex h-10 items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">+91</span>
                        <FormControl>
                            <Input type="tel" placeholder="Enter 10-digit number" {...field} />
                        </FormControl>
                    </div>
                    <FormMessage />
                </FormItem>
            )} />

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>State</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger></FormControl>
                            <SelectContent>{RtoAllowedStates.map(state => (<SelectItem key={state} value={state}>{state}</SelectItem>))}</SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="district"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>District</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={!selectedState || availableDistricts.length === 0}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger></FormControl>
                            <SelectContent>
                               {availableDistricts.length > 0 ? (
                                    availableDistricts.map(district => (<SelectItem key={district} value={district}>{district}</SelectItem>))
                                ) : (<SelectItem value="disabled" disabled>Select a state first</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField control={form.control} name="pincode" render={({ field }) => ( <FormItem><FormLabel>Pincode</FormLabel><FormControl><Input type="text" maxLength={6} placeholder="Enter 6-digit pincode" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="rtoOfficeName" render={({ field }) => ( <FormItem><FormLabel>Near By RTO Office</FormLabel><FormControl><Input placeholder="e.g., Prayagraj RTO Office" {...field} /></FormControl><FormMessage /></FormItem> )} />
            </div>

            {serviceType === 'New License' && (
              <>
                <FormField control={form.control} name="fathersName" render={({ field }) => (<FormItem><FormLabel>Father's Name</FormLabel><FormControl><Input placeholder="Enter father's name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel>Full Address</FormLabel><FormControl><Textarea placeholder="Enter your full address as per Aadhaar" {...field} /></FormControl><FormMessage /></FormItem>)} />
                 <FormField control={form.control} name="aadharFile" render={({ field: { onChange } }) => (<FormItem><FormLabel>Upload Aadhaar Card</FormLabel><FormControl><Input type="file" accept=".pdf, image/jpeg, image/png" onChange={e => onChange(e.target.files?.[0])} /></FormControl><FormMessage /></FormItem>)} />
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
            <div className="flex justify-end pt-4 border-t">
              <SubmitButton />
            </div>
          </>
        )}
      </form>
    </Form>
  );
}
