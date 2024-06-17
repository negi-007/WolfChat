import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { useChatStore } from "../../lib/chatStore";
import { db } from "../../lib/firebase";
import { useUserStore } from "../../lib/userStore";

const Detail = () => {
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock, resetChat } =
    useChatStore();
  const { currentUser } = useUserStore();

  const handleBlock = async () => {
    if (!user) return;

    const userDocRef = doc(db, "users", currentUser.id);

    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });
      changeBlock();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="flex flex-col justify-between p-4 gap-4 min-w-[20%]">
      <div className="flex flex-col items-center bg-white/10 p-4 rounded-lg">
        <img className="h-28 w-28 rounded-full" src={user?.avatar || "./avatar.png"} alt="" />
        <h2 className="text-2xl">{user?.username}</h2>
        <p>{user?.email}</p>
      </div>
      <div className="flex flex-col items-center justify-between gap-2">
        <button 
          className="w-full bg-red-500/60 hover:bg-red-500 rounded-md p-2" onClick={handleBlock}>
            {isCurrentUserBlocked
              ? "You are Blocked!"
              : isReceiverBlocked
              ? "User blocked"
              : `Block ${user?.username}`}
        </button>
      </div>
    </div>
  );
};

export default Detail;
