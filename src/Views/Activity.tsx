import React, { memo, useState, useEffect } from "react";
import axios from "axios";
import { useTheme, Theme } from "@material-ui/core/styles";
import styled from "styled-components";
import AsyncSelect from "../Components/AsyncSelect";
import { useSession } from "../Helpers/CustomHooks";
import { FIREBASE_GET_ID_URL } from "../Constants/api";
import { User } from "firebase";
import ClipBoardCopy from "../Components/CopyToClipboard";
import { media, Media } from "../Constants/media";
import { SentimentSatisfiedAltSharp } from "@material-ui/icons";
import { LOGIN } from "../Constants/routes";
import { useHistory } from "react-router-dom";

type StyleProps = {
  color?: string;
};

type PublicUser = {
  email: string;
  uid: string;
};

const StyledMediaSelectionWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  justify-content: space-evenly;
`;
const StyledPublicUserInfo = styled.h2`
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

const StyledShareableLinkContainer = styled.div`
  display: grid;
  justify-content: center;
  padding: 40px 0 20px;
  & input {
    width: 300px;
    padding: 5px;
  }
`;

interface ActivityProps {
  match?: any;
}

const Activity: React.FC<ActivityProps> = memo((props: ActivityProps) => {
  const { match: { params = {} } = {} } = props;
  const publicUid = params?.publicUid;

  const [publicUser, setPublicUser] = useState<PublicUser>();
  const theme: Theme = useTheme();
  const user: User = useSession();
  const history = useHistory();

  const getUserNamesById = async (userIdArr: string[]) => {
    console.log("userIdArr", userIdArr);
    const userIdParam = userIdArr.join(",");
    try {
      const { data } = await axios({
        url: FIREBASE_GET_ID_URL,
        method: "GET",
        params: {
          ids: userIdParam,
        },
      });
      console.log("data", data);
      const publicUser: PublicUser = data[0];
      return setPublicUser(publicUser);
    } catch (error) {
      console.log("error", error.response);
    }
  };
  useEffect(() => {
    console.log("publicUid", publicUid);
    if (!publicUid && !user) return history.push(LOGIN);
    if (publicUid) {
      getUserNamesById([publicUid]);
    }
  }, []);
  console.log("window.location", window.location);
  return (
    <>
      {!publicUid ? (
        <StyledShareableLinkContainer>
          <ClipBoardCopy />
        </StyledShareableLinkContainer>
      ) : (
        <StyledPublicUserInfo>{`${publicUser?.email}'s List`}</StyledPublicUserInfo>
      )}
      <StyledMediaSelectionWrapper>
        {/* <StyledCenteredDivider color={theme.palette.primary.main}><FaTimes/></StyledCenteredDivider> */}
        {media.map((m: Media) => (
          <AsyncSelect publicUserId={publicUid} key={m.label} {...m} />
        ))}
      </StyledMediaSelectionWrapper>
    </>
  );
});

export default Activity;
