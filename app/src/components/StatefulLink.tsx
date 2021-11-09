import React from 'react';
import * as H from 'history';
import { Link, LinkProps } from 'react-router-dom';

export interface StatefulLinkProps
  extends LinkProps<H.LocationState>,
    React.RefAttributes<HTMLAnchorElement> {
  to: string;
}

/**
 * Renders like a normal React Router Link, but keeps the current location.search
 */
export const StatefulLink = (props: StatefulLinkProps) => (
  <Link
    {...props}
    to={(currentLocation) => ({
      pathname: props.to,
      search: currentLocation.search,
    })}
  >
    {props.children}
  </Link>
);
