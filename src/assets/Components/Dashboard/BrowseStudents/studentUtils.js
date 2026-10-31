import { studentData } from './studentData.js'

export function getAllStudents() {
  return studentData
}

export function getStudentById(id) {
  return studentData.find((student) => student.id === id) || null
}
