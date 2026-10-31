import { useParams } from "react-router-dom";

function UserDetails() {
  const { id } = useParams();

  return (
    <>
      <h2>User Details</h2>
      <h3>User ID : {id}</h3>
    </>
  );
}

export default UserDetails;