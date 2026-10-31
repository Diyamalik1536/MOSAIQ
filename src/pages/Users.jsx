import { Link } from "react-router-dom";

function Users() {
    return (
        <>
            <h1>Users Page</h1>

            <Link to="/users/1">User 1</Link>
            <br />
            <Link to="/users/2">User 2</Link>
        </>
    );
}

export default Users;