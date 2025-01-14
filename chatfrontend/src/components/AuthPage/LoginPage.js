"use client";
import { setCookie } from "cookies-next";
import { getSession, signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useUser } from "../StateMange/MyContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useUser();
  async function onLoginClick(e) {
    e.preventDefault();
    const expirationDate = new Date();
    expirationDate.setTime(expirationDate.getTime() + 720 * 60 * 1000); //720 minutes = 12 hours
    const email = e.target.email.value;
    const password = e.target.password.value;
    if (email && password) {
      const datares = await fetch(
        `${process.env.NEXT_PUBLIC_API_LINK}/user/sign-in?email=${email}&password=${password}`
      );
      const data = await datares.json();
      if (datares.status === 404) {
        toast.error(data.message);
        return;
      }

      setCookie("chat-user", JSON.stringify(data), {
        expires: expirationDate,
      });
      login(data);
      router.push("/");
    } else {
      console.log("Email AND Password is Required!");
    }

    // user/sign-in?email=676a9389c732e763a0e27207
  }

  useEffect(() => {
    const fetchSession = async () => {
      const session = await getSession();
      if (session) {
        const expirationDate = new Date();
        expirationDate.setTime(expirationDate.getTime() + 720 * 60 * 1000); //720 minutes = 12 hours
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_LINK}/user/add-user`,
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: session.email,
              name: session.name,
              password: "123456",
            }),
          }
        );
        const data = await response.json();
        setCookie("chat-user", JSON.stringify(data), {
          expires: expirationDate,
        });
        login(data);
        router.push("/");
      } else {
        console.log("No session found");
      }
    };

    fetchSession();
  }, []);

  // async function onCheckClick() {
  //   const session = await getSession();
  //   console.log(session); // Logs the session data if available
  // }

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={onLoginClick}
        className="flex flex-col gap-3 bg-white p-6 rounded-md shadow-lg w-1/3"
      >
        <div className="flex items-center justify-center">
          <div className="relative w-20 aspect-square">
            <Image src="/images/chat100.png" fill alt="file placeholder" />
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <label className="flex-1">Email</label>
          <input
            name="email"
            required
            type="text"
            placeholder="Email"
            className="flex-[3] border border-gray-500 outline-none focus:border-green-500 rounded-md px-3 py-1"
          />
        </div>
        <div className="flex gap-2 items-center">
          <label className="flex-1">Password</label>
          <input
            name="password"
            required
            type="password"
            placeholder="Password"
            className="flex-[3] border border-gray-500 outline-none focus:border-green-500 rounded-md px-3 py-1"
          />
        </div>
        <div className="flex flex-col gap-2 items-center">
          <button className="py-2 px-6 bg-green-600 text-white rounded-md">
            Login
          </button>
          <p>
            Already Have an Account?{" "}
            <Link href={"/sign-up"} className="text-blue-500">
              Sign Up
            </Link>
          </p>
          <button
            type="button"
            onClick={() => signIn("google")}
            className="flex items-center gap-3 border border-green-500 p-2 rounded-lg"
          >
            <div className="relative w-8 aspect-square ">
              <Image src="/images/google.png" fill alt="file placeholder" />
            </div>
            Sign in with goolge
          </button>
          {/* <button type="button" onClick={onCheckClick}>
            Check
          </button> */}

          <p>
            <Link href={"/vedio"} className="text-blue-500">
              Video
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
