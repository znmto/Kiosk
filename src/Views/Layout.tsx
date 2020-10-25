import React from "react";
import BottomNavigation from "../Components/BottomNavigation";
import TopNavigation from "../Components/TopNavigation";
import styled from "styled-components";
import { createMuiTheme, ThemeProvider, Theme } from "@material-ui/core/styles";

const StyledLayoutWrapper = styled.div`
  margin-top: 130px;
`;

// https://paletton.com/#uid=3360u0kcvfm7JpEaLkAhQcem+9S
const theme: Theme = createMuiTheme({
  palette: {
    primary: {
      main: "#325247",
    },
    secondary: {
      main: "#677685",
    },
    error: {
      main: "#966370",
    },
    success: {
      main: "#69f0ae",
    },
  },
  typography: {
    fontFamily: "'Roboto', sans-serif",
  },
});

const Layout: React.FC = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <TopNavigation />
      <StyledLayoutWrapper>
        <div>{children}</div>
      </StyledLayoutWrapper>
      <BottomNavigation />
    </ThemeProvider>
  );
};

export default Layout;
