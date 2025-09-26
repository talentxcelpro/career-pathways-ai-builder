import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Upload, Send, Star, Clock, Award } from 'lucide-react';
import { toast } from 'sonner';

interface JobApplicationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  job: any;
  onApply: (applicationData: any) => void;
}

export const JobApplicationDialog: React.FC<JobApplicationDialogProps> = ({
  isOpen,
  onClose,
  job,
  onApply
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    coverLetter: '',
    experience: '',
    portfolio: '',
    expectedSalary: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      onApply({
        ...formData,
        jobId: job.id,
        appliedAt: new Date().toISOString()
      });

      toast.success('Application submitted successfully! +10 TXC coins earned');
      onClose();
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        coverLetter: '',
        experience: '',
        portfolio: '',
        expectedSalary: ''
      });
    } catch (error) {
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Apply for {job?.title}
          </DialogTitle>
          <div className="text-sm text-muted-foreground">
            {job?.companies?.name || job?.company_name} • {job?.location}
          </div>
        </DialogHeader>

        {/* Job Quick Info */}
        <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">{job?.title}</h3>
            <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
              <Award className="h-3 w-3 mr-1" />
              +10 TXC Reward
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>💰 {job?.salary_min && job?.salary_max ? 
              `₹${(job.salary_min / 100000).toFixed(1)}L - ₹${(job.salary_max / 100000).toFixed(1)}L` : 
              'Salary undisclosed'
            }</span>
            <span>⏰ {job?.employment_type}</span>
            <span>📍 {job?.location}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Your full name"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="your.email@example.com"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+91 9876543210"
                required
              />
            </div>
            <div>
              <Label htmlFor="experience">Years of Experience</Label>
              <Input
                id="experience"
                value={formData.experience}
                onChange={(e) => handleInputChange('experience', e.target.value)}
                placeholder="e.g., 3 years"
              />
            </div>
          </div>

          {/* Cover Letter */}
          <div>
            <Label htmlFor="coverLetter">Cover Letter *</Label>
            <Textarea
              id="coverLetter"
              value={formData.coverLetter}
              onChange={(e) => handleInputChange('coverLetter', e.target.value)}
              placeholder="Tell us why you're the perfect fit for this role..."
              rows={4}
              required
            />
          </div>

          {/* Optional Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="portfolio">Portfolio/LinkedIn URL</Label>
              <Input
                id="portfolio"
                value={formData.portfolio}
                onChange={(e) => handleInputChange('portfolio', e.target.value)}
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>
            <div>
              <Label htmlFor="expectedSalary">Expected Salary (LPA)</Label>
              <Input
                id="expectedSalary"
                value={formData.expectedSalary}
                onChange={(e) => handleInputChange('expectedSalary', e.target.value)}
                placeholder="e.g., 12 LPA"
              />
            </div>
          </div>

          {/* Resume Upload */}
          <div>
            <Label>Resume Upload</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">
                Drag & drop your resume here, or <span className="text-primary cursor-pointer">browse</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX (Max 5MB)</p>
            </div>
          </div>

          {/* Quick Apply Tips */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-900">Quick Apply Tips</span>
            </div>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Tailor your cover letter to the specific role</li>
              <li>• Highlight relevant skills mentioned in the job description</li>
              <li>• Include quantifiable achievements from your past experience</li>
              <li>• Make sure your portfolio/LinkedIn is up to date</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
            >
              {isSubmitting ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Application
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};