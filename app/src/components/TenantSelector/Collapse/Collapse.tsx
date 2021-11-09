import React, { ReactNode, useEffect, useState } from 'react';
import { Icon } from '@cognite/cogs.js';
import styled from 'styled-components/macro';

interface Props {
  title: string;
  children: ReactNode;
  open?: boolean;
}

const Collapse = ({ title, children, open }: Props) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  return (
    <div>
      <TitleWrapper onClick={() => setIsOpen(!isOpen)}>
        <TitleIcon $visible={isOpen} type="ChevronRightCompact" />
        <TitleText>{title}</TitleText>
      </TitleWrapper>
      <Content $visible={isOpen}>{children}</Content>
    </div>
  );
};

const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

interface VisibleProp {
  $visible: boolean;
}

const TitleIcon = styled(Icon)<VisibleProp>`
  transform: rotate(${(props) => (props.$visible ? '90deg' : '0deg')});
`;

const TitleText = styled.div`
  margin-left: 10px;
  font-weight: bold;
  font-size: 13px;
  line-height: 20px;
  color: var(--cogs-greyscale-grey9);
`;

const Content = styled.div<VisibleProp>`
  margin-top: ${(props) => (props.$visible ? '20px' : '0')};
  height: ${(props) => (props.$visible ? 'auto' : '0')};
  overflow: hidden;
`;

export default Collapse;
