import React from 'react';
import { Calendar, ChevronRight, Trophy, Briefcase } from 'lucide-react';
import { CareerEvent } from '@/services/careerverse/careerBadgeAndRewardsService';

interface EventsProps {
  events: CareerEvent[];
  onOpenEventsModal: () => void;
}

export const EventsWidget: React.FC<EventsProps> = ({ events, onOpenEventsModal }) => {
  const displayEvents = events.slice(0, 2);

  return (
    <div className="bg-[#101E3B] border border-white/5 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-[#36D9F5]/15 flex items-center justify-center text-[#36D9F5]">
          <Calendar className="w-4 h-4" />
        </div>
        <h3 className="font-bold text-white text-base">Upcoming Events</h3>
      </div>

      {/* Events List */}
      <div className="flex flex-col gap-2.5">
        {displayEvents.map((event) => (
          <div
            key={event.id}
            onClick={onOpenEventsModal}
            className="flex items-center justify-between p-3 rounded-xl bg-[#071329] border border-white/5 hover:border-[#36D9F5]/40 cursor-pointer transition-all group"
          >
            <div className="flex items-center gap-3 min-w-0 pr-2">
              <div className="w-8 h-8 rounded-lg bg-[#278DFF]/15 flex items-center justify-center text-[#36D9F5] flex-shrink-0">
                {event.category === 'competition' ? (
                  <Trophy className="w-4 h-4" />
                ) : (
                  <Briefcase className="w-4 h-4" />
                )}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white group-hover:text-[#36D9F5] transition-colors truncate">
                  {event.title}
                </h4>
                <p className="text-[10px] text-slate-400 truncate">{event.description}</p>
              </div>
            </div>

            <span className="text-xs font-black text-[#FFCA55] bg-[#FFCA55]/10 px-2 py-1 rounded-md flex-shrink-0">
              {event.event_date}
            </span>
          </div>
        ))}
      </div>

      {/* View All Events */}
      <button
        onClick={onOpenEventsModal}
        className="w-full text-center text-xs font-bold text-[#36D9F5] hover:underline flex items-center justify-center gap-1 pt-1"
      >
        <span>View All Events</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
