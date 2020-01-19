import React from 'react';
import { BottomNavigation, BottomNavigationAction } from '@material-ui/core';
import { SupervisorAccount, Home, Favorite } from '@material-ui/icons';
import styled, { StyledProps } from 'styled-components';
import { useHistory } from "react-router-dom";
import { HOME, ACTIVITY, FRIENDS } from '../Constants/routes';
import { useTheme } from '@material-ui/core/styles';
import { BottomNavigationProps } from '@material-ui/core/BottomNavigation';

interface ExtraProps extends BottomNavigationProps {
  secondary?: any; //TODO: fix type
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
  // default view
  const [route, setRoute] = React.useState('activity');

  let history = useHistory();
  const theme = useTheme();

  const handleChange = (event: React.ChangeEvent<{}>, newRoute: string): void => setRoute(newRoute);

  const navigate = (route: string): void =>  history.push(route);

  return (
    <StyledBottomNavigation value={route} onChange={handleChange} secondary={theme.palette.secondary.main}>
      <BottomNavigationAction onClick={e => navigate(HOME)} label="Home" value="home" icon={<Home />} />
      <BottomNavigationAction onClick={e => navigate(ACTIVITY)} label="My Activity" value="activity" icon={<Favorite />} />
      <BottomNavigationAction onClick={e => navigate(FRIENDS)} label="Friends" value="friends" icon={<SupervisorAccount />} />
    </StyledBottomNavigation>
  );
}

export default BottomNav;