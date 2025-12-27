"use client";

import { useSession } from "next-auth/react";
import Footer from "./Footer";

export default function FooterWrapper() {
  const { data: session, status } = useSession();

  // Only render footer when session is loaded and user is authenticated
  if (status === "loading") {
    return null; // or a loading spinner
  }

  if (!session) {
    return null;
  }

  return <Footer />;
}
