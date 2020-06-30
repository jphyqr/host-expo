import React, { useState } from "react";
import { View, Text } from "react-native";
import { h2Style } from "../styles/styles";
import { ListItem, Icon } from "react-native-elements";
import { formatDistance } from "date-fns";

const InviteList = ({ group, game }) => {
  const [inviteList, setInviteList] = useState([]);
  return (
    <View>
      <Text style={h2Style}> Member List</Text>
      {group?.members &&
        Object.keys(group.members).map((id, i) => {
          return (
            <ListItem
              key={i}
              subtitle={
                game.members[`${id}`].confirmed
                  ? `${game.members[`${id}`].confirmed} on ${formatDistance(
                      new Date(game.members[`${id}`].dispatchedDate),
                      new Date(Date.now())
                    )}`
                  : "Not invited yet"
              }
              leftAvatar={{
                source: { uri: group.members[`${id}`].photoURL },
              }}
              title={group.members[`${id}`].displayName}
              rightIcon={
                inviteList.filter((i) => i.id === id).length > 0 ? (
                  <Icon name="sc-telegram" type="evilicon" color="#517fa4" />
                ) : (
                  <Icon name="plus" type="evilicon" color="#517fa4" />
                )
              }
              onPress={
                inviteList.filter((i) => i.id === id).length > 0
                  ? () => setInviteList(inviteList.filter((i) => i.id !== id))
                  : () =>
                      setInviteList([
                        ...inviteList,
                        Object.assign(
                          {},
                          { id: id, ...group.members[`${id}`] }
                        ),
                      ])
              }
            />
          );
        })}
    </View>
  );
};

export default InviteList;
