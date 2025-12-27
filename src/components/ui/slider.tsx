import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

interface SliderProps {
  className?: string;
  value?: number[];
  defaultValue?: number[];
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number[]) => void;
  disabled?: boolean;
}

const Slider = React.forwardRef<HTMLSpanElement, SliderProps>(
  ({ className, value, defaultValue, min, max, step, onValueChange, disabled }, ref) => (
    <SliderPrimitive.Root
      value={value}
      defaultValue={defaultValue}
      min={min}
      max={max}
      step={step}
      onValueChange={onValueChange}
      disabled={disabled}
      asChild
    >
      <span
        ref={ref}
        className={cn("relative flex w-full touch-none select-none items-center", className)}
      >
        <SliderPrimitive.Track asChild>
          <span className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
            <SliderPrimitive.Range asChild>
              <span className="absolute h-full bg-primary" />
            </SliderPrimitive.Range>
          </span>
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb asChild>
          <span className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
        </SliderPrimitive.Thumb>
      </span>
    </SliderPrimitive.Root>
  )
);
Slider.displayName = "Slider";

export { Slider };
