import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Target, Award, MessageSquare, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: {
    gpa: number;
    grade: string;
    remarks: string;
  };
  onExport: () => void;
}

const ResultModal = ({ isOpen, onClose, result, onExport }: ResultModalProps) => {
  // Handle escape key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking directly on the backdrop
    if (e.target === e.currentTarget) {
      e.preventDefault();
      e.stopPropagation();
      onClose();
    }
  };

  const handleCloseClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  const handleExportClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onExport();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={handleBackdropClick}
        style={{ pointerEvents: 'auto' }}
      >
        {/* Backdrop with blur */}
        <motion.div 
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          initial={{ backdropFilter: "blur(0px)" }}
          animate={{ backdropFilter: "blur(8px)" }}
          exit={{ backdropFilter: "blur(0px)" }}
          onClick={handleBackdropClick}
        />
        
        {/* Modal Content */}
        <motion.div
          className="relative bg-white/90 backdrop-blur-md border border-white/30 rounded-xl shadow-2xl max-w-md w-full mx-4 p-6 overflow-hidden"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          style={{ pointerEvents: 'auto' }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#0088CC]/10 to-transparent animate-pulse"></div>
          
          {/* Close Button */}
          <Button
            onClick={handleCloseClick}
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 text-[#979797] hover:text-[#000000] z-[10000] h-8 w-8 p-0 hover:bg-gray-100 rounded-full transition-all duration-200"
            style={{ pointerEvents: 'auto' }}
            type="button"
          >
            <X size={20} />
          </Button>

          {/* Header */}
          <motion.div
            className="text-center mb-6 relative z-10"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-xl font-bold text-[#0088CC] font-jakarta">
              GPA Results
            </h2>
          </motion.div>

          {/* Results */}
          <div className="space-y-4 mb-6 relative z-10">
            <motion.div
              className="bg-white/50 p-4 rounded-lg border border-white/20 text-center relative overflow-hidden"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#0088CC]/5 to-transparent"></div>
              <div className="flex items-center justify-center mb-2 relative z-10">
                <Target className="text-[#0088CC] mr-2" size={20} />
              </div>
              <div className="text-2xl font-bold text-[#0088CC] font-jakarta relative z-10">
                {result.gpa.toFixed(2)}
              </div>
              <div className="text-[#979797] font-inter text-sm relative z-10">GPA</div>
            </motion.div>
            
            <motion.div
              className="bg-white/50 p-4 rounded-lg border border-white/20 text-center relative overflow-hidden"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#000000]/5 to-transparent"></div>
              <div className="flex items-center justify-center mb-2 relative z-10">
                <Award className="text-[#000000] mr-2" size={20} />
              </div>
              <div className="text-2xl font-bold text-[#000000] font-jakarta relative z-10">
                {result.grade}
              </div>
              <div className="text-[#979797] font-inter text-sm relative z-10">Grade</div>
            </motion.div>
            
            <motion.div
              className="bg-white/50 p-4 rounded-lg border border-white/20 text-center relative overflow-hidden"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#979797]/5 to-transparent"></div>
              <div className="flex items-center justify-center mb-2 relative z-10">
                <MessageSquare className="text-[#000000] mr-2" size={20} />
              </div>
              <div className="text-lg font-bold text-[#000000] font-jakarta relative z-10">
                {result.remarks}
              </div>
              <div className="text-[#979797] font-inter text-sm relative z-10">Remarks</div>
            </motion.div>
          </div>
          
          {/* Export Button */}
          <motion.div
            className="text-center relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={handleExportClick}
              className="bg-[#0088CC] hover:bg-[#0077BB] text-white font-inter w-full transition-all duration-200"
              type="button"
              style={{ pointerEvents: 'auto' }}
            >
              <Download size={16} className="mr-2" />
              Export as PDF
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ResultModal;