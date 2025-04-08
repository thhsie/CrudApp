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
    startDate: string; // Should be YYYY-MM-DD format string
    endDate: string;   // Should be YYYY-MM-DD format string
    type: LeaveType;   // The numeric enum value
  }

/** Matches the LeaveItem DTO returned by the backend API */
export interface Leave {
    id: number;
    type: LeaveType; // Numeric enum value
    startDate: string; // Date string from API (e.g., ISO 8601)
    endDate: string;   // Date string from API (e.g., ISO 8601)
    status: LeaveStatus; // Numeric enum value
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