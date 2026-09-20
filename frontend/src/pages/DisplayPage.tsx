import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCalendar } from '../contexts/CalendarContext';
import MonthView from '../components/Calendar/MonthView';
import WeekView from '../components/Calendar/WeekView';
import DayView from '../components/Calendar/DayView';
import EventDetail from '../components/Event/EventDetail';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import ErrorDisplay from '../components/UI/ErrorDisplay';
import { formatDateRange } from '../utils/dateUtils';
import { CalendarViewType } from '../types';

const VALID_VIEWS: CalendarViewType[] = ['month', 'week', 'day'];

// Parsed as local calendar date (not UTC) so `?date=2026-09-15` always lands on
// the 15th regardless of the display's timezone.
const parseDateParam = (value: string | null): Date | null => {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(date.getTime()) ? null : date;
};

const DisplayPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    plannings,
    filteredEvents,
    isLoading,
    error,
    currentDate,
    view,
    selectedEvent,
    setSelectedEvent,
    setCurrentDate,
    setView,
    setViewSilently,
    setSelectedPlannings,
    setSelectedPlanningsSilently,
    refreshEvents,
  } = useCalendar();

  // Apply `view`/`date`/`plannings` from the URL. By default this uses the
  // silent setters so visiting /display never overwrites the user's saved
  // preferences in localStorage. With `save=true`, it persists them instead
  // (like the main calendar page does) and then redirects to a bare
  // /display, so a kiosk screen can be configured once via URL and reloaded
  // afterwards without any query params.
  useEffect(() => {
    const viewParam = searchParams.get('view');
    const dateParam = parseDateParam(searchParams.get('date'));
    const planningsParam = searchParams.get('plannings');
    const shouldSave = searchParams.get('save') === 'true';

    // Wait for plannings to load before matching names against them.
    if (planningsParam !== null && planningsParam.trim() !== '' && plannings.length === 0) {
      return;
    }

    if (viewParam && VALID_VIEWS.includes(viewParam as CalendarViewType)) {
      (shouldSave ? setView : setViewSilently)(viewParam as CalendarViewType);
    }

    if (dateParam) {
      setCurrentDate(dateParam);
    }

    if (planningsParam !== null) {
      const applyPlannings = shouldSave ? setSelectedPlannings : setSelectedPlanningsSilently;
      if (planningsParam.trim() === '') {
        applyPlannings([]);
      } else {
        const requestedNames = planningsParam
          .split(',')
          .map(name => name.trim().toLowerCase())
          .filter(Boolean);
        applyPlannings(plannings.filter(p => requestedNames.includes(p.name.toLowerCase())));
      }
    }

    if (shouldSave) {
      navigate('/display', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, plannings]);

  return (
    <div className="w-full h-screen flex flex-col bg-purple-50 overflow-hidden">
      <div className="px-4 py-3 shrink-0">
        <h1 className="text-2xl md:text-3xl font-semibold text-purple-900">
          {formatDateRange(currentDate, view)}
        </h1>
      </div>

      <div className="flex-1 min-h-0 overflow-auto px-2 pb-2 flex flex-col">
        {isLoading && filteredEvents.length === 0 ? (
          <LoadingSpinner size="large" />
        ) : error ? (
          <ErrorDisplay message={error} onRetry={refreshEvents} />
        ) : (
          <div className="flex-1 min-h-0">
            {view === 'month' && <MonthView fillHeight />}
            {view === 'week' && <WeekView />}
            {view === 'day' && <DayView />}
          </div>
        )}
      </div>

      {selectedEvent && (
        <EventDetail event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
};

export default DisplayPage;
