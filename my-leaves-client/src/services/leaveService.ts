import api from './api';
import { Leave, LeaveRequestData, PaginatedLeaveResponse } from '../types/leave';

const LEAVES_BASE_URL = '/leaves';
const DEFAULT_PAGE_SIZE = 10; // Can be different for user vs admin if needed

export const leaveService = {
  /** Fetches paginated leave requests for the current user */
  getUserLeaves: async (pageParam = 1, pageSize = DEFAULT_PAGE_SIZE): Promise<PaginatedLeaveResponse> => {
    console.log(`Fetching user leaves: page=${pageParam}, size=${pageSize}`); // Debug log
    const response = await api.get<PaginatedLeaveResponse>(LEAVES_BASE_URL, { // Use base URL
       params: { pageNumber: pageParam, pageSize },
     });
    return response.data;
  },

  /** Fetches a single leave request by ID */
  getLeaveById: async (id: number): Promise<Leave> => {
    const response = await api.get<Leave>(`${LEAVES_BASE_URL}/${id}`);
    return response.data;
  },

  /** Fetches paginated leave requests (Admin only), optionally filtered by owner email */
  getAdminLeaves: async (pageParam = 1, pageSize = DEFAULT_PAGE_SIZE, ownerEmail?: string | null): Promise<PaginatedLeaveResponse> => {
    console.log(`Fetching admin leaves: page=${pageParam}, size=${pageSize}, email=${ownerEmail || 'none'}`);
    const params: Record<string, any> = { // Use Record for dynamic params
         pageNumber: pageParam,
         pageSize
    };
    // Add email filter only if it has a value
    if (ownerEmail) {
        params.ownerEmail = ownerEmail;
    }
    const response = await api.get<PaginatedLeaveResponse>(`${LEAVES_BASE_URL}/all`, { params });
    return response.data;
  },

   /** Creates a new leave request */
  createLeave: async (leaveRequest: LeaveRequestData): Promise<Leave> => {
    const response = await api.post<Leave>(LEAVES_BASE_URL, leaveRequest);
    return response.data;
  },

  /** Approves a leave request (Admin only) */
  approveLeave: async (id: number): Promise<void> => {
    await api.post(`${LEAVES_BASE_URL}/${id}/approve`);
  },

  /** Rejects a leave request (Admin only) */
  rejectLeave: async (id: number): Promise<void> => {
    await api.post(`${LEAVES_BASE_URL}/${id}/reject`);
  },

  /** Deletes a leave request */
  deleteLeave: async (id: number): Promise<void> => {
    await api.delete(`${LEAVES_BASE_URL}/${id}`);
  },
};