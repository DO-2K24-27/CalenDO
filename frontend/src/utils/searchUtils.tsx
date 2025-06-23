import { Event, SearchFilters } from '../types';
import React from 'react';
import { formatTextForDisplay } from './textUtils';

export const filterEvents = (events: Event[], filters: SearchFilters): Event[] => {
  if (!filters.keyword) return events;
  
  const keyword = filters.keyword.toLowerCase();
  
  return events.filter(event => {
    if (filters.field === 'all') {
      return (
        event.summary.toLowerCase().includes(keyword) ||
        formatTextForDisplay(event.description).toLowerCase().includes(keyword) ||
        event.location.toLowerCase().includes(keyword)
      );
    } else if (filters.field === 'summary') {
      return event.summary.toLowerCase().includes(keyword);
    } else if (filters.field === 'description') {
      return formatTextForDisplay(event.description).toLowerCase().includes(keyword);
    } else if (filters.field === 'location') {
      return event.location.toLowerCase().includes(keyword);
    }
    return false;
  });
};

export const highlightText = (text: string, keyword: string): React.ReactNode => {
  if (!keyword) return text;
  
  const parts = text.split(new RegExp(`(${keyword})`, 'gi'));
  
  return parts.map((part, index) => 
    part.toLowerCase() === keyword.toLowerCase() 
      ? <span key={index} className="search-highlight">{part}</span> 
      : part
  );
};