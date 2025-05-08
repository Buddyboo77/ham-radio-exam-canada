import { useState } from "react";
import { AlertTriangle, BookOpen, Copy, Maximize2, X, FileText, AlertCircle } from "lucide-react";
import { ReferenceItem as ReferenceItemType } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ReferenceItemProps {
  item: ReferenceItemType;
  isEmergency?: boolean;
}

const ReferenceItem: React.FC<ReferenceItemProps> = ({ 
  item, 
  isEmergency = false 
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(item.description);
    setCopySuccess(true);
    setTimeout(() => {
      setCopySuccess(false);
    }, 2000);
  };

  return (
    <>
      {/* Radio-styled reference item */}
      <div 
        className={`p-2 rounded-md cursor-pointer transition-all
          ${isEmergency 
            ? 'bg-red-900 bg-opacity-20 border border-red-800 hover:bg-red-900 hover:bg-opacity-30' 
            : 'bg-gray-900 bg-opacity-40 border border-gray-700 hover:bg-gray-700'}`}
        onClick={() => setIsDetailsOpen(true)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {isEmergency ? (
              <AlertTriangle className="h-4 w-4 text-red-400 mr-2 flex-shrink-0" />
            ) : (
              <FileText className="h-4 w-4 text-blue-400 mr-2 flex-shrink-0" />
            )}
            <h3 className={`text-sm font-medium line-clamp-1 ${isEmergency ? 'text-red-300' : 'text-gray-100'}`}>
              {item.title}
            </h3>
          </div>
          <button 
            className="radio-button-small bg-transparent w-6 h-6 flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              setIsDetailsOpen(true);
            }}
          >
            <Maximize2 className="h-3.5 w-3.5 text-gray-400" />
          </button>
        </div>
        
        <div className="mt-1 ml-6">
          <p className="text-xs text-gray-300 line-clamp-2">
            {item.description}
          </p>
        </div>
      </div>

      {/* Modal dialog (styled for radio theme) */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="bg-gray-800 border border-gray-700 text-gray-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base border-b border-gray-700 pb-2">
              {isEmergency ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : (
                <FileText className="h-5 w-5 text-blue-400" />
              )}
              <span className={isEmergency ? 'text-red-300' : 'text-blue-300'}>
                {item.title}
              </span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-2">
            <div className="font-mono text-xs text-gray-400 mb-1">
              Category: {item.category}
            </div>
            <div className="bg-gray-900 p-3 rounded-md text-sm text-gray-300 border border-gray-700 whitespace-pre-line max-h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600">
              {item.description}
            </div>
          </div>
          
          <div className="flex justify-between mt-2">
            <button 
              className="radio-button-small"
              onClick={() => setIsDetailsOpen(false)}
              style={{ width: 'auto', paddingLeft: '10px', paddingRight: '10px' }}
            >
              <X className="h-4 w-4 mr-1" />
              Close
            </button>
            
            <button 
              className={`radio-button-small ${copySuccess ? 'from-green-700 to-green-800' : ''}`}
              onClick={handleCopy}
              style={{ width: 'auto', paddingLeft: '10px', paddingRight: '10px' }}
            >
              {copySuccess ? (
                <>
                  <span className="text-green-300">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </>
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReferenceItem;