import React, { useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWorkOrders } from '@/hooks/use-maintenance';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    type: 'work_order' | 'inspection';
    status?: string;
    store_name?: string;
  };
}

export const MaintenanceCalendar: React.FC = () => {
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [date, setDate] = useState(new Date());
  
  const { data: workOrders = [] } = useWorkOrders();

  // Convert work orders to calendar events
  const events: CalendarEvent[] = workOrders
    .filter(wo => wo.scheduled_at)
    .map(wo => ({
      id: `wo-${wo.id}`,
      title: wo.summary || `Work Order - ${wo.store_name || 'Store'}`,
      start: new Date(wo.scheduled_at!),
      end: new Date(new Date(wo.scheduled_at!).getTime() + 60 * 60000), // 1 hour default
      resource: {
        type: 'work_order' as const,
        status: wo.status,
        store_name: wo.store_name,
      },
    }));

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#3174ad';
    let borderColor = '#3174ad';

    if (event.resource.type === 'work_order') {
      switch (event.resource.status) {
        case 'new':
          backgroundColor = '#ef4444';
          borderColor = '#dc2626';
          break;
        case 'assigned':
          backgroundColor = '#f97316';
          borderColor = '#ea580c';
          break;
        case 'in_progress':
          backgroundColor = '#eab308';
          borderColor = '#ca8a04';
          break;
        case 'complete':
          backgroundColor = '#22c55e';
          borderColor = '#16a34a';
          break;
        case 'cancelled':
          backgroundColor = '#6b7280';
          borderColor = '#4b5563';
          break;
      }
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        color: 'white',
        border: 'none',
        borderRadius: '4px',
      },
    };
  };

  const CustomEvent = ({ event }: { event: CalendarEvent }) => (
    <div className="text-xs">
      <div className="font-medium truncate">{event.title}</div>
      <div className="flex items-center gap-1 mt-1">
        {event.resource.status && (
          <Badge variant="secondary" className="text-xs">
            {event.resource.status}
          </Badge>
        )}
      </div>
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Maintenance Calendar
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={view === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('month')}
            >
              Month
            </Button>
            <Button
              variant={view === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('week')}
            >
              Week
            </Button>
            <Button
              variant={view === 'day' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('day')}
            >
              Day
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-sm">New</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span className="text-sm">Assigned</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span className="text-sm">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-sm">Complete</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-500 rounded"></div>
            <span className="text-sm">Cancelled</span>
          </div>
        </div>
        
        <div style={{ height: '600px' }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            view={view}
            onView={setView}
            date={date}
            onNavigate={setDate}
            eventPropGetter={eventStyleGetter}
            components={{
              event: CustomEvent,
            }}
            popup
            showMultiDayTimes
          />
        </div>
      </CardContent>
    </Card>
  );
};
