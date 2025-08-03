import React, { useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMaintenanceSchedules, useMaintenanceRequests } from '@/hooks/use-maintenance';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Clock, AlertTriangle } from 'lucide-react';

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
    type: 'schedule' | 'request';
    priority?: string;
    status?: string;
    cart_qr_code?: string;
    provider_name?: string;
  };
}

export const MaintenanceCalendar: React.FC = () => {
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [date, setDate] = useState(new Date());
  
  const { data: schedules = [] } = useMaintenanceSchedules();
  const { data: requests = [] } = useMaintenanceRequests();

  // Convert schedules and requests to calendar events
  const events: CalendarEvent[] = [
    // Scheduled maintenance
    ...schedules.map(schedule => ({
      id: `schedule-${schedule.id}`,
      title: `${schedule.maintenance_type} - ${(schedule as any).carts?.qr_code}`,
      start: new Date(schedule.next_due_date),
      end: new Date(new Date(schedule.next_due_date).getTime() + schedule.estimated_duration * 60000),
      resource: {
        type: 'schedule' as const,
        cart_qr_code: (schedule as any).carts?.qr_code,
        provider_name: (schedule as any).maintenance_providers?.company_name,
      },
    })),
    // Maintenance requests
    ...requests
      .filter(request => request.scheduled_date)
      .map(request => ({
        id: `request-${request.id}`,
        title: `${request.request_type} - ${(request as any).carts?.qr_code}`,
        start: new Date(request.scheduled_date!),
        end: new Date(new Date(request.scheduled_date!).getTime() + (request.estimated_duration || 30) * 60000),
        resource: {
          type: 'request' as const,
          priority: request.priority,
          status: request.status,
          cart_qr_code: (request as any).carts?.qr_code,
          provider_name: (request as any).maintenance_providers?.company_name,
        },
      })),
  ];

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#3174ad';
    let borderColor = '#3174ad';

    if (event.resource.type === 'request') {
      switch (event.resource.priority) {
        case 'urgent':
          backgroundColor = '#ef4444';
          borderColor = '#dc2626';
          break;
        case 'high':
          backgroundColor = '#f97316';
          borderColor = '#ea580c';
          break;
        case 'medium':
          backgroundColor = '#eab308';
          borderColor = '#ca8a04';
          break;
        case 'low':
          backgroundColor = '#22c55e';
          borderColor = '#16a34a';
          break;
      }

      if (event.resource.status === 'completed') {
        backgroundColor = '#6b7280';
        borderColor = '#4b5563';
      }
    } else {
      // Scheduled maintenance
      backgroundColor = '#8b5cf6';
      borderColor = '#7c3aed';
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
      <div className="font-medium">{event.title}</div>
      <div className="flex items-center gap-1 mt-1">
        {event.resource.type === 'request' && event.resource.priority && (
          <Badge variant="secondary" className="text-xs">
            {event.resource.priority}
          </Badge>
        )}
        {event.resource.provider_name && (
          <span className="text-xs opacity-75">
            {event.resource.provider_name}
          </span>
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
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <span className="text-sm">Scheduled Maintenance</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-sm">Low Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span className="text-sm">Medium Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span className="text-sm">High Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-sm">Urgent</span>
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