import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  Calendar, 
  DollarSign, 
  FileText, 
  Settings,
  LogOut,
  User,
  Menu,
  Mail,
  KeyRound
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emails, setEmails] = useState<any[]>([]);

  const handleSignOut = () => {
    signOut();
    navigate('/signin');
  };

  const handleViewEmails = () => {
    // Get all mock emails from localStorage
    const allEmails: any[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('mock_email_')) {
        const emailData = localStorage.getItem(key);
        if (emailData) {
          try {
            const parsed = JSON.parse(emailData);
            allEmails.push({
              ...parsed,
              _key: key,
            });
          } catch (e) {
            // Skip invalid entries
          }
        }
      }
    }
    // Sort by timestamp (newest first)
    allEmails.sort((a, b) => {
      const timeA = a.timestamp || a._key.replace('mock_email_', '');
      const timeB = b.timestamp || b._key.replace('mock_email_', '');
      return timeB.localeCompare(timeA);
    });
    setEmails(allEmails);
    setEmailDialogOpen(true);
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['admin', 'hr', 'payroll', 'employee'] },
    { icon: Users, label: 'Employees', path: '/employees', roles: ['admin', 'hr'] },
    { icon: Clock, label: 'Attendance', path: '/attendance', roles: ['admin', 'hr', 'employee'] },
    { icon: Calendar, label: 'Time Off', path: '/timeoff', roles: ['admin', 'hr', 'payroll', 'employee'] },
    { icon: DollarSign, label: 'Payroll', path: '/payroll', roles: ['admin', 'payroll'] },
    { icon: FileText, label: 'Reports', path: '/reports', roles: ['admin', 'hr', 'payroll'] },
    { icon: Settings, label: 'Settings', path: '/settings', roles: ['admin'] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  const initials = user 
    ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    : 'U';

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          'bg-primary text-primary-foreground transition-all duration-300 flex flex-col',
          sidebarOpen ? 'w-64' : 'w-20'
        )}
      >
        <div className="p-4 border-b border-primary-dark">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <h1 className="text-xl font-bold">WorkZen</h1>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-primary-foreground hover:bg-primary-dark"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Button
                key={item.path}
                variant="ghost"
                className={cn(
                  'w-full justify-start text-primary-foreground hover:bg-primary-dark',
                  isActive && 'bg-primary-dark',
                  !sidebarOpen && 'justify-center'
                )}
                onClick={() => navigate(item.path)}
              >
                <Icon className="w-5 h-5" />
                {sidebarOpen && <span className="ml-3">{item.label}</span>}
              </Button>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {menuItems.find(item => item.path === location.pathname)?.label || 'WorkZen HRMS'}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Mock Email Inbox */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewEmails}
              className="gap-2"
            >
              <Mail className="h-4 w-4" />
              Mock Emails
            </Button>
            
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.first_name} {user?.last_name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="mr-2 h-4 w-4" />
                My Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/change-password', { state: { from: 'profile' } })}>
                <KeyRound className="mr-2 h-4 w-4" />
                Change Password
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>

      {/* Email Viewer Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Mock Email Inbox ({emails.length})
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {emails.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No emails yet</p>
                <p className="text-sm text-muted-foreground mt-2">Emails will appear here when you:</p>
                <ul className="text-sm text-muted-foreground mt-1">
                  <li>• Add a new employee</li>
                  <li>• Sign up a new account</li>
                  <li>• Approve/reject leave requests</li>
                </ul>
              </div>
            ) : (
              emails.map((email, index) => {
                const timestamp = email.timestamp ? new Date(email.timestamp).toLocaleString() : 'Unknown time';
                return (
                  <div key={index} className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Mail className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <span className="font-semibold text-base">{email.subject}</span>
                          <p className="text-xs text-muted-foreground mt-0.5">{timestamp}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">To:</span>
                      <span className="font-medium">{email.to}</span>
                    </div>
                    <div className="text-sm bg-muted/50 p-4 rounded-md border whitespace-pre-wrap font-mono">
                      {email.body}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Layout;
