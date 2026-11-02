import React from 'react';
import { Calendar, Laptop, Briefcase, ChevronRight } from 'lucide-react';
import { CareerEvent } from '@/services/careerverse/careerBadgeAndRewardsService';

interface EventsWidgetProps {
  events: CareerEvent[];
  onOpenEvents?: () => void;
  onSelectEvent?: (event: CareerEvent) => void;
}

export const EventsWidget: React.FC<EventsWidgetProps> = ({
  events,
  onOpenEvents,
  onSelectEvent,
}) => {
  return (
    <div className="bg-[#101E3B] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-[#36D9F5]/20 flex items-center justify-center text-[#36D9F5]">
          <Calendar className="w-4 h-4" />
        </div>
        <h3 className="font-bold text-white text-base">Upcoming Events</h3>
      </div>

      {/* Events List matching reference screenshot */}
      <div className="space-y-2.5">
        {events.slice(0, 2).map((event, idx) => (
          <div
            key={event.id}
            onClick={() => onSelectEvent?.(event)}
            className="flex items-center justify-between p-3 rounded-xl bg-[#071329]/60 hover:bg-[#071329] border border-white/5 hover:border-[#36D9F5]/40 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  idx === 0
                    ? 'bg-[#278DFF]/20 text-[#36D9F5] border border-[#278DFF]/30'
                    : 'bg-[#FFCA55]/20 text-[#FFCA55] border border-[#FFCA55]/30'
                }`}
              >
                {idx === 0 ? <Laptop className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
              </div>

              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-[#36D9F5] transition-colors leading-snug">
                  {event.title}
                </h4>
                <p className="text-[10px] text-slate-400">{event.description}</p>
              </div>
            </div>

            <span className="text-[11px] font-black text-slate-300 bg-[#101E3B] px-2 py-1 rounded-md shrink-0">
              {event.date_display}
            </span>
          </div>
        ))}
      </div>

      {/* View All Events Footer */}
      <button
        onClick={onOpenEvents}
        className="w-full text-center text-xs font-bold text-[#36D9F5] hover:underline flex items-center justify-center gap-1 pt-1"
      >
        <span>View All Events</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
