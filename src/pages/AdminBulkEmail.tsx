
import React, { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import BackButton from '@/components/BackButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EnhancedBulkEmailSystem from '@/components/admin/EnhancedBulkEmailSystem';
import GmailBulkEmailSystem from '@/components/admin/GmailBulkEmailSystem';
import { Mail, Settings } from 'lucide-react';

const AdminBulkEmail = () => {
  return (
    <ProtectedRoute requireAuth={true} requireAdmin={true}>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center gap-4">
              <BackButton to="/admin" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Email Campaigns</h1>
                <p className="text-gray-600 mt-2">Send bulk email campaigns to platform users</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs defaultValue="gmail" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="gmail" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Gmail SMTP
              </TabsTrigger>
              <TabsTrigger value="resend" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Resend Service
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="gmail">
              <GmailBulkEmailSystem />
            </TabsContent>
            
            <TabsContent value="resend">
              <EnhancedBulkEmailSystem />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AdminBulkEmail;
