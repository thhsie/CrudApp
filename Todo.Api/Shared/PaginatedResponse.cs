namespace TodoApi.Shared;

public class PaginatedResponse<T>
{
    public required List<T> Data { get; set; }
    public required int TotalCount { get; set; }
    public required int PendingCount { get; set; }
    public required int ApprovedCount { get; set; }
    public required int RejectedCount { get; set; }
    public required int PageNumber { get; set; }
    public required int PageSize { get; set; }
}
