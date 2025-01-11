import { cn } from "../../lib/utils";
import PropTypes from 'prop-types';

const Skeleton = ({
  className,
  ...props
}) => {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-200", className)}
      {...props}
    />
  );
};

Skeleton.propTypes = {
  className: PropTypes.string
};

export default Skeleton; 