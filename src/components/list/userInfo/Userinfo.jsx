import { useUserStore } from "../../../lib/userStore";
import { auth } from "../../../lib/firebase";

const Userinfo = () => {

  const { currentUser } = useUserStore();

  const handleLogout = () => {
    auth.signOut();
    resetChat()
  };

  return (
    <div className='flex items-center p-4 justify-between w-full'>
      <div className="flex flex-row items-center gap-6">
        <img className="w-16 h-16 rounded-full" src={currentUser.avatar || "./avatar.png"} alt="" />
        <h2 className="text-xl">{currentUser.username}</h2>
      </div>
      <div className="flex gap-4">
        <button className="bg-blue-500/60 hover:bg-blue-500 px-4 py-2 rounded-lg" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  )
}

export default Userinfo