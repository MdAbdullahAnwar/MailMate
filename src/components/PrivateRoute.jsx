import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";

const PrivateRoute = ({ children }) => {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
};

export default PrivateRoute;
