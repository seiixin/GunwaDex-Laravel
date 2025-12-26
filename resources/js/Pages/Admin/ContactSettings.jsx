import AdminLayout from '@/Layouts/AdminLayout';
import ContactsDetails from '@/Components/Admin/ContactUs/ContactsDetails';

export default function AdminContactSettings() {
  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-10">
        {/* =====================
              CONTACT SETTINGS
           ===================== */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-white-800">📨 Contact Us Settings</h1>
          </div>
          <ContactsDetails />
        </div>
      </div>
    </AdminLayout>
  );
}
