import api from './api';
import { Leave, LeaveRequestData, PaginatedLeaveResponse } from '../types/leave';

const LEAVES_BASE_URL = '/leaves';
const DEFAULT_PAGE_SIZE = 10; // Define a default page size

export const leaveService = {
  /** Fetches all leave requests accessible to the current user (for non-admins) */
  getAllLeaves: async (): Promise<Leave[]> => {
    const response = await api.get<Leave[]>(LEAVES_BASE_URL);
    return response.data;
  },

  /** Fetches a single leave request by ID */
  getLeaveById: async (id: number): Promise<Leave> => {
    const response = await api.get<Leave>(`${LEAVES_BASE_URL}/${id}`);
    return response.data;
  },

  /** Fetches paginated leave requests (Admin only) */
  getAdminLeaves: async (pageParam = 1, pageSize = DEFAULT_PAGE_SIZE): Promise<PaginatedLeaveResponse> => {
    console.log(`Fetching admin leaves: page=${pageParam}, size=${pageSize}`); // Debug log
    const response = await api.get<PaginatedLeaveResponse>(`${LEAVES_BASE_URL}/all`, {
      params: { pageNumber: pageParam, pageSize },
    });
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