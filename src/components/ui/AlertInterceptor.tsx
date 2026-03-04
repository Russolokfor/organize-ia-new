"use client";

import { useEffect } from "react";
import { useToast } from "@/components/ui/ToastProvider";

export default function AlertInterceptor() {
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const originalAlert = window.alert;

    // Troca o alert nativo por toast premium
    window.alert = (message?: any) => {
      const text =
        typeof message === "string"
          ? message
          : message?.message
          ? String(message.message)
          : String(message ?? "");

      toast({
        title: "Aviso",
        description: text,
        variant: "warning",
        duration: 3500,
      });
    };

    return () => {
      // Volta ao normal se o componente desmontar
      window.alert = originalAlert;
    };
  }, [toast]);

  return null;
}