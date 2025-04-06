export enum LeaveType {
    Vacation = 0,
    Sick = 1,
    Personal = 2,
    Bereavement = 3,
    Other = 4
  }

  export enum LeaveStatus {
    Pending = 0,
    Approved = 1,
    Rejected = 2
  }

  export interface LeaveRequest {
    startDate: string;
    endDate: string;
    reason: string;
    type: LeaveType;
  }

  export interface Leave extends LeaveRequest {
    id: number;
    userId: string;
    status: LeaveStatus;
    createdAt: string;
  }