// pages/admin/AdminTools.js
import withAdminAuth from '@/lib/withAdminAuth';
import AdminLayout from '@/components/AdminLayout';

function AdminTools() {
  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <p className="mb-4 text-sm bg-orange-200 text-black p-4 rounded shadow-md">
        Use the tools in the sidebar to manage different parts of the site. Only users with admin privileges can access these tools.
      </p>
    </AdminLayout>
  );
}

export default withAdminAuth(AdminTools);
