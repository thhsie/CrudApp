// --- Updated File: ./my-leaves-client/src/services/leaveService.ts ---
import api from './api';
import { Leave, LeaveRequestData } from '../types/leave';

const LEAVES_BASE_URL = '/leaves';

export const leaveService = {
  /** Fetches all leave requests accessible to the current user */
  getAllLeaves: async (): Promise<Leave[]> => {
    const response = await api.get<Leave[]>(LEAVES_BASE_URL);
    return response.data;
  },

  /** Fetches a single leave request by ID */
  getLeaveById: async (id: number): Promise<Leave> => {
    const response = await api.get<Leave>(`${LEAVES_BASE_URL}/${id}`);
    return response.data;
  },

  /** Creates a new leave request */
  createLeave: async (leaveRequest: LeaveRequestData): Promise<Leave> => {
    const response = await api.post<Leave>(LEAVES_BASE_URL, leaveRequest);
    return response.data; // API returns the created leave item
  },

  /** Approves a leave request (Admin only) */
  approveLeave: async (id: number): Promise<void> => {
    // API returns 200 OK on success, no body needed
    await api.post(`${LEAVES_BASE_URL}/${id}/approve`);
  },

  /** Rejects a leave request (Admin only) */
  rejectLeave: async (id: number): Promise<void> => {
     // API returns 200 OK on success, no body needed
    await api.post(`${LEAVES_BASE_URL}/${id}/reject`);
  },

  /** Deletes a leave request */
  deleteLeave: async (id: number): Promise<void> => {
    // API returns 200 OK on success, no body needed
    await api.delete(`${LEAVES_BASE_URL}/${id}`);
  },
};