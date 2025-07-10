import { useUser } from '@clerk/clerk-react';
import { Mailbox, Send, Star, Trash2, Pencil } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;

  return (
    <div className="min-h-[70vh]  bg-gradient-to-br from-yellow-350 to-yellow-500 rounded-md flex flex-col items-center justify-center px-4 ml-28 sm:px-8">
      <div className="bg-white/70 backdrop-blur-md shadow-lg rounded-xl p-8 w-full max-w-xl text-center space-y-6">
        <h1 className="text-4xl font-extrabold text-green-600">Welcome to MailMate 📮</h1>
        <p className="text-gray-700 text-lg">
          {email ? `You're signed in as ${email}` : "You're signed in!"}
        </p>
        <p className="text-sm text-gray-600 italic">Stay organized. Communicate better.</p>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <Link to="/compose">
            <button className="flex items-center justify-center gap-2 cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition w-full">
              <Pencil size={18} />
              Compose
            </button>
          </Link>
          <Link to="/inbox">
            <button className="flex items-center justify-center gap-2 cursor-pointer bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition w-full">
              <Mailbox size={18} />
              Inbox
            </button>
          </Link>
          <Link to="/starred">
            <button className="flex items-center justify-center gap-2 cursor-pointer bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition w-full">
              <Star size={18} />
              Starred
            </button>
          </Link>
          <Link to="/sent">
            <button className="flex items-center justify-center gap-2 cursor-pointer bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition w-full">
              <Send size={18} />
              Sent
            </button>
          </Link>
          <Link to="/trash" className="col-span-2">
            <button className="flex items-center justify-center gap-2 cursor-pointer bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition w-full">
              <Trash2 size={18} />
              Trash
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
