import { forwardRef } from "react";
import { cn } from "../../lib/utils";
import { buttonVariants } from "../../lib/buttonVariants";
import PropTypes from "prop-types";

const Button = forwardRef(({ className, variant, size, ...props }, ref) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});

Button.displayName = "Button";

Button.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.string,
  size: PropTypes.string
};

export default Button; 