import api from './api.ts';
import { Leave, LeaveRequest } from '../types/leave.ts';

export const leaveService = {
  getAllLeaves: async (): Promise<Leave[]> => {
    const response = await api.get<Leave[]>('/api/leaves');
    return response.data;
  },

  getUserLeaves: async (): Promise<Leave[]> => {
    const response = await api.get<Leave[]>('/api/leaves');
    return response.data;
  },

  getLeaveById: async (id: number): Promise<Leave> => {
    const response = await api.get<Leave>(`/api/leaves/${id}`);
    return response.data;
  },

  createLeave: async (leaveRequest: LeaveRequest): Promise<Leave> => {
    const response = await api.post<Leave>('/api/leaves', leaveRequest);
    return response.data;
  },

  approveLeave: async (id: number): Promise<Leave> => {
    const response = await api.put<Leave>(`/api/leaves/${id}/approve`);
    return response.data;
  },

  rejectLeave: async (id: number): Promise<Leave> => {
    const response = await api.put<Leave>(`/api/leaves/${id}/reject`);
    return response.data;
  },

  deleteLeave: async (id: number): Promise<void> => {
    await api.delete(`/api/leaves/${id}`);
  },
};