import React, { memo, useReducer } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import TextField from "@material-ui/core/TextField";
import { User } from "firebase";
import { useSession } from "../Helpers/CustomHooks";
import Tooltip from "@material-ui/core/Tooltip";
import AssignmentOutlinedIcon from "@material-ui/icons/AssignmentOutlined";
import styled from "styled-components";
import InputAdornment from "@material-ui/core/InputAdornment";
import AssignmentTurnedInOutlinedIcon from "@material-ui/icons/AssignmentTurnedInOutlined";
import { useTheme, Theme } from "@material-ui/core/styles";

type StyleProps = {
  primary?: string;
  secondary?: string;
};

const StyledAssignmentOutlinedIcon = styled(AssignmentOutlinedIcon)`
  cursor: pointer;
  color: ${(props: StyleProps) => props.secondary};
`;
const StyledAssignmentTurnedInOutlinedIcon = styled(
  AssignmentTurnedInOutlinedIcon
)`
  cursor: pointer;
  color: ${(props: StyleProps) => props.primary};
`;

const ClipBoardCopy = memo(() => {
  const user: User = useSession();
  const theme: Theme = useTheme();

  const reducer = (state, payload) => ({ ...state, ...payload });
  const [state, dispatch] = useReducer(reducer, {
    value: `${window.location.origin}/activity/${user?.uid}`,
    copied: false,
    showTooltip: false,
  });

  return (
    <div>
      <TextField
        label="Shareable Link"
        variant="outlined"
        value={state.value}
        InputProps={{
          readOnly: true,
          style: {
            padding: 10,
          },
          endAdornment: (
            <InputAdornment position="end">
              <Tooltip
                // open
                open={state.copied}
                title={"Copied to clipboard!"}
                leaveDelay={1500}
                onClose={() => dispatch({ showTooltip: false })}
              >
                <CopyToClipboard
                  text={state.value}
                  onCopy={() => dispatch({ copied: true, showTooltip: true })}
                >
                  {!state.copied ? (
                    <StyledAssignmentOutlinedIcon
                      secondary={theme.palette.secondary.main}
                    />
                  ) : (
                    <StyledAssignmentTurnedInOutlinedIcon
                      primary={theme.palette.primary.main}
                    />
                  )}
                </CopyToClipboard>
              </Tooltip>
            </InputAdornment>
          ),
        }}
      />{" "}
    </div>
  );
});
export default ClipBoardCopy;
