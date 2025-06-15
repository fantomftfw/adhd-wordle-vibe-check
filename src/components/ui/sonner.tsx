import { useTheme } from "next-themes"
import { Toaster as Sonner, toast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

import { useEffect, useState } from "react";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();
  const [dynamicOffset, setDynamicOffset] = useState<number>(120);

  // Re-calculate offset whenever the waitlist bar size might change
  useEffect(() => {
    const compute = () => {
      const bar = document.getElementById("waitlist-bar");
      if (bar) {
        const h = bar.getBoundingClientRect().height;
        setDynamicOffset(h + 8);
      }
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  return (
    <Sonner
      /* Raise the toaster so it sits above the mobile waitlist banner */
      offset={dynamicOffset}
      theme={theme as ToasterProps["theme"]}
      className="toaster group z-70"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
