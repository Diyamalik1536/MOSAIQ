import { Link, Outlet } from "react-router-dom";

function About() {
  return (
    <>
      <h2>About Page</h2>

      <Link to="team">Team</Link> |{" "}
      <Link to="company">Company</Link>

      <hr />

      <Outlet />
    </>
  );
}

export default About;