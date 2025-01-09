import React from 'react';
import PropTypes from 'prop-types';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from '../../lib/utils';

const Label = React.forwardRef(
  ({ className, error, ...props }, ref) => (
    <LabelPrimitive.Root
      ref={ref}
      className={cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        error && 'text-red-500',
        className
      )}
      {...props}
    />
  )
);

Label.propTypes = {
  className: PropTypes.string,
  error: PropTypes.bool,
};

Label.displayName = 'Label';

export { Label }; 