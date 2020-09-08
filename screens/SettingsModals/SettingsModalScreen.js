import React from "react";
import { View, Text } from "react-native";
import { CHANNEL_TYPE } from "../../constants/helperConstants";
import GroupSettings from "./GroupSettings";
import DMSettings from "./DMSettings";
import GameSettings from "./GameSettings";

const SettingsModalScreen = ({ navigation, route }) => {
  const renderProperScreen = () => {
    switch (route?.params?.channelType) {
      case CHANNEL_TYPE.GROUP:
        {
          return <GroupSettings navigation={navigation} />;
        }
        break;
      case CHANNEL_TYPE.DM:
        return <DMSettings navigation={navigation} />;

        break;
      case CHANNEL_TYPE.GAME:
        return <GameSettings navigation={navigation} />;

      default:
        return <Text>not a group</Text>;
    }
  };
  return <View>{renderProperScreen()}</View>;
};

export default SettingsModalScreen;
