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
  grid-column: ${({ quadrant = [] }: StyleProps) => quadrant[0]};
  grid-row: ${({ quadrant = [] }: StyleProps) => quadrant[1]};
  height: calc((100vh - 320px) / 2);
  align-content: center;
  justify-content: center;
  img.media-cover {
    border-radius: 6px;
    max-width: 180px;
    margin: 0 auto;
  }
`;

export const StyledIconWrapper = styled.div`
  & svg {
    font-size: 32px;
  }
  color: ${(props: StyleProps) => props.primary};
  position: absolute;
  text-align: center;
  ${({ quadrant = [] }: StyleProps): string => {
    const borderCommon = `1px solid #eee`;
    const quadStyleMap = {
      "1,1": `bottom: 0%; right 0%; border-bottom: ${borderCommon}; border-right: ${borderCommon}; padding: 0 60px 60px 0`,
      "1,2": `top: 0%; right: 0%; border-top: ${borderCommon}; border-right: ${borderCommon}; padding: 60px 60px 0 0`,
      "2,1": `bottom: 0%; left: 0%; border-bottom: ${borderCommon}; border-left: ${borderCommon}; padding: 0 0 60px 60px`,
      "2,2": `top: 0%; left: 0%; border-top: ${borderCommon}; border-left: ${borderCommon}; padding: 60px 0px 0px 60px`,
    };
    return quadStyleMap[quadrant.join()];
  }};
`;

export const StyledLoader = styled(LinearProgress)`
  margin: 0 auto;
  display: inline-block;
`;
export const StyledAsyncSelectWrapper = styled.div`
  width: 300px;
`;
export const StyledDescriptionContainer = styled.div`
  text-align: center;
  margin-top: 15px;
  & a {
    text-decoration: none;
    color: unset;
  }
`;

export const StyledActionIconsContainer = styled.div`
  display: grid;
  justify-content: center;
  > div {
    margin: 0 10px;
  }
`;

export const StlyedActionIcon = styled.div`
  grid-row: 1;
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
