import styled from "styled-components";
import Typography from "@material-ui/core/Typography";

type StyleProps = {
  secondary?: string;
  primary?: string;
};

export const StyledAccountButtonWrapper = styled.div`
  position: relative;
  right: 40px;
  grid-row: 2;
  grid-column: 3;
  & button {
    padding: 15px;
    color: ${(props: StyleProps) => props.secondary};
  }
  justify-self: end;
`;
export const StyledLogoutButtonWrapper = styled.div`
  position: relative;
  grid-row: 2;
  grid-column: 3;
  justify-self: end;
  align-self: center;
  & button {
    padding: 15px;
    color: ${(props: StyleProps) => props.secondary};
  }
`;
export const StyledLoggedInUserHeader = styled(Typography)`
  position: relative;
  right: 10px;
  grid-row: 3;
  grid-column: 3;
  justify-self: end;
  margin: 0;
  color: ${(props: StyleProps) => props.primary};
`;
export const StyledTopNavigation = styled.div`
  width: 100%;
  position: fixed;
  top: 0;
  border-bottom: 1px solid ${(props: StyleProps) => props.secondary};
  z-index: 2;
  display: grid;
  justify-items: center;
  height: 100px;
  background-color: #fff;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
  input {
    display: "none";
  }
  .logoWrapper {
    justify-self: start;
    align-self: center;
    margin-left: 15px;
    position: absolute;
    cursor: pointer;
    & img {
      width: 80px;
    }
  }
`;

export const StyledTitle = styled(Typography)`
  grid-column: 2;
  grid-row: 2;
  margin: 0;
  color: #325247;
  font-family: "Hind Vadodara", sans-serif !important;
  cursor: pointer;
`;
