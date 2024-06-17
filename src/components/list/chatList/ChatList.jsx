import { useEffect, useState } from "react";
import AddUser from "./addUser/addUser";
import { useUserStore } from "../../../lib/userStore";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useChatStore } from "../../../lib/chatStore";
import { IoIosSearch, IoMdPersonAdd, IoIosClose } from "react-icons/io";

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const [input, setInput] = useState("");
  const [selectedChatId, setSelectedChatId] = useState(null);

  const { currentUser } = useUserStore();
  const { chatId, changeChat } = useChatStore();

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "userchats", currentUser.id), async (res) => {
      const items = res.data().chats;

      const promises = items.map(async (item) => {
        const userDocRef = doc(db, "users", item.receiverId);
        const userDocSnap = await getDoc(userDocRef);

        const user = userDocSnap.data();

        return { ...item, user };
      });

      const chatData = await Promise.all(promises);

      setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
    });

    return () => {
      unSub();
    };
  }, [currentUser.id]);

  const handleSelect = async (chat) => {
    const userChats = chats.map((item) => {
      const { user, ...rest } = item;
      return rest;
    });

    const chatIndex = userChats.findIndex((item) => item.chatId === chat.chatId);

    userChats[chatIndex].isSeen = true;

    const userChatsRef = doc(db, "userchats", currentUser.id);

    try {
      await updateDoc(userChatsRef, {
        chats: userChats,
      });
      changeChat(chat.chatId, chat.user);
      setSelectedChatId(chat.chatId); // Update selected chat ID
    } catch (err) {
      console.log(err);
    }
  };

  const filteredChats = chats.filter((c) =>
    c.user.username.toLowerCase().includes(input.toLowerCase())
  );

  return (
    <div className="flex flex-col justify-start overflow-y-scroll h-full w-[400px] gap-4">
      <div className="flex flex-row items-center px-4 gap-4">
        <div className="flex flex-grow bg-white/10 items-center rounded-lg gap-4 px-2">
          <IoIosSearch className="w-8 h-8"/>
          {/* <img className="w-6 h-6" src="./search.png" alt="" /> */}
          <input
            className="flex-grow bg-transparent py-2 border-none outline-none"
            type="text"
            placeholder="Search"
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        <div 
          className="bg-white/10 flex items-center h-9 w-9 rounded-md"
          onClick={() => setAddMode((prev) => !prev)}>
        {addMode ? (
            <IoIosClose className="text-white w-7 h-7 mx-auto" /> // Close icon when addMode is true
          ) : (
            <IoMdPersonAdd className="text-white w-5 h-5 mx-auto" /> // Add user icon when addMode is false
          )}
        </div>
      </div>
      <div>
        {filteredChats.map((chat) => (
          <div
            className={`flex items-center gap-4 p-4 cursor-pointer h-20 ${
              selectedChatId === chat.chatId ? "bg-white/10" : ""
            }`}
            key={chat.chatId}
            onClick={() => handleSelect(chat)}
          >
            <img
              className="w-12 h-12 rounded-full"
              src={
                chat.user.blocked.includes(currentUser.id)
                  ? "./avatar.png"
                  : chat.user.avatar || "./avatar.png"
              }
              alt=""
            />
            <div className="flex flex-col gap-1 text-ellipsis overflow-hidden">
              <span className="font-semibold">
                {chat.user.blocked.includes(currentUser.id)
                  ? "User"
                  : chat.user.username}
              </span>
              <p className="truncate font-light text-lg">{chat.lastMessage}</p>
            </div>
          </div>
        ))}
      </div>
      {addMode && <AddUser />}
    </div>
  );
};

export default ChatList;
