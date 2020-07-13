import React, { memo, useReducer } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { TextField, Tooltip, makeStyles, Theme } from "@material-ui/core";
import { User } from "firebase";
import { useSession } from "../Helpers/CustomHooks";
import {
  AssignmentOutlined,
  AssignmentTurnedInOutlined,
} from "@material-ui/icons";

const useStyles = makeStyles((theme: Theme) => ({
  assignmentOutlinedIcon: {
    cursor: "pointer",
    color: theme.palette.primary.main,
  },
  assignmentTurnedInOutlinedIcon: {
    cursor: "pointer",
    color: theme.palette.primary.main,
  },
}));

const ClipBoardCopy: React.FC = memo(() => {
  const user: User = useSession();
  const classes = useStyles();

  const reducer = (state, payload) => ({ ...state, ...payload });
  const [state, dispatch] = useReducer(reducer, {
    value: `${window.location.origin}/activity/${user?.uid}`,
    copied: false,
    showTooltip: false,
  });

  return (
    <Tooltip
      arrow
      placement="bottom"
      open={state.copied && state.showTooltip}
      title={"Copied to clipboard!"}
      leaveDelay={1500}
      onClose={() => dispatch({ showTooltip: false })}
    >
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
            <CopyToClipboard
              text={state.value}
              onCopy={() => dispatch({ copied: true, showTooltip: true })}
            >
              {!state.copied ? (
                <AssignmentOutlined
                  className={classes.assignmentOutlinedIcon}
                />
              ) : (
                <AssignmentTurnedInOutlined
                  className={classes.assignmentTurnedInOutlinedIcon}
                />
              )}
            </CopyToClipboard>
          ),
        }}
      />
    </Tooltip>
  );
});
export default ClipBoardCopy;
