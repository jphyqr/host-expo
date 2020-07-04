import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Alert } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import firebase from "../firebase";
import { ListItem, Button, Icon } from "react-native-elements";
import _ from "lodash";
import {
  h2Style,
  h5Style,
  h6Style,
  h4Style,
  h3Style,
  vs30,
} from "../styles/styles";
import { ScrollView } from "react-native-gesture-handler";
import { SET_MEMBER_OF_GROUP } from "../constants/reducerConstants";
import { preventAutoHide } from "expo/build/launch/SplashScreen";
const GroupScreen = ({ navigation }) => {
  const [_group, setGroup] = useState({});
  const dispatch = useDispatch();
  const xGroup = useSelector((state) => state.group || {});
  const [_rankings, setRankings] = useState([]);
  const xMemberOfGroup = useSelector((state) => state.member_of_group || []);
  const firestore = firebase.firestore();
  const auth = useSelector((state) => state.firebase.auth || {});
  const rankable = Object.keys(xGroup?.members).length > 8;
  const [_loading, loading] = useState(false);
  const [_fU, fU] = useState(-1);
  useEffect(() => {
    console.log("use Effect");

    if (
      !_.isEmpty(xGroup) &&
      !_.isEmpty(xMemberOfGroup) &&
      _.isEmpty(xMemberOfGroup.rankings)
    ) {
      console.log("No Rankings yet, should create");
      let rankings = [];
      Object.keys(xGroup?.members)
        .filter((id) => id !== auth.uid)
        .forEach((id, i) => {
          rankings.push({
            rank: i,
            rankScore: Object.keys(xGroup.members).length - i,
            uid: id,
            photoURL: xGroup?.members[`${id}`].photoURL,
            displayName: xGroup?.members[`${id}`].displayName,
            rankScore: xGroup?.members[`${id}`].rankScore || 0,
          });
        });

      setRankings(rankings);
    }

    setRankings(xMemberOfGroup.rankings);
  }, [xMemberOfGroup, xGroup]);

  const leaveGroup = async () => {
    Alert.alert(
      "Leave Group",
      "You will lose your spot and rating from group.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Leave Group",
          onPress: async () => {
            console.log("Leave Group");
            loading(true);
            try {
              await firestore
                .collection("group_members")
                .doc(xMemberOfGroup.id)
                .delete();

              navigation.navigate("Main");

              loading(false);
            } catch (error) {
              loading(false);
              console.log("error deleting", error);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const rankHigher = async (i) => {
    if (i == 0) return;

    let uRankings = _rankings;

    let uMemberOfGroup = { ...xMemberOfGroup };

    let prevHighMember = uRankings[i - 1];
    let prevLowMember = uRankings[i];

    console.log("prev high rank", prevHighMember.rank);
    console.log("prev low rank", prevLowMember.rank);

    let tempRank = i;
    console.log("temp rank", tempRank);
    prevLowMember.rank = i - 1;
    prevLowMember.rankScore = uRankings.length - (i - 1);

    prevHighMember.rank = i;
    prevHighMember.rankScore = uRankings.length - i;

    console.log("after swap  prevHighRank", prevHighMember.rank);
    console.log("after swap  prevLowRank", prevLowMember.rank);

    console.log("after swap  prevHighRank score", prevHighMember.rankScore);
    console.log("after swap  prevLowRank score ", prevLowMember.rankScore);
    //need to re order also re-rank
    uRankings[i - 1] = prevLowMember;
    uRankings[i] = prevHighMember;

    setRankings(uRankings);

    uMemberOfGroup.rankings = uRankings;

    dispatch({ type: SET_MEMBER_OF_GROUP, payload: uMemberOfGroup });

    await firestore
      .collection("group_member")
      .doc(xMemberOfGroup.id)
      .update({
        rankings: uRankings,
        rankedOn: Date.now(),
        changedIds: [prevHighMember.uid, prevLowMember.uid],
      });

    fU(_fU + 1);
  };

  if (_.isEmpty(xGroup) || _.isEmpty(xMemberOfGroup))
    return <ActivityIndicator />;

  return (
    <ScrollView>
      <Text style={h2Style}>Rank Members</Text>
      <Text style={h5Style}>
        People you want to play with -> People you don't care to play with
      </Text>
      <Text style={h4Style}>
        Members will not see how you rank them. Rankings will be used to help
        host manage games.
      </Text>

      {_rankings?.map((g, i) => {
        return (
          <ListItem
            key={i}
            leftAvatar={{
              source: { uri: g.photoURL },
            }}
            title={g.displayName}
            subtitle={g.rankScore}
            rightElement={
              rankable && i > 0 ? (
                <Button
                  title="Move Up"
                  icon={{
                    name: "arrow-upward",
                    size: 15,
                    color: "white",
                  }}
                  onPress={() => rankHigher(i)}
                />
              ) : null
            }
            onPress={() =>
              navigation.navigate("GroupMemberScreen", {
                user: g,
                id: g.id,
                pending: false,
              })
            }
          />
        );
      })}

      <View style={vs30} />
      <Button type="outline" title="Leave Group" onPress={leaveGroup} />
    </ScrollView>
  );
};

export default GroupScreen;
