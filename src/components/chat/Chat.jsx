import { useEffect, useRef, useState } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import upload from "../../lib/upload";
// import { format } from "timeago.js";

import { IoIosVideocam, IoMdInformation, IoMdImage    } from "react-icons/io";

const Chat = () => {
  const [chat, setChat] = useState();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [img, setImg] = useState({
    file: null,
    url: "",
  });

  const { currentUser } = useUserStore();
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } =
    useChatStore();

  const endRef = useRef(null);

  // useEffect(() => {
  //   endRef.current?.scrollIntoView({ behavior: "smooth" });
  // }, [chat.messages]);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data());
    });

    return () => {
      unSub();
    };
  }, [chatId]);

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  const handleImg = (e) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleSend = async () => {
    if (text === "") return;

    let imgUrl = null;

    try {
      if (img.file) {
        imgUrl = await upload(img.file);
      }

      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
          ...(imgUrl && { img: imgUrl }),
        }),
      });

      const userIDs = [currentUser.id, user.id];

      userIDs.forEach(async (id) => {
        const userChatsRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();

          const chatIndex = userChatsData.chats.findIndex(
            (c) => c.chatId === chatId
          );

          userChatsData.chats[chatIndex].lastMessage = text;
          userChatsData.chats[chatIndex].isSeen =
            id === currentUser.id ? true : false;
          userChatsData.chats[chatIndex].updatedAt = Date.now();

          await updateDoc(userChatsRef, {
            chats: userChatsData.chats,
          });
        }
      });
    } catch (err) {
      console.log(err);
    } finally {
      setImg({
        file: null,
        url: "",
      });

      setText("");
    }
  };

  return (
    <div className="chat flex flex-col flex-grow flex-shrink">
      <div className="flex items-center justify-between p-4 border border-transparent border-b-white/10">
        <div className="flex items-center gap-4">
          <img
            className="w-16 h-16 rounded-full"
            src={user?.avatar || "./avatar.png"}
            alt=""
          />
          <div className="texts flex flex-col gap-1">
            <span className="text-xl font-bold">{user?.username}</span>
            <p className="font-extralight text-white/70">{user?.email}</p>
          </div>
        </div>
        <div className="flex gap-4">
          <IoIosVideocam className="w-8 h-8 bg-white/10 rounded-md p-1"/>
          <IoMdInformation className="w-8 h-8 bg-white/10 rounded-md"/>
        </div>
      </div>
      <div className="center flex flex-col overflow-y-scroll p-4 gap-4 flex-grow">
        {chat?.messages?.map((message) => (
          <div
            key={message?.createAt}
            className={
              message.senderId === currentUser?.id ? "message own" : "message"
            }
          >
            <div
              className={
                message.senderId === currentUser?.id
                  ? "texts bg-blue-500 p-1 rounded-xl"
                  : "texts bg-white/10 rounded-xl"
              }
            >
              {message.img && <img src={message.img} alt="" />}
              <p>{message.text}</p>
              {/* <span>{format(message.createdAt.toDate())}</span> */}
            </div>
          </div>
        ))}
        {img.url && (
          <div className="message own">
            <div className="texts">
              <img src={img.url} alt="" />
            </div>
          </div>
        )}
        {/* <div ref={endRef}></div> */}
      </div>
      <div className="bottom flex items-center justify-between border-2 border-transparent border-t-white/10 p-4 gap-4 mt-auto">
        <div className="flex gap-4">
          <label 
            htmlFor="file">
          <IoMdImage className="h-10 w-10 p-1 bg-white/10 rounded-md"/> 
          </label>
          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleImg}
          />
        </div>
        <div className="flex flex-row flex-grow items-center gap-4 pr-4 bg-white/10 rounded-lg disabled:cursor-not-allowed">
          <input
            className="flex-grow bg-transparent text-md p-4 text-white border-none outline-none disabled:cursor-not-allowed"
            type="text"
            placeholder={
              isCurrentUserBlocked || isReceiverBlocked
                ? "You cannot send a message"
                : "Type a message..."
            }
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isCurrentUserBlocked || isReceiverBlocked}
          />
          <div className="relative">
            <img
              className="w-5 h-5 cursor-pointer"
              src="./emoji.png"
              alt=""
              onClick={() => setOpen((prev) => !prev)}
            />
            <div className="absolute bottom-[50px] left-0">
              <EmojiPicker open={open} onEmojiClick={handleEmoji} />
            </div>
          </div>
        </div>
        <button
          className="bg-blue-500 text-white px-6 py-3 rounded-lg disabled:bg-blue-500/60 disabled:cursor-not-allowed"
          onClick={handleSend}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
