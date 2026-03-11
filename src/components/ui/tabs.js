import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef(
  ({ className, ...props }, ref) => (
    <TabsPrimitive.List asChild>
      <div
        ref={ref}
        className={cn(
          "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
          className
        )}
        {...props}
      />
    </TabsPrimitive.List>
  )
);
TabsList.displayName = "TabsList";

const TabsTrigger = React.forwardRef(
  ({ className, value, ...props }, ref) => (<TabsPrimitive.Trigger value={value} asChild>
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all data-[state=active]")}
        {...props}
      />
    </TabsPrimitive.Trigger>
  )
);
TabsTrigger.displayName = "TabsTrigger";

const TabsContent = React.forwardRef(
  ({ className, value, ...props }, ref) => (<TabsPrimitive.Content value={value} asChild>
      <div
        ref={ref}
        className={cn(
          "mt-2 ring-offset-background focus-visible")}
        {...props}
      />
    </TabsPrimitive.Content>
  )
);
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
