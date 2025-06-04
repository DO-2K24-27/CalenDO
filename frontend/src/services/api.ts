import { Event, Planning } from '../types';

const API_BASE_URL = '/api';

export const api = {
  async getEvents(): Promise<Event[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/events`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      // Handle null response from backend when no events exist
      return data || [];
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },

  async getEventByUid(uid: string): Promise<Event> {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${uid}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching event ${uid}:`, error);
      throw error;
    }
  },

  // Planning endpoints
  async getPlannings(): Promise<Planning[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/plannings`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      // Handle null response from backend when no plannings exist
      return data || [];
    } catch (error) {
      console.error('Error fetching plannings:', error);
      throw error;
    }
  },

  async getPlanningById(id: string): Promise<Planning> {
    try {
      const response = await fetch(`${API_BASE_URL}/plannings/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching planning ${id}:`, error);
      throw error;
    }
  },

  async getDefaultPlanning(): Promise<Planning> {
    try {
      const response = await fetch(`${API_BASE_URL}/plannings/default`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching default planning:', error);
      throw error;
    }
  },

  async checkHealth(): Promise<{ status: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error checking API health:', error);
      throw error;
    }
  }
};