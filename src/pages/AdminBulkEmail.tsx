
import React from 'react';
import EnhancedBulkEmailSystem from '@/components/admin/EnhancedBulkEmailSystem';
import ProtectedRoute from '@/components/ProtectedRoute';

const AdminBulkEmail = () => {
  return (
    <ProtectedRoute requireAuth={true} requireAdmin={true}>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Bulk Email System</h1>
                <p className="text-gray-600 mt-2">Send real email notifications to platform users</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <EnhancedBulkEmailSystem />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AdminBulkEmail;
