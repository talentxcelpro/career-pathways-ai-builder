import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Video, 
  Phone, 
  X, 
  Check, 
  Sparkles,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

export interface ScheduledMeetingData {
  title: string;
  date: string;
  time: string;
  duration: string;
  type: 'video' | 'audio';
  note?: string;
}

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerName: string;
  partnerAvatar?: string;
  partnerTitle?: string;
  onSchedule: (meeting: ScheduledMeetingData) => void;
}

export const ScheduleMeetingModal: React.FC<ScheduleMeetingModalProps> = ({
  isOpen,
  onClose,
  partnerName,
  partnerAvatar,
  partnerTitle = 'Executive Member',
  onSchedule
}) => {
  // Calculate tomorrow's date as default
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split('T')[0];

  const [title, setTitle] = useState(`Meeting with ${partnerName}`);
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState('11:00');
  const [duration, setDuration] = useState('30 mins');
  const [type, setType] = useState<'video' | 'audio'>('video');
  const [note, setNote] = useState('Looking forward to connecting and discussing career opportunities and mutual synergies.');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a meeting title');
      return;
    }
    if (!date) {
      toast.error('Please select a date');
      return;
    }
    if (!time) {
      toast.error('Please select a time');
      return;
    }

    onSchedule({
      title: title.trim(),
      date,
      time,
      duration,
      type,
      note: note.trim()
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-card rounded-3xl border border-slate-200 dark:border-border shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-border flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-muted/20 dark:to-muted/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-foreground flex items-center gap-1.5">
                <span>Schedule Meeting</span>
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              </h2>
              <p className="text-xs text-muted-foreground">Send a calendar invite to {partnerName}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Partner Info Banner */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-muted/30 border-b border-slate-100 dark:border-border flex items-center gap-3">
          <Avatar className="w-9 h-9 border border-slate-200 dark:border-border">
            <AvatarImage src={partnerAvatar} alt={partnerName} />
            <AvatarFallback className="bg-blue-600 text-white font-bold text-xs">
              {partnerName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-xs font-bold text-foreground truncate">{partnerName}</p>
            <p className="text-[11px] text-muted-foreground truncate">{partnerTitle}</p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto max-h-[70vh]">
          
          {/* Meeting Title */}
          <div>
            <label className="text-xs font-bold text-foreground block mb-1.5">Meeting Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Career Strategy Sync"
              className="rounded-xl text-xs h-9"
              required
            />
          </div>

          {/* Date and Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-foreground block mb-1.5">Date</label>
              <Input
                type="date"
                value={date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-xl text-xs h-9"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-foreground block mb-1.5">Time</label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="rounded-xl text-xs h-9"
                required
              />
            </div>
          </div>

          {/* Duration Chips */}
          <div>
            <label className="text-xs font-bold text-foreground block mb-1.5">Duration</label>
            <div className="grid grid-cols-4 gap-2">
              {['15 mins', '30 mins', '45 mins', '60 mins'].map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => setDuration(dur)}
                  className={`py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    duration === dur
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white dark:bg-card text-foreground border-slate-200 dark:border-border hover:bg-slate-50 dark:hover:bg-muted/50'
                  }`}
                >
                  {dur}
                </button>
              ))}
            </div>
          </div>

          {/* Meeting Format (Video or Audio) */}
          <div>
            <label className="text-xs font-bold text-foreground block mb-1.5">Meeting Format</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('video')}
                className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all ${
                  type === 'video'
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold'
                    : 'border-slate-200 dark:border-border bg-white dark:bg-card text-foreground font-medium hover:bg-slate-50'
                }`}
              >
                <div className={`p-1.5 rounded-xl ${type === 'video' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Video className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs">HD Video Call</div>
                  <div className="text-[10px] text-muted-foreground font-normal">TalentXcel WebRTC</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setType('audio')}
                className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all ${
                  type === 'audio'
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold'
                    : 'border-slate-200 dark:border-border bg-white dark:bg-card text-foreground font-medium hover:bg-slate-50'
                }`}
              >
                <div className={`p-1.5 rounded-xl ${type === 'audio' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Phone className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs">Voice Call</div>
                  <div className="text-[10px] text-muted-foreground font-normal">Encrypted Audio</div>
                </div>
              </button>
            </div>
          </div>

          {/* Agenda / Note */}
          <div>
            <label className="text-xs font-bold text-foreground block mb-1.5">Agenda / Notes (Optional)</label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What would you like to discuss?"
              rows={2}
              className="rounded-xl text-xs resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl text-xs h-9 px-4"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-xl text-xs h-9 px-5 bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-600/20 flex items-center gap-1.5"
            >
              <CalendarIcon className="h-3.5 w-3.5" />
              Schedule & Send Invite
            </Button>
          </div>

        </form>

      </div>
    </div>
  );
};
