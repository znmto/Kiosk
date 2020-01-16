import React from 'react';
import { useTheme } from '@material-ui/core/styles';
import styled from 'styled-components';
import AsyncSelect from '../Components/AsyncSelect';
import { omdbSchemaParser } from '../Helpers/SchemaParsers';
import { MdLiveTv, MdLocalMovies, MdVideogameAsset, MdChromeReaderMode } from 'react-icons/md';


interface StyleProps {
    color?: string;
}

const StyledMediaSelectionWrapper = styled.div`
    display: grid;
    justify-content: center;
`;

const StyledCenteredDivider = styled.div`
    position: absolute;
    left: 50%;
    top: 50%;
    transform: rotate(45deg) translate(-50%, 25%);
    color: ${(props: StyleProps) => props.color};
    font-size: 40px;
    font-weight: 100;
    & svg {
        stroke-width: 0.2;
    }
`;


const media = [
    {
        label: 'Movie',
        icon: <MdLocalMovies />,
        quadrant: [1,1],
        iconStyles: 'top: 47%; left: 46%; font-size: 32px',
        url: `http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}`,
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
        searchParam: 's',
        schemaParser: omdbSchemaParser,
        firestoreKey: 'movie',
        externalUrl: 'https://imdb.com/title/'
    },
    {
        label: 'TV Show',
        icon: <MdLiveTv />,
        quadrant: [2,1],
        iconStyles: 'top: 47%; left: 51.5%',
        // TODO: put into env file
        url: `http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}`,
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
        searchParam: 's',
        schemaParser: omdbSchemaParser,
        firestoreKey: 'tvShow',
        externalUrl: 'https://imdb.com/title/'
        
    },
    {
        label: 'Book',
        icon: <MdChromeReaderMode />,
        quadrant: [1,2],
        iconStyles: 'top: 53%; left: 46%',

    },
    {
        label: 'Game',
        icon: <MdVideogameAsset />,
        quadrant: [2,2],
        iconStyles: 'top: 53%; left: 51.5%; font-size: 32px',

        url: 'http://api-v3.igdb.com/search',
        method: 'POST',
        headers: {
            'user-key': process.env.IGDB_USER_KEY,
            'Accept': 'application/json',
            
        },
        searchParam: 'name',
        firestoreKey: 'game',
        data: "fields alternative_name,character,collection,company,description,game,name,person,platform,popularity,published_at,test_dummy,theme;"
        
    },
]

const Activity: React.FC = props => {
    const theme = useTheme();

  return (
      <>
      <StyledMediaSelectionWrapper>
          {/* <StyledCenteredDivider color={theme.palette.primary.main}><FaTimes/></StyledCenteredDivider> */}
        {media.map(m => <AsyncSelect key={m.label} {...m } />)}
      </StyledMediaSelectionWrapper>
      </>

  );
}

export default Activity;