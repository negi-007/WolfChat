import ChatList from "./chatList/ChatList"
import Userinfo from "./userInfo/Userinfo"

const List = () => {
  return (
    <div className='flex flex-col'>
      <Userinfo/>
      <ChatList/>
    </div>
  )
}

export default List