import React from 'react';
// import BottomNavigation from '@material-ui/core/BottomNavigation';
// import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import { BottomNavigation, BottomNavigationAction } from '@material-ui/core';
import { SupervisorAccount, Home, Favorite } from '@material-ui/icons';
import styled, { StyledProps } from 'styled-components';
import { useHistory } from "react-router-dom";
import { HOME, ACTIVITY, FRIENDS } from '../Constants/routes';
import { SECONDARY } from '../Constants/styles';
import { useTheme } from '@material-ui/core/styles';
import { BottomNavigationProps } from '@material-ui/core/BottomNavigation';

interface ExtraProps extends BottomNavigationProps {
  secondary?: any;
}

const StyledBottomNavigation = styled(BottomNavigation)`
    width: 100%;
    position: fixed;
    bottom: 0;
    border-top: 1px solid ${(props: ExtraProps) => props.secondary};
    z-index: 2;
    grid-template-columns: 1fr 1fr 1fr;
    display: grid;
    justify-items: center;
    height: 55px;
` as any;

const BottomNav: React.FC = _ => {
  const [value, setValue] = React.useState('activity');
  let history = useHistory();
  const theme = useTheme();

  const handleChange = (event: React.ChangeEvent<{}>, newValue: string): void => setValue(newValue);

  const navigate = (route: string): void =>  history.push(route);

  return (
    <StyledBottomNavigation value={value} onChange={handleChange} secondary={theme.palette.secondary.main}>
      <BottomNavigationAction onClick={e => navigate(HOME)} label="Home" value="home" icon={<Home />} />
      <BottomNavigationAction onClick={e => navigate(ACTIVITY)} label="My Activity" value="activity" icon={<Favorite />} />
      <BottomNavigationAction onClick={e => navigate(FRIENDS)} label="Friends" value="friends" icon={<SupervisorAccount />} />
    </StyledBottomNavigation>
  );
}

export default BottomNav;