import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LogEntry } from '@shared/schema';
import { FileDown, FileText, FileArchive } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LogExporterProps {
  logEntries: LogEntry[];
}

export default function LogExporter({ logEntries }: LogExporterProps) {
  const [exportFormat, setExportFormat] = useState<'adif' | 'csv' | 'json'>('adif');
  const { toast } = useToast();

  // Convert log entry to ADIF format
  const convertToADIF = (entries: LogEntry[]): string => {
    let adif = `Generated on ${new Date().toISOString()}\n`;
    adif += '<ADIF_VER:5>3.1.0\n';
    adif += '<CREATED_TIMESTAMP:20>' + new Date().toISOString() + '\n';
    adif += '<PROGRAMID:10>VA7HAM App\n';
    adif += '<EOH>\n\n';

    entries.forEach(entry => {
      const dateObj = new Date(entry.dateTime);
      const date = dateObj.toISOString().split('T')[0].replace(/-/g, '');
      const time = dateObj.toISOString().split('T')[1].substring(0, 5).replace(':', '');

      adif += `<QSO_DATE:8>${date}\n`;
      adif += `<TIME_ON:4>${time}\n`;
      adif += `<CALL:${entry.callSign.length}>${entry.callSign}\n`;
      adif += `<FREQ:${entry.frequency.toString().length}>${entry.frequency}\n`;
      
      if (entry.operatorName) {
        adif += `<NAME:${entry.operatorName.length}>${entry.operatorName}\n`;
      }
      
      if (entry.location) {
        adif += `<QTH:${entry.location.length}>${entry.location}\n`;
      }
      
      if (entry.signalReport) {
        adif += `<RST_SENT:${entry.signalReport.length}>${entry.signalReport}\n`;
      }
      
      if (entry.notes) {
        adif += `<COMMENT:${entry.notes.length}>${entry.notes}\n`;
      }
      
      adif += '<EOR>\n\n';
    });

    return adif;
  };

  // Convert log entry to CSV format
  const convertToCSV = (entries: LogEntry[]): string => {
    const headers = ['Date', 'Time', 'Frequency', 'Call Sign', 'Operator', 'Location', 'Signal Report', 'Notes'];
    const rows = entries.map(entry => {
      const dateObj = new Date(entry.dateTime);
      const date = dateObj.toISOString().split('T')[0];
      const time = dateObj.toISOString().split('T')[1].substring(0, 5);
      
      return [
        date,
        time,
        entry.frequency.toString(),
        entry.callSign,
        entry.operatorName || '',
        entry.location || '',
        entry.signalReport || '',
        entry.notes || ''
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    return csvContent;
  };

  // Convert log entry to JSON format
  const convertToJSON = (entries: LogEntry[]): string => {
    return JSON.stringify(entries, null, 2);
  };

  // Download the exported file
  const downloadExport = () => {
    if (logEntries.length === 0) {
      toast({
        title: "No entries to export",
        description: "Your logbook is empty. Add some contacts first.",
        variant: "destructive"
      });
      return;
    }

    let content = '';
    let fileExtension = '';
    let mimeType = '';

    switch (exportFormat) {
      case 'adif':
        content = convertToADIF(logEntries);
        fileExtension = 'adi';
        mimeType = 'application/octet-stream';
        break;
      case 'csv':
        content = convertToCSV(logEntries);
        fileExtension = 'csv';
        mimeType = 'text/csv';
        break;
      case 'json':
        content = convertToJSON(logEntries);
        fileExtension = 'json';
        mimeType = 'application/json';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const fileName = `logbook_export_${new Date().toISOString().slice(0, 10)}.${fileExtension}`;
    
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Export successful",
      description: `Logbook exported as ${fileName}`,
      variant: "default"
    });
  };

  return (
    <div className="p-4 bg-gray-900 rounded-lg border border-gray-800">
      <h3 className="text-lg font-semibold text-white mb-4">Export Logbook</h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <Button 
            variant={exportFormat === 'adif' ? 'default' : 'outline'} 
            onClick={() => setExportFormat('adif')}
            className="flex items-center justify-center gap-2"
          >
            <FileText className="h-4 w-4" />
            <span>ADIF</span>
          </Button>
          
          <Button 
            variant={exportFormat === 'csv' ? 'default' : 'outline'}
            onClick={() => setExportFormat('csv')}
            className="flex items-center justify-center gap-2"
          >
            <FileArchive className="h-4 w-4" />
            <span>CSV</span>
          </Button>
          
          <Button 
            variant={exportFormat === 'json' ? 'default' : 'outline'}
            onClick={() => setExportFormat('json')}
            className="flex items-center justify-center gap-2"
          >
            <FileText className="h-4 w-4" />
            <span>JSON</span>
          </Button>
        </div>
        
        <div className="text-sm text-gray-400 p-3 bg-gray-800 rounded border border-gray-700">
          {exportFormat === 'adif' && (
            <>
              <p className="font-semibold mb-1">Amateur Data Interchange Format</p>
              <p>Standard format for exchanging logs between amateur radio programs. Compatible with most logging software.</p>
            </>
          )}
          
          {exportFormat === 'csv' && (
            <>
              <p className="font-semibold mb-1">Comma Separated Values</p>
              <p>Universal format that can be imported into spreadsheets and databases. Good for backup and analysis.</p>
            </>
          )}
          
          {exportFormat === 'json' && (
            <>
              <p className="font-semibold mb-1">JavaScript Object Notation</p>
              <p>Modern data format for web applications. Useful for developers and advanced users.</p>
            </>
          )}
        </div>
        
        <Button 
          onClick={downloadExport} 
          disabled={logEntries.length === 0}
          className="w-full flex items-center justify-center gap-2"
        >
          <FileDown className="h-4 w-4" />
          <span>Download {exportFormat.toUpperCase()} Export</span>
        </Button>
        
        <p className="text-xs text-gray-500 text-center">
          Total: {logEntries.length} log entries
        </p>
      </div>
    </div>
  );
}