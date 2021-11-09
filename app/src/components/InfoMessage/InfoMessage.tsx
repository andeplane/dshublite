import React, { ReactChild } from 'react';
import styled from 'styled-components/macro';
import { Title, Graphic } from '@cognite/cogs.js';

const types: string[] = ['error'];

export const InfoMessage = ({
  type,
  title,
  size = 150,
  children,
}: {
  type: string;
  title?: string;
  size?: number;
  children?: ReactChild;
}) => (
  <StyledContainer>
    {!types.includes(type.toLocaleLowerCase()) ? (
      <StyledGraphic>
        <Graphic type={type} style={{ width: size }} />
      </StyledGraphic>
    ) : (
      <StyledIcon type={type} size={size} />
    )}
    {title && <StyledTitle level={5}>{title}</StyledTitle>}
    <StyledContent>{children}</StyledContent>
  </StyledContainer>
);

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const StyledGraphic = styled.div`
  margin: 1rem 0;
`;

const StyledTitle = styled(Title)`
  margin: 0.5rem 0;
`;

const StyledContent = styled.div`
  text-align: center;
`;

interface IStyledIconType {
  type: string;
  size: number;
}

const StyledIcon = styled.div<IStyledIconType>`
  display: inline-block;
  width: ${(props: IStyledIconType) => `${props.size}px`};
  height: ${(props: IStyledIconType) => `${props.size}px`};
  background: ${(props: IStyledIconType) =>
    `transparent url('/images/graphics/${props.type.toLocaleLowerCase()}.svg') center center no-repeat`};
  background-size: cover;
`;
