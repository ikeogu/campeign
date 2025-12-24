import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import PromoterDashboard from './Dashboard/PromoterDashboard';
import CampaignerDashboard from './Dashboard/CampaignerDashboard';

export default function Dashboard() {
    const { user } = usePage().props;
    const userRole = user.role;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                <div className="max-w-7xl mx-auto space-y-6">

                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                            <p className="text-gray-600 mt-1">
                                Welcome back! Here's your performance overview
                            </p>
                        </div>
                    </div>

                    {/* Role-based Rendering */}
                    {userRole === 'promoter' && <PromoterDashboard />}
                    {userRole === 'campaigner' && <CampaignerDashboard />}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
