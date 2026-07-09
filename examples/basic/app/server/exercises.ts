import type { Exercise } from "../shared/types"

export const exercises: Exercise[] = [
  {
    id: "1",
    title: "Render HTML",
    description: "Create a page with server-rendered data."
  },
  {
    id: "2",
    title: "Handle actions",
    description: "Submit a form to a local route action."
  }
]

export function findExercise(id: string): Exercise | undefined {
  return exercises.find((exercise) => exercise.id === id)
}
