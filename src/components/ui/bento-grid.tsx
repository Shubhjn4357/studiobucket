import { cn } from "@/lib/utils";

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "mx-auto grid max-w-7xl grid-cols-1 gap-4 md:auto-rows-[18rem] md:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "group/bento shadow-sm flex flex-col justify-between space-y-3 rounded-md border border-border bg-surface p-4 transition-all duration-300 hover:border-primary/30",
        className,
      )}
    >
      <div className="relative overflow-hidden rounded-sm">
        <div className="absolute inset-0 industrial-grid opacity-10 pointer-events-none" />
        {header}
      </div>
      <div className="relative z-10 transition-all duration-300">
        <div className="flex items-center gap-2 mb-2">
           <div className="h-6 w-6 rounded-sm bg-background border border-border flex items-center justify-center text-primary">
              {icon}
           </div>
           <div className="font-black text-[11px] uppercase tracking-widest text-foreground italic">
             {title}
           </div>
        </div>
        <div className="text-[10px] font-bold text-muted-foreground uppercase leading-relaxed tracking-tight opacity-70">
          {description}
        </div>
      </div>
    </div>
  );
};
