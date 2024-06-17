import { useState } from "react";
import "./login.css";
import { toast } from "react-toastify";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import upload from "../../lib/upload";

const Login = () => {
  const [avatar, setAvatar] = useState({
    file: null,
    url: "",
  });

  const [loading, setLoading] = useState(false);

  const handleAvatar = (e) => {
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);

    const { username, email, password } = Object.fromEntries(formData);
    console.log(username);
    // VALIDATE INPUTS
    if (!username || !email || !password)
      if (!avatar.file)
        // return toast.warn("Please enter inputs!");
        return toast.warn("Please upload an avatar!");

    // // VALIDATE UNIQUE USERNAME
    // const usersRef = collection(db, "users");
    // const q = query(usersRef, where("username", "==", username));
    // const querySnapshot = await getDocs(q);
    // if (!querySnapshot.empty) {
    //   return toast.warn("Select another username");
    // }

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);

      const imgUrl = await upload(avatar.file);

      await setDoc(doc(db, "users", res.user.uid), {
        username,
        email,
        avatar: imgUrl,
        id: res.user.uid,
        blocked: [],
      });

      await setDoc(doc(db, "userchats", res.user.uid), {
        chats: [],
      });

      toast.success("Account created! You can login now!");
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const { email, password } = Object.fromEntries(formData);

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-start items-center w-full p-4 gap-4">
      <div className="flex flex-col justify-start items-center p-4 bg-white/10 rounded-lg gap-4">
        <img className="h-24 w-24 rounded-full" src="logo.png" alt="" />
        <h1 className="text-4xl font-semibold text-white">WolfChat</h1>
      </div>
      <div className="flex flex-row justify-between gap-4 w-[60%]">
        <div className="flex flex-col justify-start gap-4 items-center border border-transparent">
          <h2 className="text-3xl">Login</h2>
          <form onSubmit={handleLogin} className="flex flex-col justify-between gap-4 p-4">
            <input className="p-4 rounded-lg bg-white/10 border-none outline-none" type="text" placeholder="Email" name="email" />
            <input className="p-4 rounded-lg bg-white/10 border-none outline-none" type="password" placeholder="Password" name="password" />
            <button className="bg-blue-500 p-4 rounded-lg disabled:bg-blue-500/60" disabled={loading}>
              {loading ? "Loading" : "Sign In"}
            </button>
          </form>
        </div>
        {/* <div className="bg-white/10 w-1"></div> */}
        <div className="flex flex-col justify-start gap-4 items-center">
          <h2 className="text-3xl">Register</h2>
          <form className="flex flex-col justify-between gap-4 p-4" onSubmit={handleRegister}>
            <label htmlFor="file" className="flex flex-row justify-start items-center bg-white/10 rounded-lg overflow-hidden gap-4">
              <img className="h-14 w-14" src={avatar.url || "./avatar.png"} alt="" />
              Upload an Image
            </label>
            <input
             className="p-4 rounded-lg bg-white/10"
              type="file"
              id="file"
              style={{ display: "none" }}
              onChange={handleAvatar}
            />
            <input className="p-4 rounded-lg bg-white/10 border-none outline-none" type="text" placeholder="Username" name="username" />
            <input className="p-4 rounded-lg bg-white/10 border-none outline-none" type="text" placeholder="Email" name="email" />
            <input className="p-4 rounded-lg bg-white/10 border-none outline-none" type="password" placeholder="Password" name="password" />
            <button className="bg-blue-500 p-4 rounded-lg disabled:bg-blue-500/60" disabled={loading}>
              {loading ? "Loading" : "Sign Up"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
