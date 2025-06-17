import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const EmailModal = ({ email, onClose }) => {
  if (!email) return null;

  return (
    <Dialog open={!!email} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-100 shadow-2xl rounded-2xl border border-gray-800">
        <DialogHeader className="pb-4 border-b border-gray-300">
          <DialogTitle className="text-xl font-bold text-blue-800">
            {email.subject || "No Subject"}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 mt-1">
            From:{" "}
            <span className="font-medium text-gray-800">{email.from}</span> —{" "}
            <span className="italic">
              {new Date(email.timestamp).toLocaleString()}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="py-5 px-1 border-b border-gray-300 text-gray-800 leading-relaxed text-[15px]">
          <div
            className="prose max-w-none prose-blue"
            dangerouslySetInnerHTML={{
              __html: email.content || "No message content.",
            }}
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-white hover:bg-gray-100 text-blue-600 border border-blue-300"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmailModal;
