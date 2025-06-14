import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";

const Dashboard = () => (
  <div>
    <SignedIn>
      <h1>📊 Welcome to your Dashboard!</h1>
    </SignedIn>
    <SignedOut>
      <RedirectToSignIn />
    </SignedOut>
  </div>
);

export default Dashboard;