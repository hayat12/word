"use client";

import { useSession } from "next-auth/react";
import Navbar from "./Navbar";

export default function NavbarWrapper() {
  const { data: session, status } = useSession();

  // Only render navbar when session is loaded and user is authenticated
  if (status === "loading") {
    return null; // or a loading spinner
  }

  if (!session) {
    return null;
  }

  return <Navbar />;
}
