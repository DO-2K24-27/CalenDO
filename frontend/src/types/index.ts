export interface Event {
  uid: string;
  summary: string;
  description: string;
  location: string;
  start_time: string;
  end_time: string;
  created: string;
  last_modified: string;
}

export interface EventInput {
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