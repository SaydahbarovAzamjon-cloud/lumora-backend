/**
 * Lifecycle of a face analysis document (DATABASE.md §5.2).
 * Stored in MongoDB as lowercase strings. Not exposed on the public GraphQL API yet.
 */
export enum AnalysisStatus {
  PENDING = 'pending',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
}
