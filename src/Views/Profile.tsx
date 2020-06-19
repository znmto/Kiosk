import React from "react";
import AsyncSelect from "../Components/AsyncSelect";

const Profile: React.FC = () => {
  return (
    <div>
      <h1>profile</h1>
      <div className="selection-wrapper">
        {["foo", "bar"].map((m) => (
          <AsyncSelect key={m} />
        ))}
      </div>
    </div>
  );
};

export default Profile;
