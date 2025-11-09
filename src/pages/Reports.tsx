import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

const Reports = () => {
  const [reportType, setReportType] = useState<string>('');
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());

  const handleDownload = () => {
    if (!reportType) {
      toast.error('Please select a report type');
      return;
    }

    // Mock download - in real app would generate actual report
    toast.success(`Downloading ${reportType} report...`);
    
    // Create a simple CSV content
    let csvContent = '';
    
    if (reportType === 'salary') {
      csvContent = 'data:text/csv;charset=utf-8,Month,Gross,Deductions,Net\n';
      csvContent += 'January,50000,3000,47000\n';
      csvContent += 'February,50000,3000,47000\n';
    } else if (reportType === 'attendance') {
      csvContent = 'data:text/csv;charset=utf-8,Date,CheckIn,CheckOut,Hours\n';
      csvContent += '2025-01-01,09:00,17:00,8\n';
      csvContent += '2025-01-02,09:00,17:00,8\n';
    }
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${reportType}_report_${year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Salary Statement Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="salary">Salary Statement</SelectItem>
                  <SelectItem value="attendance">Attendance Report</SelectItem>
                  <SelectItem value="timeoff">Time Off Report</SelectItem>
                  <SelectItem value="payroll">Payroll Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Year</Label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2023, 2024, 2025].map((y) => (
                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleDownload} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Download Report (CSV)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>Salary Statement:</strong> Monthly breakdown of employee salaries with earnings and deductions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>Attendance Report:</strong> Daily attendance records with check-in/out times and work hours</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>Time Off Report:</strong> Leave requests, approvals, and balance summary</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>Payroll Summary:</strong> Comprehensive payroll overview with total compensation</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Formats</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            All reports are available in CSV format for easy import into Excel or other data analysis tools.
            PDF export will be available in future updates.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
