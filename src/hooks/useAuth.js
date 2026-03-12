'use client'

import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

const AuthContext = createContext(undefined);

export function AuthProvider({ children  }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer role fetching with setTimeout
        if (session?.user) {
          setTimeout(() => {
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          setRole(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId) => {
    console.log("fetchUserRole called for userId:", userId);
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      console.log("fetchUserRole response:", { data, error });

      if (error) {
        console.error("Error fetching user role:", error);
        // Set default role even on error so app doesn't hang
        setRole("employee");
      } else if (data) {
        console.log("Setting role to:", data.role);
        setRole(data.role);
      } else {
        console.log("No role found, defaulting to employee");
        // Default to employee if no role found
        setRole("employee");
      }
    } catch (error) {
      console.error("Exception in fetchUserRole:", error);
      // Set default role on exception
      setRole("employee");
    } finally {
      setLoading(false);
      console.log("fetchUserRole completed, loading set to false");
    }
  };

  const signIn = async (email, password) => {
    try {
      console.log("signIn called with email:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      console.log("Supabase signIn response:", { data, error });
      return { error: error || null };
    } catch (error) {
      console.error("signIn exception:", error);
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, role, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
