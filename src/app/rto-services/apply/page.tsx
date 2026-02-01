
import { RtoAssistanceForm } from '@/components/forms/rto-assistance-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Apply for RTO Assistance | Drivergy',
    description: 'Apply for expert assistance with your new or renewed driving license. Let Drivergy handle the paperwork for you.',
};

export default function RtoAssistanceApplyPage() {
    return (
        <div className="container mx-auto max-w-2xl p-4 py-8 sm:p-6 lg:p-8">
            <Card className="shadow-xl">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-3 flex items-center justify-center rounded-full bg-primary/10 p-3 w-fit">
                        <FileText className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="font-headline text-3xl font-bold">RTO Assistance Application</CardTitle>
                    <CardDescription>
                        Fill out the form below to apply for license assistance. The official fee is ₹299.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <RtoAssistanceForm />
                </CardContent>
            </Card>
        </div>
    );
}
