// Matches the backend API enums and DTOs

/** Matches the LeaveType enum in the backend API */
export enum LeaveType {
    Annual = 0,
    Sick = 1,
    Special = 2,
    Unpaid = 3
  }

/** Matches the LeaveStatus enum in the backend API */
export enum LeaveStatus {
    Pending = 0,
    Approved = 1,
    Rejected = 2
  }

/** Data required to create/update a leave request via API */
export interface LeaveRequestData {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  type: LeaveType;
  isStartHalfDay: boolean;
  isEndHalfDay: boolean;
}

/** Matches the LeaveItem DTO returned by the backend API */
export interface Leave {
  id: number;
  type: LeaveType;
  startDate: string; // ISO Date string
  endDate: string;   // ISO Date string
  status: LeaveStatus;
  ownerEmail: string;
  isStartHalfDay: boolean;
  isEndHalfDay: boolean;
  // Optional: duration?: number;
}

/** Matches the PaginatedResponse<LeaveItem> from the backend API */
export interface PaginatedLeaveResponse {
    data: Leave[];
    totalCount: number;
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;
    pageNumber: number;
    pageSize: number;
}