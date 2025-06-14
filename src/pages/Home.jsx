import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

const Home = () => {

  return (
    <div>
      <h1>🏠 Home Page</h1>

      <SignedIn>
        <div>
          {console.log("User has successfully signed up")}
          <p>You're signed in!</p>
          <UserButton />
          <nav>
            <Link to="/dashboard">Dashboard</Link> |{" "}
            <Link to="/profile">Profile</Link>
          </nav>
        </div>
      </SignedIn>

      <SignedOut>
        <p>
          <Link to="/sign-in">Sign In</Link> or{" "}
          <Link to="/sign-up">Sign Up</Link>
        </p>
      </SignedOut>
    </div>
  );
};

export default Home;
