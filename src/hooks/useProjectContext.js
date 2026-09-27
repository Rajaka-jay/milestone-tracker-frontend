import { useOutletContext } from 'react-router-dom';

/** Shared state provided by the ProjectDetails workspace to each of its tabs. */
export function useProjectContext() {
  return useOutletContext();
}
