import { useUser, UserButton } from "@clerk/clerk-react";
import { BadgeCheck, Mail, UserCircle2, Pencil, ArrowRightIcon } from "lucide-react";

const Profile = () => {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress || '';

  return (
    <div className="min-h-[70vh] bg-gradient-to-br from-purple-350 to-purple-500 flex flex-col rounded-md items-center justify-center px-4 ml-28 sm:px-8">
      <h2 className="text-3xl font-bold text-purple-600 flex items-center gap-2">
        <UserCircle2 className="w-7 h-7" />
        Your Profile
      </h2>

      <div className="mt-8 bg-white p-6 rounded-2xl shadow-xl w-full max-w-md border border-purple-100 hover:shadow-2xl transition-shadow">
        <div className="flex flex-col items-center space-y-4">
          <img
            src={user?.imageUrl}
            alt="User"
            className="w-24 h-24 rounded-full border-4 border-purple-300 shadow-md"
          />
          <div className="text-center flex flex-col">
            <p className="mt-1 inline-flex w-85 items-center justify-center gap-1 px-5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
              <BadgeCheck className="w-4 h-4" />
              Verified User
            </p>
            <p className="text-sm text-gray-500 flex items-center justify-center gap-1 mt-2">
              <Mail className="w-4 h-4" />
              {email}
            </p>
            

            <button
              className="inline-flex items-center gap-2 px-3 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition mt-4"
            >
              <Pencil className="w-4 h-4 px-5" />
              Update Profile / Logout
              <ArrowRightIcon />
              <UserButton/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
