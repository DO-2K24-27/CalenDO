import { useCalendar } from '../../contexts/CalendarContext';

export const PlanningSelectionSummary = () => {
  const { selectedPlannings, plannings } = useCalendar();

  if (selectedPlannings.length === plannings.length || selectedPlannings.length === 0) {
    return (
      <div className="text-sm text-gray-600">
        Showing events from <span className="font-medium">all plannings</span>
      </div>
    );
  }

  return (
    <div className="text-sm text-gray-600">
      <span>Showing events from: </span>
      <div className="inline-flex flex-wrap gap-2 mt-1">
        {selectedPlannings.map((planning) => (
          <span
            key={planning.id}
            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs"
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: planning.color }}
            />
            {planning.name}
            {planning.event_count !== undefined && (
              <span className="text-gray-500">({planning.event_count})</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
};
