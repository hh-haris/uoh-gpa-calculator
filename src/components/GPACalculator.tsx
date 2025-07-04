import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Check, ChevronsUpDown, BookOpen, Hash, Award } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Subject, calculateGPA, getGPAPercentage, getLetterGrade, getRemarks } from '@/utils/gradeCalculations';
import { useToast } from '@/hooks/use-toast';
import ResultModal from './ResultModal';
import ShimmerCard from './ShimmerCard';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import jsPDF from 'jspdf';

const subjectOptions = [
  { value: 4, label: "4 Subjects" },
  { value: 5, label: "5 Subjects" },
  { value: 6, label: "6 Subjects" },
  { value: 7, label: "7 Subjects" },
  { value: 8, label: "8 Subjects" },
];

const GPACalculator = () => {
  const [open, setOpen] = useState(false);
  const [subjectCount, setSubjectCount] = useState<number | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [result, setResult] = useState<null | {
    gpa: number;
    grade: string;
    remarks: string;
  }>(null);
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (subjectCount) {
      const newSubjects = Array.from({ length: subjectCount }, (_, index) => ({
        id: (index + 1).toString(),
        name: '',
        marks: 0,
        creditHours: 1
      }));
      setSubjects(newSubjects);
    } else {
      setSubjects([]);
    }
  }, [subjectCount]);

  const triggerConfetti = (gpa: number) => {
    if (gpa >= 3) {
      // Create a temporary canvas with higher z-index for confetti
      const canvas = document.createElement('canvas');
      canvas.style.position = 'fixed';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '99999'; // Higher than modal
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      document.body.appendChild(canvas);

      // Colorful confetti with reduced density and shorter duration
      const duration = 1000; // 1 second
      const end = Date.now() + duration;
      const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8"];

      const myConfetti = confetti.create(canvas, {
        resize: true,
        useWorker: true
      });

      const frame = () => {
        if (Date.now() > end) {
          // Remove the canvas after confetti is done
          document.body.removeChild(canvas);
          return;
        }

        // Left side confetti
        myConfetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors: colors,
          gravity: 0.8,
          scalar: 0.8,
        });

        // Right side confetti
        myConfetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors: colors,
          gravity: 0.8,
          scalar: 0.8,
        });

        // Center confetti
        myConfetti({
          particleCount: 2,
          angle: 90,
          spread: 45,
          origin: { x: 0.5, y: 0.6 },
          colors: colors,
          gravity: 0.8,
          scalar: 0.8,
        });

        requestAnimationFrame(frame);
      };
      frame();
    }
  };

  const updateSubject = (id: string, field: keyof Subject, value: string | number) => {
    setSubjects(subjects.map(subject => 
      subject.id === id ? { ...subject, [field]: value } : subject
    ));
  };

  const calculateResult = () => {
    const validSubjects = subjects.filter(subject => 
      subject.name.trim() !== '' && subject.marks >= 0 && subject.marks <= 100
    );

    if (validSubjects.length === 0) {
      toast({
        title: "Invalid Input",
        description: "Please fill in all subject details with marks between 0-100.",
        variant: "destructive"
      });
      return;
    }

    if (validSubjects.length !== subjectCount) {
      toast({
        title: "Incomplete Data",
        description: "Please fill in all subjects before calculating.",
        variant: "destructive"
      });
      return;
    }

    const gpa = calculateGPA(validSubjects);
    const percentage = getGPAPercentage(gpa);
    const grade = getLetterGrade(percentage);
    const remarks = getRemarks(percentage);

    setResult({ gpa, grade, remarks });
    setShowModal(true);
    
    // Trigger confetti after a short delay
    setTimeout(() => triggerConfetti(gpa), 500);
  };

  const exportToPDF = () => {
    if (!result) return;
    
    try {
      const doc = new jsPDF();
      
      // Set font
      doc.setFont('helvetica');
      
      // Title
      doc.setFontSize(20);
      doc.setTextColor(0, 136, 204); // #0088CC
      doc.text('UoH GPA Calculator Results', 20, 30);
      
      // Horizontal line
      doc.setDrawColor(238, 238, 238); // #EEEEEE
      doc.line(20, 35, 190, 35);
      
      // Results section
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Results:', 20, 50);
      
      doc.setFontSize(12);
      doc.text(`GPA: ${result.gpa.toFixed(2)}`, 30, 65);
      doc.text(`Grade: ${result.grade}`, 30, 75);
      doc.text(`Remarks: ${result.remarks}`, 30, 85);
      
      // Subject details section
      doc.setFontSize(14);
      doc.text('Subject Details:', 20, 105);
      
      doc.setFontSize(10);
      let yPosition = 120;
      subjects.forEach((subject, index) => {
        if (yPosition > 270) { // Check if we need a new page
          doc.addPage();
          yPosition = 20;
        }
        doc.text(
          `${index + 1}. ${subject.name}: ${subject.marks}/100 (${subject.creditHours} credit hours)`,
          30,
          yPosition
        );
        yPosition += 10;
      });
      
      // Footer
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(8);
      doc.setTextColor(151, 151, 151); // #979797
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, yPosition + 20);
      doc.text('Prepared by students of Batch 2024 – AI Section A & B', 20, yPosition + 30);
      
      // Save the PDF
      doc.save(`GPA_Results_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "Export Complete",
        description: "Your GPA results have been downloaded as a PDF file.",
      });
      setShowModal(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Export Error",
        description: "There was an error generating the PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Subject Count Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ShimmerCard>
          <Card className="border-2 border-[#EEEEEE]">
            <CardHeader className="bg-[#EEEEEE] p-4 sm:p-6">
              <CardTitle className="font-jakarta font-semibold text-[#000000] text-lg sm:text-xl">
                Number of Subjects
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between border-[#979797] focus:border-[#0088CC] h-12 text-base"
                  >
                    {subjectCount
                      ? subjectOptions.find((option) => option.value === subjectCount)?.label
                      : "Select number of subjects..."}
                    <ChevronsUpDown className="opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandList>
                      <CommandEmpty>No subjects found.</CommandEmpty>
                      <CommandGroup>
                        {subjectOptions.map((option) => (
                          <CommandItem
                            key={option.value}
                            value={option.value.toString()}
                            onSelect={() => {
                              setSubjectCount(option.value === subjectCount ? null : option.value);
                              setOpen(false);
                            }}
                          >
                            {option.label}
                            <Check
                              className={cn(
                                "ml-auto",
                                subjectCount === option.value ? "opacity-100" : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </CardContent>
          </Card>
        </ShimmerCard>
      </motion.div>

      {/* Subjects Input - Only show when subject count is selected */}
      {subjectCount && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <ShimmerCard>
            <Card className="border-2 border-[#EEEEEE]">
              <CardHeader className="bg-[#EEEEEE] p-4 sm:p-6">
                <CardTitle className="font-jakarta font-semibold text-[#000000] text-lg sm:text-xl flex items-center">
                  <BookOpen size={20} className="mr-2 text-[#0088CC]" />
                  Subject Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="grid gap-4 sm:gap-6">
                  {subjects.map((subject, index) => (
                    <motion.div
                      key={subject.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-[#0088CC]/5 via-transparent to-[#0088CC]/5 rounded-lg"></div>
                      <div className="relative bg-white p-4 rounded-lg border border-[#EEEEEE] space-y-4">
                        <div className="text-sm font-medium text-[#0088CC] font-jakarta">
                          Subject {index + 1}
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <Label className="font-inter text-[#000000] text-sm flex items-center mb-2">
                              <BookOpen size={16} className="mr-1 text-[#979797]" />
                              Subject Name
                            </Label>
                            <Input
                              value={subject.name}
                              onChange={(e) => updateSubject(subject.id, 'name', e.target.value)}
                              placeholder="Enter subject name"
                              className="border-[#979797] focus:border-[#0088CC] text-sm sm:text-base"
                            />
                          </div>
                          <div>
                            <Label className="font-inter text-[#000000] text-sm flex items-center mb-2">
                              <Hash size={16} className="mr-1 text-[#979797]" />
                              Marks (out of 100)
                            </Label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={subject.marks}
                              onChange={(e) => updateSubject(subject.id, 'marks', Number(e.target.value))}
                              className="border-[#979797] focus:border-[#0088CC] text-sm sm:text-base"
                            />
                          </div>
                          <div>
                            <Label className="font-inter text-[#000000] text-sm flex items-center mb-2">
                              <Award size={16} className="mr-1 text-[#979797]" />
                              Credit Hours
                            </Label>
                            <select
                              value={subject.creditHours}
                              onChange={(e) => updateSubject(subject.id, 'creditHours', Number(e.target.value))}
                              className="w-full h-10 px-3 border border-[#979797] rounded-md focus:border-[#0088CC] focus:outline-none text-sm sm:text-base"
                            >
                              <option value={1}>1</option>
                              <option value={2}>2</option>
                              <option value={3}>3</option>
                              <option value={4}>4</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <motion.div 
                  className="pt-6"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={calculateResult}
                    className="bg-[#000000] hover:bg-[#333333] text-white font-inter w-full h-12 text-base transition-all duration-200"
                  >
                    Calculate GPA
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </ShimmerCard>
        </motion.div>
      )}

      <ResultModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        result={result || { gpa: 0, grade: '', remarks: '' }}
        onExport={exportToPDF}
      />
    </div>
  );
};

export default GPACalculator;