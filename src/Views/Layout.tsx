import React from 'react';
import BottomNavigation from '../Components/BottomNavigation';
import TopNavigation from '../Components/TopNavigation';
import styled from 'styled-components';
import {
  createMuiTheme,
  Theme as AugmentedTheme,
  ThemeProvider,
} from '@material-ui/core/styles';

import purple from '@material-ui/core/colors/purple';
import green from '@material-ui/core/colors/green';



const StyledLayoutWrapper = styled.div`
    margin-top: 100px;
    margin-bottom: 55px;
`;

const StyledRootWrapper = styled.div`
  overflow-y: scroll;
`;


// https://paletton.com/#uid=3360u0kcvfm7JpEaLkAhQcem+9S
const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#325247'
    },
    secondary: {
       main: '#677685'
  },
  error: {
    main: '#966370',
  },
  },
  typography: {
    fontFamily: "'Roboto', sans-serif",
  }
} as any);
const Layout: React.FC = ({ children }) => {

  return (
    <ThemeProvider theme={theme}>
      <StyledRootWrapper>
        <TopNavigation />
        <StyledLayoutWrapper>
              <div>{children}</div>
          </StyledLayoutWrapper>
        <BottomNavigation />
      </StyledRootWrapper>
    </ThemeProvider>
  );
}

export default Layout;

