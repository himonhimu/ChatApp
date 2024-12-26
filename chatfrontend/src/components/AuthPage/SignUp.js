"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect } from "react";
import { useUser } from "../StateMange/MyContext";
import { setCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { getSession, signIn } from "next-auth/react";

export default function SignUp() {
  const router = useRouter();
  const { login } = useUser();
  async function onSignup(e) {
    e.preventDefault();
    const expirationDate = new Date();
    expirationDate.setTime(expirationDate.getTime() + 720 * 60 * 1000); //720 minutes = 12 hours
    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_LINK}/user/add-user`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, name, password }),
      }
    );
    const data = await response.json();
    setCookie("chat-user", JSON.stringify(data), {
      expires: expirationDate,
    });
    login(data);
    router.push("/");
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

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={onSignup}
        className="flex flex-col gap-3 bg-white p-6 rounded-md shadow-lg w-1/3"
      >
        <div className="flex items-center justify-center">
          <div className="relative w-20 aspect-square">
            <Image src={"/images/chat100.png"} fill alt="file placeholder" />
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <label className="flex-1">Full Name</label>
          <input
            name="name"
            required
            type="text"
            placeholder="Full Name"
            className="flex-[3] border border-gray-500 outline-none focus:border-green-500 rounded-md px-3 py-1"
          />
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
            Sign Up
          </button>
          <p>
            Already Have an Account?{" "}
            <Link href={"/login"} className="text-blue-500">
              Login
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
        </div>
      </form>
    </div>
  );
}
