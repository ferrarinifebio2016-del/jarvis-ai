export interface AssistantTool {name:string;description:string;execute:(input:unknown)=>Promise<unknown>}
// Future tools must be explicitly registered and authorized before execution.
export const tools:ReadonlyArray<AssistantTool>=[];
