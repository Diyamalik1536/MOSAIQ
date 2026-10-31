import SignupBrandPanel from "./SignupBrand";
import SignupForm from "./SignupForm";
import "./Signup.css";

function Signup() {
  return (
    <div className="signup-page">
      <SignupBrandPanel />
      <div className="signup-form-area">
        <SignupForm />
      </div>
    </div>
  );
}

export default Signup;
