import { useUser } from "@clerk/clerk-react";

const Profile = () => {
  const { user } = useUser();

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-purple-600">👤 Profile Page</h2>
      <div className="mt-6 bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
        <p className="text-lg">Hello, {user?.firstName || 'User'}!</p>
        <p className="mt-2">Email: {user?.primaryEmailAddress?.emailAddress}</p>
      </div>
    </div>
  );
};

export default Profile;
