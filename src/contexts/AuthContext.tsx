import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

type SubscriptionInfo = {
  subscribed: boolean;
  productId: string | null;
  subscriptionEnd: string | null;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  subscription: SubscriptionInfo;
  isPro: boolean;
  signOut: () => Promise<void>;
  checkSubscription: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  subscription: { subscribed: false, productId: null, subscriptionEnd: null },
  isPro: false,
  signOut: async () => {},
  checkSubscription: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const PRO_PRICE_ID = "price_1T8lPNCuHCGYa6hHY4DStBvD";
export const PRO_PRODUCT_ID = "prod_U6zO0FTtxocsf6";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionInfo>({
    subscribed: false,
    productId: null,
    subscriptionEnd: null,
  });

  const checkSubscription = useCallback(async () => {
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession) {
        setSubscription({ subscribed: false, productId: null, subscriptionEnd: null });
        return;
      }
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) {
        console.error("Error checking subscription:", error);
        return;
      }
      setSubscription({
        subscribed: data.subscribed ?? false,
        productId: data.product_id ?? null,
        subscriptionEnd: data.subscription_end ?? null,
      });
    } catch (e) {
      console.error("Subscription check failed:", e);
    }
  }, []);

  useEffect(() => {
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        if (session?.user) {
          setTimeout(() => checkSubscription(), 0);
        } else {
          setSubscription({ subscribed: false, productId: null, subscriptionEnd: null });
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        checkSubscription();
      }
    });

    // Auto-refresh subscription every 60s
    const interval = setInterval(() => {
      checkSubscription();
    }, 60000);

    return () => {
      authSub.unsubscribe();
      clearInterval(interval);
    };
  }, [checkSubscription]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSubscription({ subscribed: false, productId: null, subscriptionEnd: null });
  };

  const isPro = subscription.subscribed && subscription.productId === PRO_PRODUCT_ID;

  return (
    <AuthContext.Provider value={{ user, session, loading, subscription, isPro, signOut, checkSubscription }}>
      {children}
    </AuthContext.Provider>
  );
};
