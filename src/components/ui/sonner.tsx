import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      expand={true}
      visibleToasts={6}
      closeButton={true}
      gap={12}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
        style: {
          borderRadius: "16px",
          padding: "14px 16px",
          boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(36, 22, 33, 0.08)",
          backdropFilter: "blur(12px)",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
