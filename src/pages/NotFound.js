'use client'

import { usePathname } from 'next/navigation';
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const pathname = usePathname();

  useEffect(() => {
    console.error("404 Error: Page not found", pathname);
  }, [pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <p className="mb-6 text-muted-foreground">The page you're looking for doesn't exist.</p>
        <Button onClick={() => window.location.href = "/"}>
          Go Back Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
