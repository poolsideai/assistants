// Referenced by worker consumers so applications importing component sources
// receive this declaration without including the components package's tsconfig.
declare module "*?shared-worker" {
  const WorkerConstructor: { new (options?: Omit<WorkerOptions, "type">): Worker };
  export default WorkerConstructor;
}
