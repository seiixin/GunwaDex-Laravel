import AdminLayout from "@/Layouts/AdminLayout";
import { ChatProvider } from "@/Components/Admin/ChatSupport/ChatContext";
import Inbox from "@/Components/Admin/ChatSupport/Inbox";
import Conversation from "@/Components/Admin/ChatSupport/Conversation";

export default function ChatSupport() {
  return (
    <AdminLayout active="chat" title="Chat Support">
      <ChatProvider>
        {/* Use available height, not h-screen; avoid clipping floating elements */}
        <div className="min-h-[calc(100vh-110px)] p-3 sm:p-4">
          <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
            {/* Inbox: hidden on mobile inside Inbox.jsx sheet, visible on desktop */}
            <Inbox />

            {/* Conversation: always visible */}
            <div className="flex-1 min-w-0">
              <Conversation />
            </div>
          </div>
        </div>
      </ChatProvider>
    </AdminLayout>
  );
}
