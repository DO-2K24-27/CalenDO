export interface Planning {
  id: string;
  name: string;
  description: string;
  color: string;
  created: string;
  updated: string;
  is_default: boolean;
  event_count?: number;
}

export interface Event {
  uid: string;
  planning_id: string;
  summary: string;
  description: string;
  location: string;
  start_time: string;
  end_time: string;
  created: string;
  last_modified: string;
  planning?: Planning;
}

export interface EventInput {
  planning_id: string;
  summary: string;
  description: string;
  location: string;
  start_time: string;
  end_time: string;
}

export type CalendarViewType = 'month' | 'week' | 'day';

export interface SearchFilters {
  keyword: string;
  field: 'all' | 'summary' | 'description' | 'location';
}

export interface PlanningSelection {
  selectedPlannings: Planning[];
  selectAll: boolean;
}