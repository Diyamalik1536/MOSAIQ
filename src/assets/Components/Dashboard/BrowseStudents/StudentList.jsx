import StudentCard from "./StudentCard";

function StudentList({ students }) {
    return (
        <div className="student-grid">
            {students.map((student) => (
                <StudentCard
                    key={student.id}
                    student={student}
                    matchScore={student.matchScore}
                />
            ))}
        </div>
    );
}

export default StudentList;
