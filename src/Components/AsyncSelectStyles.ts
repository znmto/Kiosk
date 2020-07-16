import styled from "styled-components";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
import { LinearProgress, Typography } from "@material-ui/core";

type StyleProps = {
  // x,y location of section in view
  quadrant?: number[];
  primary?: string;
  danger?: string;
  colors?: string;
};

export const StyledArrowDownwardIcon = styled(ArrowDownwardIcon)`
  font-size: 72px !important;
  color: ${({ primary = "" }: StyleProps) => primary};
`;

export const StyledMediaSelectorWrapper = styled.div`
  display: grid;
  /* grid-column: ${({ quadrant = [] }: StyleProps) => quadrant[0]};
  grid-row: ${({ quadrant = [] }: StyleProps) => quadrant[1]}; */
  grid-template-columns: 1fr 70% 1fr;
  grid-template-rows: repeat(5, 1fr);
  /* grid-template-rows: 7% 1fr 1fr 1fr 7%; */
  height: calc((100vh - 320px) / 2);
  align-content: center;
  justify-content: center;
  img.media-cover {
    grid-column: 2;
    grid-row: 3;
    border-radius: 6px;
    height: 250px;
    margin: 0 auto;
  }
`;

export const StyledIconWrapper = styled.div`
  & svg {
    font-size: 32px;
  }
  color: ${(props: StyleProps) => props.primary};
  display: grid;
  /* padding: 30px; */
  ${({ quadrant = [] }: StyleProps): string => {
    const borderCommon = `1px solid #eee`;
    const quadStyleMap = {
      "1,1": `align-items: center; justify-content: center; grid-row: 5; grid-column: 3; border-bottom: ${borderCommon}; border-right: ${borderCommon};`,
      "1,2": `align-items: center; justify-content: center; grid-row: 1; grid-column: 3; border-top: ${borderCommon}; border-right: ${borderCommon};`,
      "2,1": `align-items: center; justify-content: center; grid-row: 5; grid-column: 1; border-bottom: ${borderCommon}; border-left: ${borderCommon}; `,
      "2,2": `align-items: center; justify-content: center; grid-row: 1; grid-column: 1; border-top: ${borderCommon}; border-left: ${borderCommon}; `,
    };
    return quadStyleMap[quadrant.join()];
  }};
  /* ${({ quadrant = [] }: StyleProps): string => {
    const borderCommon = `1px solid #eee`;
    const quadStyleMap = {
      "1,1": `justify-self: end;
        align-self: end; border-bottom: ${borderCommon}; border-right: ${borderCommon}; padding: 120px 40px 40px 120px`,
      "1,2": `justify-self: end;
        align-self: start; border-top: ${borderCommon}; border-right: ${borderCommon}; padding: 40px 40px 120px 120px`,
      "2,1": `justify-self: start;
        align-self: end; border-bottom: ${borderCommon}; border-left: ${borderCommon}; padding: 120px 120px 40px 40px`,
      "2,2": `justify-self: start;
        align-self: start; border-top: ${borderCommon}; border-left: ${borderCommon}; padding: 40px 120px 120px 40px`,
    };
    return quadStyleMap[quadrant.join()];
  }}; */
`;

export const StyledLoader = styled(LinearProgress)`
  margin: 0 auto;
  display: inline-block;
`;
export const StyledAsyncSelectWrapper = styled.div`
  width: 300px;
  grid-column: 2;
  grid-row: 4;
  justify-self: center;
`;
export const StyledDescriptionContainer = styled.div`
  text-align: center;
  margin-top: 15px;
  grid-column: 2;
  grid-row: 4;
  & a {
    text-decoration: none;
    color: unset;
  }
`;

export const StyledActionIconsContainer = styled.div`
  display: grid;
  grid-column: 2;
  grid-row: 2;
  justify-content: center;
  align-self: end;
  height: 50px;
  > div {
    margin: 0 10px;
  }
`;

export const StlyedActionIcon = styled.div`
  grid-row: 2;
  margin: 0 auto;
  cursor: pointer;
  svg {
    font-size: 28px;
  }
`;

export const StyledTrashIconContainer = styled(StlyedActionIcon)`
  color: ${({ danger = "" }: StyleProps) => danger};
`;

export const StyledExternalLinkIconContainer = styled(StlyedActionIcon)`
  & > a {
    color: ${({ primary = "" }: StyleProps) => primary};
  }
`;

export const StyledSubtitle = styled(Typography)`
  margin-left: 10px !important;
`;

export const StyledRatingSourceIconWrapper = styled.div`
  display: inline-block;
  margin-left: 15px;
  img {
    width: 50px;
  }
`;
