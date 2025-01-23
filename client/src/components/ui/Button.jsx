import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import PropTypes from "prop-types";
import { cn } from "../../lib/utils";

const Button = React.forwardRef(({ className, variant = "primary", size = "default", asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        // Variants
        {
          // Primary variant
          "bg-[#FF6B6B] text-white shadow hover:bg-[#FF6B6B]/90 focus-visible:ring-[#FF6B6B]": variant === "primary",
          // Secondary variant
          "bg-white text-gray-900 border-2 border-gray-200 shadow-sm hover:bg-gray-100 hover:border-gray-300 focus-visible:ring-gray-300": variant === "secondary",
          // Ghost variant
          "hover:bg-gray-100 hover:text-gray-900": variant === "ghost",
          // Outline variant
          "border border-gray-200 bg-white shadow-sm hover:bg-gray-100": variant === "outline",
          // Destructive variant
          "bg-red-500 text-white shadow hover:bg-red-600 focus-visible:ring-red-500": variant === "destructive",
        },
        // Sizes
        {
          "h-10 px-4 py-2": size === "default",
          "h-9 px-3": size === "sm",
          "h-11 px-8": size === "lg",
          "h-9 w-9 p-0": size === "icon",
        },
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Button.displayName = "Button";

Button.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(["primary", "secondary", "ghost", "outline", "destructive"]),
  size: PropTypes.oneOf(["default", "sm", "lg", "icon"]),
  asChild: PropTypes.bool,
};

export { Button };
export default Button; 