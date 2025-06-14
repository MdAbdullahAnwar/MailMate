import { SignedIn, SignedOut, RedirectToSignIn, useUser } from "@clerk/clerk-react";

const Profile = () => {
  const { user } = useUser();

  return (
    <div>
      <SignedIn>
        <div>
          <h2>👤 Profile Page</h2>
          <p>Hello, User!</p>
          <p>Email: {user?.primaryEmailAddress?.emailAddress}</p>
        </div>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </div>
  );
};

export default Profile;