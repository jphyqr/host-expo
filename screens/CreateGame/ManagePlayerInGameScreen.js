import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Alert } from "react-native";
import {
  h2Style,
  centeredRow,
  selectedListItem,
  h5Style,
  averageRow,
  spacedRow,
  moneyText,
  h7Style,
  hs30,
  vs30,
  vs10,
  vsKeyboard,
  errorStyle,
  h6Style,
} from "../../styles/styles";
import {
  ListItem,
  ButtonGroup,
  Button,
  Overlay,
  Input,
  CheckBox,
} from "react-native-elements";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {
  UPDATE_GAME_S,
  SET_GAME,
  SET_MEMBER_OF_GROUP,
  SET_GAME_TRANSACTIONS,
} from "../../constants/reducerConstants";
import firebase from "../../firebase";
import { useDispatch, useSelector } from "react-redux";
import { ScrollView } from "react-native-gesture-handler";
import _ from "lodash";
import { CHIP_TRANSATIONS } from "../../constants/helperConstants";
import { parse, format } from "date-fns";
import { renderPlayersStack } from "../../helperFunctions";
const ManagePlayerInGameScreen = ({ route, navigation }) => {
  const firestore = firebase.firestore();
  const [_game, setGame] = useState({});
  const [_addingChips, addingChips] = useState(false);
  const xGame = useSelector((state) => state.game || {});
  const [_showAddChips, addChips] = useState(false);
  const [_showCashOut, cashOut] = useState(false);
  const [_reclaim, setReclaim] = useState(0);
  const [_backpay, setBackpay] = useState(0);
  const [_payout, setPayout] = useState(0);
  const [_fU, fU] = useState(-1);
  const dispatch = useDispatch();
  const [_cashingOut, cashingOut] = useState(false);
  const xMember = useSelector((state) => state.memberOfGroup || {});
  const [_member, setMember] = useState({});
  const [_memberGroupBalance, memberGroupBalance] = useState(0);
  const [_chipsCashedOut, setChipsCashedOut] = useState(0);
  const [_borrowed, setBorrowed] = useState(false);
  const [_chips, setChips] = useState(0);
  const [_gameTransactions, setGameTransactions] = useState([]);
  const xGameTransactions = useSelector(
    (state) => state.gameTransactions || []
  );
  useEffect(() => {
    const getTransactionsForGame = async () => {
      let transactions = [];
      let transDocs = await firestore
        .collection("chip_transactions")
        .where("gameId", "==", xGame.id)
        .get();

      transDocs.forEach((doc) => {
        transactions.push({ id: doc.id, ...doc.data() });
      });

      dispatch({ type: SET_GAME_TRANSACTIONS, payload: transactions });
    };

    if (!_.isEmpty(xGame)) {
      console.log("SETTING X GAME NOT EMPTY");
      setGame(xGame);
      getTransactionsForGame();
    }
  }, [xGame]);

  useEffect(() => {
    if (!_.isEmpty(xGameTransactions)) setGameTransactions(xGameTransactions);
  }, [xGameTransactions]);

  useEffect(() => {
    const loadMemberGroupBalance = async () => {
      let groupDoc = await firestore
        .collection("group_member")
        .doc(`${xGame.groupId}_${xMember.id}`)
        .get();
      let groupData = groupDoc.data();
      console.log("Group Member Balance Loading", groupData);
      memberGroupBalance(groupData?.groupBalance || 0);
    };
    if (!_.isEmpty(xMember)) {
      console.log("LOADED MEMBER", xMember);
      setMember(xMember);

      if (!_.isEmpty(xGame)) {
        loadMemberGroupBalance();
      }

      setBackpay(0);
      setReclaim(0);
      setChipsCashedOut(0);
    }
  }, [xMember, xGame]);
  const { gameSettings } = _game || {};
  const { waitList, seating } = _game || [];

  const handleCashOut = async () => {
    try {
      cashingOut(true);
      let uGame = { ..._game };
      let uMembers = uGame.members;
      let uMember = uMembers[`${xMember.id}`];
      let uChipsInPlay = uGame.chipsInPlay || 0;
      uMember.borrowed = [];
      uMember.bought = [];
      uMember.cashedOutDate = Date.now();
      uMember.cashedOutChips = parseInt(_chipsCashedOut);

      if (_reclaim > 0) {
        let uGroupBalance = parseInt(_memberGroupBalance);
        uGroupBalance = uGroupBalance + parseInt(_reclaim);
        await firestore
          .collection("group_member")
          .doc(`${xGame.groupId}_${xMember.id}`)
          .update({
            groupBalance: uGroupBalance,
          });

        await firestore.collection("chip_transactions").add({
          chipTransactionType: CHIP_TRANSATIONS.RECLAIM,
          creationDate: Date.now(),
          gameId: xGame.id,
          hostUid: xGame.hostUid,
          hostedBy: xGame.hostedBy,
          hostedByPhotoURL: xGame.hostPhotoURL,
          memberUid: _member.id,
          memberName: _member.displayName,
          memberPhotoURL: _member.photoURL,
          groupId: xGame.groupId,
          groupName: xGame.groupName,
          groupPhotoURL: xGame.groupPhotoURL,

          borrowed: _borrowed,
          amount: _reclaim,
        });
      }

      if (_backpay > 0) {
        let uGroupBalance = parseInt(_memberGroupBalance);
        uGroupBalance = uGroupBalance + parseInt(_backpay);
        await firestore
          .collection("group_member")
          .doc(`${xGame.groupId}_${xMember.id}`)
          .update({
            groupBalance: uGroupBalance,
          });

        await firestore.collection("chip_transactions").add({
          chipTransactionType: CHIP_TRANSATIONS.BACKPAY,
          creationDate: Date.now(),
          gameId: xGame.id,
          hostUid: xGame.hostUid,
          hostedBy: xGame.hostedBy,
          hostedByPhotoURL: xGame.hostPhotoURL,
          memberUid: _member.id,
          memberName: _member.displayName,
          memberPhotoURL: _member.photoURL,
          groupId: xGame.groupId,
          groupName: xGame.groupName,
          groupPhotoURL: xGame.groupPhotoURL,

          borrowed: _borrowed,
          amount: _backpay,
        });
      }

      if (
        parseInt(_chipsCashedOut) -
          parseInt(_payout) -
          parseInt(_reclaim) +
          parseInt(_backpay) >
        0
      ) {
        let uGroupBalance = parseInt(_memberGroupBalance);
        uGroupBalance =
          uGroupBalance -
          (parseInt(_chipsCashedOut) -
            parseInt(_payout) -
            parseInt(_reclaim) +
            parseInt(_backpay));
        await firestore
          .collection("group_member")
          .doc(`${xGame.groupId}_${xMember.id}`)
          .update({
            groupBalance: uGroupBalance,
          });

        await firestore.collection("chip_transactions").add({
          chipTransactionType: CHIP_TRANSATIONS.CARRY,
          creationDate: Date.now(),
          gameId: xGame.id,
          hostUid: xGame.hostUid,
          hostedBy: xGame.hostedBy,
          hostedByPhotoURL: xGame.hostPhotoURL,
          memberUid: _member.id,
          memberName: _member.displayName,
          memberPhotoURL: _member.photoURL,
          groupId: xGame.groupId,
          groupName: xGame.groupName,
          groupPhotoURL: xGame.groupPhotoURL,

          borrowed: _borrowed,
          amount:
            parseInt(_chipsCashedOut) -
            parseInt(_payout) -
            parseInt(_reclaim) +
            parseInt(_backpay),
        });
      }

      if (_payout > 0) {
        await firestore.collection("chip_transactions").add({
          chipTransactionType: CHIP_TRANSATIONS.PAY_OUT,
          creationDate: Date.now(),
          gameId: xGame.id,
          hostUid: xGame.hostUid,
          hostedBy: xGame.hostedBy,
          hostedByPhotoURL: xGame.hostPhotoURL,
          memberUid: _member.id,
          memberName: _member.displayName,
          memberPhotoURL: _member.photoURL,
          groupId: xGame.groupId,
          groupName: xGame.groupName,
          groupPhotoURL: xGame.groupPhotoURL,

          borrowed: _borrowed,
          amount: _payout,
        });
      }

      uChipsInPlay = parseInt(uChipsInPlay) - parseInt(_chipsCashedOut);
      await firestore.collection("games").doc(xGame.id).update({
        members: uMembers,
        chipsInPlay: uChipsInPlay,
      });

      uGame.members = uMembers;
      uGame.chipsInPlay = uChipsInPlay;

      dispatch({ type: SET_GAME, payload: uGame });
      dispatch({ type: UPDATE_GAME_S, payload: uGame });
      dispatch({
        type: SET_MEMBER_OF_GROUP,
        payload: { id: xMember.id, ...uMember },
      });

      Alert.alert(
        `Cashed out ${_chipsCashedOut}  for ${xMember.displayName}`,
        `New Group Balance: ${
          parseInt(_memberGroupBalance) + parseInt(_reclaim)
        }
        
        Pay out: ${_payout}
        `,
        [
          {
            text: "OK",
            onPress: () => {
              cashOut(false);
              setChips(0);
              setReclaim(0);
              setPayout("");
              setBorrowed(false);
            },
          },
        ],
        { cancelable: false }
      );
      cashingOut(false);
    } catch (error) {
      cashingOut(false);
      console.log("error in handleCashOut", error);
    }
  };

  const handleAddChips = async () => {
    try {
      addingChips(true);
      let uGame = { ..._game };
      let uMembers = uGame.members;
      let uGroupBalance = parseInt(_memberGroupBalance);
      let uMember = uMembers[`${xMember.id}`];
      let uChipsInPlay = uGame.chipsInPlay || 0;
      let uBought;
      uBought = uMember.bought || [];
      let uBorrowed;
      uBorrowed = uMember.borrowed || [];
      if (_borrowed) {
        if (uBorrowed)
          uBorrowed.push({ createdAt: Date.now(), amount: parseInt(_chips) });
        else uBorrowed = [{ createdAt: Date.now(), amount: parseInt(_chips) }];
        uMember.borrowed = uBorrowed;
        uGroupBalance = uGroupBalance - parseInt(_chips);
        await firestore
          .collection("group_member")
          .doc(`${xGame.groupId}_${xMember.id}`)
          .update({
            groupBalance: uGroupBalance,
          });
      } else {
        if (uBought)
          uBought.push({ createdAt: Date.now(), amount: parseInt(_chips) });
        else {
          uBought = [{ createdAt: Date.now(), amount: parseInt(_chips) }];
        }
        uMember.bought = uBought;
      }

      await firestore.collection("chip_transactions").add({
        creationDate: Date.now(),
        chipTransactionType: _borrowed
          ? CHIP_TRANSATIONS.BORROW
          : CHIP_TRANSATIONS.BUY,
        gameId: xGame.id,
        hostUid: xGame.hostUid,
        hostedBy: xGame.hostedBy,
        hostedByPhotoURL: xGame.hostPhotoURL,
        memberUid: _member.id,
        memberName: _member.displayName,
        memberPhotoURL: _member.photoURL,
        groupId: xGame.groupId,
        groupName: xGame.groupName,
        groupPhotoURL: xGame.groupPhotoURL,

        borrowed: _borrowed,
        amount: _chips,
      });

      dispatch({
        type: SET_MEMBER_OF_GROUP,
        payload: { id: xMember.id, ...uMember },
      });
      uMembers[`${xMember.id}`] = uMember;
      uChipsInPlay = parseInt(uChipsInPlay) + parseInt(_chips);
      await firestore.collection("games").doc(xGame.id).update({
        members: uMembers,
        chipsInPlay: uChipsInPlay,
      });

      uGame.members = uMembers;
      uGame.chipsInPlay = uChipsInPlay;
      dispatch({ type: SET_GAME, payload: uGame });
      dispatch({ type: UPDATE_GAME_S, payload: uGame });
      //should update group balance if its borrowed
      //update game chips for user
      //dispatch new game state
      addingChips(false);
      Alert.alert(
        `Chips Added for ${xMember.displayName}`,
        `New Group Balance: ${
          parseInt(_memberGroupBalance) - (_borrowed ? parseInt(_chips) : 0)
        }`,
        [
          {
            text: "OK",
            onPress: () => {
              addChips(false);
              setChips(0);
              setBorrowed(false);
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      addingChips(false);
      console.log("error in handleAddChips", error);
    }
  };

  const removeFromSeat = async () => {
    let updatedGame = _game;
    let updatedSeating = _game.seating;
    let indexOfCurrent = -1;
    indexOfCurrent = updatedSeating.findIndex((i) => i.uid === _member.id);

    if (indexOfCurrent > -1) {
      console.log("CLEAR FROM SEAT", indexOfCurrent);
      updatedSeating[indexOfCurrent] = Object.assign({}, { taken: false });
    }
    updatedGame.seating = updatedSeating;

    setGame(updatedGame);
    dispatch({ type: UPDATE_GAME_S, payload: updatedGame });
    dispatch({ type: SET_GAME, payload: updatedGame });
    await firestore.collection("games").doc(_game.id).update({
      seating: updatedSeating,
    });

    Alert.alert(
      "Player Removed",
      `${_member.displayName} was removed from seat`,
      [{ text: "OK" }],
      { cancelable: false }
    );

    fU(_fU + 1);
  };

  const addToWaitlist = async (member) => {
    let updatedGame = _game;
    let updatedSeating = _game.seating;
    let updatedWaitList = _game.waitList || [];

    //iff exists already return early

    let indexOnWaitList = -1;
    indexOnWaitList = updatedWaitList.findIndex((i) => i.uid === _member.id);
    if (indexOnWaitList > -1) return;

    let indexOfCurrent = -1;
    indexOfCurrent = updatedSeating.findIndex((i) => i.uid === _member.id);

    if (indexOfCurrent > -1) {
      console.log("CLEAR FROM SEAT", indexOfCurrent);
      updatedSeating[indexOfCurrent] = Object.assign({}, { taken: false });
    }

    updatedWaitList.push({
      displayName: member.displayName,
      uid: member.id,
      photoURL: member.photoURL,
      bookedOn: Date.now(),
    });

    updatedGame.waitList = updatedWaitList;
    updatedGame.seating = updatedSeating;
    setGame(updatedGame);
    dispatch({ type: UPDATE_GAME_S, payload: updatedGame });
    dispatch({ type: SET_GAME, payload: updatedGame });
    await firestore.collection("games").doc(_game.id).update({
      waitList: updatedWaitList,
      seating: updatedSeating,
    });
    fU(_fU + 1);
  };

  const resolveRequest = async (resolve) => {
    try {
      let updatedGame = { ...xGame };
      let updatedSeating = updatedGame.seating || [];
      let indexOfCurrent = -1;
      indexOfCurrent = updatedSeating.findIndex((i) => i.uid === _member.id);

      let uSeated = updatedSeating[indexOfCurrent];
      uSeated.accepted = resolve;

      if (!resolve) {
        uSeated = Object.assign({}, { taken: false });
        dispatch({ type: SET_MEMBER_OF_GROUP, payload: {} });
        setMember({});
      }
      updatedSeating[indexOfCurrent] = uSeated;
      updatedGame.seating = updatedSeating;
      dispatch({ type: SET_GAME, payload: updatedGame });

      await firestore.collection("games").doc(xGame.id).update({
        seating: updatedSeating,
      });
    } catch (error) {
      loading(false);
      console.log("error in resolveRequest", error);
    }
  };

  const requestedButtons = [
    {
      element: () => (
        <Button
          buttonStyle={{
            backgroundColor: "black",
            padding: 2,
            borderRadius: 50,
          }}
          raised
          type='clear'
          icon={<Icon name='check' type='material' size={35} color='green' />}
          onPress={() => {
            resolveRequest(true);
          }}
        ></Button>
      ),
    },
    {
      element: () => (
        <Button
          buttonStyle={{
            backgroundColor: "black",
            padding: 2,
            borderRadius: 50,
          }}
          raised
          type='clear'
          icon={<Icon name='close' type='material' size={35} color='red' />}
          onPress={() => {
            resolveRequest(false);
          }}
        ></Button>
      ),
    },
  ];

  const playerButtons = [
    {
      element: () => (
        <Button
          raised
          type='outline'
          buttonStyle={{
            backgroundColor: "black",
            padding: 2,
            borderRadius: 50,
          }}
          icon={
            <Icon name='poker-chip' type='material' size={35} color='white' />
          }
          onPress={() => {
            addChips(true);
          }}
        ></Button>
      ),
    },
    {
      element: () => (
        <Button
          raised
          type='clear'
          buttonStyle={{
            backgroundColor: "green",
            padding: 2,
            borderRadius: 50,
          }}
          icon={
            <Icon name='currency-usd' type='material' size={35} color='white' />
          }
          onPress={() => {
            cashOut(true);
          }}
        ></Button>
      ),
    },
    {
      element: () => (
        <Button
          raised
          type='clear'
          buttonStyle={{
            backgroundColor: "grey",
            padding: 2,
            borderRadius: 50,

            opacity:
              _game?.members[`${xMember.id}`]?.borrowed?.length > 0 ||
              _game?.members[`${xMember.id}`]?.bought?.length > 0
                ? 0.5
                : 1,
          }}
          icon={<Icon name='seat' type='material' size={35} color='white' />}
          onPress={
            _game?.members[`${xMember.id}`]?.borrowed?.length > 0 ||
            _game?.members[`${xMember.id}`]?.bought?.length > 0
              ? () => {
                  Alert.alert(
                    "Cash Out First",
                    "Cash Out chips first",
                    [{ text: "OK" }],
                    { cancelable: false }
                  );
                }
              : () => removeFromSeat()
          }
        ></Button>
      ),
    },
  ];

  const moveUpOnWaitList = async (i) => {
    if (i == 0) return;
    let updatedGame = { ..._game };
    let updatedWaitList = updatedGame.waitList;

    var b = updatedWaitList[i - 1];
    updatedWaitList[i - 1] = updatedWaitList[i];
    updatedWaitList[i] = b;

    updatedGame.waitList = updatedWaitList;

    setGame(updatedGame);
    dispatch({ type: UPDATE_GAME_S, payload: updatedGame });
    dispatch({ type: SET_GAME, updatedGame });
    await firestore.collection("games").doc(_game.id).update({
      waitList: updatedWaitList,
    });
    fU(_fU + 1);
  };

  const updateSeating = async (i) => {
    let updatedGame = { ..._game };
    let updatedSeating = _game?.seating;
    let updatedWaitList = _game?.waitList || [];
    //if player was sitting in a seat, clear that seat.
    let passonRequested;
    let indexOfCurrent = -1;
    indexOfCurrent = updatedSeating.findIndex((i) => i.uid === _member.id);

    if (indexOfCurrent > -1) {
      passonRequested = updatedSeating[indexOfCurrent].requested;
      updatedSeating[indexOfCurrent] = { taken: false };
    }

    //if player was on waitlist remove him
    let indexOnWaitList = -1;
    indexOnWaitList = updatedWaitList.findIndex((i) => i.uid === _member.id);

    if (indexOnWaitList > -1) {
      updatedWaitList.splice(indexOnWaitList, 1);
    }

    updatedSeating[i] = {
      taken: true,
      displayName: _member.displayName,
      photoURL: _member.photoURL,
      uid: _member.id,
      bookedOn: Date.now(),
      requested: passonRequested || false,
    };
    updatedGame.seating = updatedSeating;
    updatedGame.waitList = updatedWaitList;
    setGame(updatedGame);
    dispatch({ type: UPDATE_GAME_S, payload: updatedGame });

    console.log("DISPATCHING NEW GAME");
    dispatch({ type: SET_GAME, payload: updatedGame });
    await firestore.collection("games").doc(_game.id).update({
      seating: updatedSeating,
      waitList: updatedWaitList,
    });
    fU(_fU + 1);
  };

  const renderPreferences = () => {
    const user = game.members[`${auth.uid}`];
    let days, games, stakes;
    days = games = stakes = "";

    const { stakeOptions, gameOptions, dayOptions } = game || [];
    const {
      stakeOptions: stakeIndexes,
      gameOptions: gameIndexes,
      dayOptions: dayIndexes,
    } = user || [];
    if (dayIndexes)
      for (const day of dayIndexes) {
        days = days + dayOptions[day].title + "/";
      }
    if (gameIndexes)
      for (const game of gameIndexes) {
        games = games + gameOptions[game].title + "/";
      }
    if (stakeIndexes)
      for (const stake of stakeIndexes) {
        stakes = stakes + stakeOptions[stake].title + "/";
      }

    return days + games + stakes;
  };

  const updateIfANumber = async (value, fn, min = 9999999999) => {
    console.log("UPDATEIFMATCHES", value);
    if (value) {
      var numericReg = /^[0-9\b]+$/;
      if (numericReg.test(value)) {
        fn(parseInt(Math.min(value, min)));
      }
    } else {
      fn(0);
    }
  };

  const renderTransactions = (arr) => {
    return arr.map((u, i) => {
      return (
        <ListItem
          key={i}
          roundAvatar
          containerStyle={{ height: 50 }}
          leftIcon={
            u.chipTransactionType === CHIP_TRANSATIONS.PAY_OUT ? (
              <Icon
                name='currency-usd'
                type='material'
                size={20}
                color='grey'
              />
            ) : u.chipTransactionType === CHIP_TRANSATIONS.RECLAIM ? (
              <Icon name='poker-chip' type='material' size={20} color='grey' />
            ) : u.chipTransactionType === CHIP_TRANSATIONS.BACKPAY ? (
              <Icon
                name='currency-usd'
                type='material'
                size={20}
                color='grey'
              />
            ) : u.chipTransactionType === CHIP_TRANSATIONS.CARRY ? (
              <Icon
                name='currency-usd'
                type='material'
                size={20}
                color='grey'
              />
            ) : u.chipTransactionType === CHIP_TRANSATIONS.BUY ? (
              <Icon name='poker-chip' type='material' size={20} color='grey' />
            ) : u.chipTransactionType === CHIP_TRANSATIONS.BORROW ? (
              <Icon name='poker-chip' type='material' size={20} color='grey' />
            ) : null
          }
          titleStyle={[moneyText, { color: "grey" }]}
          subtitleStyle={h7Style}
          subtitle={format(u.creationDate, "Pp")}
          title={`${u.memberName} ${
            u.chipTransactionType === CHIP_TRANSATIONS.PAY_OUT
              ? "was paid"
              : u.chipTransactionType === CHIP_TRANSATIONS.RECLAIM
              ? "paid back"
              : u.chipTransactionType === CHIP_TRANSATIONS.BACKPAY
              ? "was backpaid"
              : u.chipTransactionType === CHIP_TRANSATIONS.CARRY
              ? "is owed"
              : u.chipTransactionType === CHIP_TRANSATIONS.BUY
              ? "bought"
              : u.chipTransactionType === CHIP_TRANSATIONS.BORROW
              ? "borrowed"
              : null
          } ${u.amount}`}
          rightAvatar={{
            size: "small",
            source: { uri: u?.memberPhotoURL },
          }}
        />
      );
    });
  };

  if (_.isEmpty(_game)) return <ActivityIndicator />;
  return (
    <ScrollView>
      <Overlay
        isVisible={_showCashOut}
        windowBackgroundColor='rgba(255, 255, 255, .5)'
        overlayBackgroundColor='red'
        fullScreen
      >
        <View style={vs30} />
        <Text style={h5Style}>{`Cash Out ${_member.displayName}`}</Text>

        <View style={vs10} />
        <Text
          style={[
            moneyText,
            { color: _memberGroupBalance < 0 ? "red" : "grey" },
          ]}
        >{`Group Balance: ${_memberGroupBalance}`}</Text>
        <Text
          style={[moneyText, { color: "grey" }]}
        >{`In Game For : ${renderPlayersStack(
          _member.borrowed || [],
          _member.bought || []
        )}`}</Text>

        <View style={vs30} />

        <Text
          style={h5Style}
        >{`Chips Cashed out (${_game.chipsInPlay} in play)`}</Text>
        <Input
          value={_chipsCashedOut.toString()}
          leftIcon={<Icon name='poker-chip' size={24} color='black' />}
          onChangeText={(p) => {
            let input;
            if (Number.isNaN(parseInt(p))) {
              input = 0;
            } else {
              input = parseInt(p);
            }
            updateIfANumber(input, setChipsCashedOut, _game.chipsInPlay);

            if (_memberGroupBalance < 0) {
              setReclaim(
                Math.min(
                  _memberGroupBalance * -1,
                  parseInt(Math.min(input, _game.chipsInPlay))
                )
              );
              setPayout(
                parseInt(Math.min(input, _game.chipsInPlay)) -
                  parseInt(
                    Math.min(
                      parseInt(_memberGroupBalance) * -1,
                      parseInt(Math.min(input, _game.chipsInPlay))
                    )
                  )
              );
            }

            if (_memberGroupBalance >= 0) {
              setBackpay(Math.max(_memberGroupBalance, 0));
              setPayout(
                parseInt(Math.min(input, _game.chipsInPlay)) +
                  parseInt(Math.max(_memberGroupBalance, 0))
              );
            }
          }}
        />

        <View style={spacedRow}>
          {_memberGroupBalance < 0 && <Text style={h5Style}>Reclaim</Text>}
          {_memberGroupBalance < 0 && (
            <Input
              value={_reclaim.toString(10)}
              onChangeText={(p) => {
                let input;
                if (Number.isNaN(parseInt(p))) {
                  input = 0;
                } else {
                  input = parseInt(p);
                }

                updateIfANumber(
                  input,
                  setReclaim,
                  parseInt(_memberGroupBalance * -1)
                );

                setPayout(
                  parseInt(_chipsCashedOut) -
                    parseInt(
                      Math.min(input, parseInt(_memberGroupBalance * -1))
                    )
                );
              }}
              leftIcon={<Icon name='arrow-left' size={24} color='black' />}
            />
          )}

          {_memberGroupBalance > 0 && <Text style={h5Style}>Back Pay</Text>}
          {_memberGroupBalance > 0 && (
            <Input
              value={_backpay.toString(10)}
              leftIcon={<Icon name='currency-usd' size={24} color='black' />}
              onChangeText={(p) => {
                let input;
                if (Number.isNaN(parseInt(p))) {
                  input = 0;
                } else {
                  input = parseInt(p);
                }

                updateIfANumber(
                  input,
                  setBackpay,
                  parseInt(_memberGroupBalance)
                );

                setPayout(
                  parseInt(Math.min(input, parseInt(_memberGroupBalance))) +
                    parseInt(_chipsCashedOut)
                );
              }}
            />
          )}

          <View style={spacedRow}>
            <Text style={[h5Style]}>Payout</Text>
            {_payout < _chipsCashedOut - _reclaim + _backpay && (
              <Text style={[moneyText, { color: "red" }]}>{`Group Carry +${
                parseInt(_chipsCashedOut) -
                parseInt(_payout) -
                parseInt(_reclaim) +
                parseInt(_backpay)
              }`}</Text>
            )}
          </View>
          <Input
            value={_payout.toString(10)}
            leftIcon={<Icon name='currency-usd' size={24} color='black' />}
            onChangeText={(p) =>
              updateIfANumber(
                p,
                setPayout,
                _chipsCashedOut - _reclaim + _backpay
              )
            }
          />
        </View>

        <View style={averageRow}>
          <Button
            title='Cancel'
            type='outline'
            onPress={() => cashOut(false)}
          ></Button>
          <Button
            loading={_cashingOut}
            title={`Cash Out ${_payout}`}
            onPress={handleCashOut}
          ></Button>
        </View>

        <Text style={h5Style}>Transactions</Text>
        <ScrollView>
          {renderTransactions(
            _gameTransactions
              .filter((t) => t.memberUid === _member.id)
              .sort((a, b) => a.creationDate < b.creationDate)
          )}
        </ScrollView>
      </Overlay>

      <Overlay
        isVisible={_showAddChips}
        windowBackgroundColor='rgba(255, 255, 255, .5)'
        overlayBackgroundColor='red'
        fullScreen
      >
        <View style={vs30} />
        <Text style={h5Style}>{`Add chips for ${_member.displayName}`}</Text>

        <View style={vs10} />
        <Text>{`Group Balance: ${_memberGroupBalance}`}</Text>

        <View style={vs30} />

        <View style={spacedRow}>
          <Input
            placeholder='Chips'
            value={_chips.toString(10)}
            leftIcon={<Icon name='poker-chip' size={24} color='black' />}
            onChangeText={(p) => updateIfANumber(p, setChips)}
          />
          <CheckBox
            title='Borrowed'
            checked={_borrowed}
            onPress={() => setBorrowed(!_borrowed)}
          />
          <CheckBox
            title='Paid'
            checked={!_borrowed}
            onPress={() => setBorrowed(!_borrowed)}
          />
        </View>

        <View style={vs30} />

        <View style={averageRow}>
          <Button
            title='Cancel'
            type='outline'
            onPress={() => addChips(false)}
          ></Button>
          <Button
            loading={_addingChips}
            title='Add Chips'
            disabled={_chips < 1}
            onPress={handleAddChips}
          ></Button>
        </View>

        <Text style={h5Style}>Transactions</Text>
        <ScrollView>
          {renderTransactions(
            _gameTransactions
              .filter((t) => t.memberUid === _member.id)
              .sort((a, b) => a.creationDate < b.creationDate)
          )}
        </ScrollView>
      </Overlay>

      <View style={vs30} />
      <View style={spacedRow}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={[moneyText, { color: "grey", marginRight: 5 }]}>
            Chips in Play
          </Text>

          <Icon name='poker-chip' type='material' size={15} color='grey' />
          <Text style={[moneyText, { color: "grey", marginLeft: 5 }]}>
            {_game.chipsInPlay || 0}
          </Text>
        </View>

        <Button
          disabled={
            _game?.members &&
            Object.keys(_game?.members).filter(
              (mId) =>
                _game?.members[`${mId}`]?.borrowed?.length > 0 ||
                _game?.members[`${mId}`]?.bought?.length > 0
            ).length > 0
          }
          title='End Game'
        ></Button>
      </View>

      <View style={vs30} />

      {_game?.seating?.map((u, i) => {
        return u.taken === true ? (
          <ListItem
            key={i}
            chevron={true}
            roundAvatar
            subtitle={
              u.requested && !u.accepted ? (
                <Text>Requested</Text>
              ) : (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Icon
                    name='poker-chip'
                    type='material'
                    size={15}
                    color='green'
                  />
                  <Text style={moneyText}>
                    {renderPlayersStack(
                      xGame?.members[u.uid]?.borrowed || [],
                      xGame?.members[u.uid]?.bought || []
                    )}
                  </Text>
                </View>
              )
            }
            leftIcon={
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Icon name='seat' type='material' size={20} color='grey' />
                <Text style={[moneyText, { color: "grey" }]}>{i + 1}</Text>
              </View>
            }
            containerStyle={{
              backgroundColor: _member.id === u.uid ? "lightblue" : "lightgrey",
            }}
            title={u.displayName}
            leftAvatar={{ source: { uri: u?.photoURL } }}
            buttonGroup={
              u.requested && !u.accepted
                ? {
                    containerStyle: {
                      borderWidth: 0,
                    },
                    buttons: requestedButtons,
                  }
                : _member.id === u.uid
                ? {
                    containerStyle: {
                      backgroundColor: "lightblue",
                      borderWidth: 0,
                    },
                    buttons: playerButtons,
                  }
                : null
            }
            onPress={async () =>
              dispatch({
                type: SET_MEMBER_OF_GROUP,
                payload: { id: u.uid, ..._game.members[u.uid] },
              })
            }
          />
        ) : _.isEmpty(_member) ? (
          <ListItem
            title={`Seat ${i + 1}`}
            subtitle='No Member Selected'
          ></ListItem>
        ) : (
          <Button
            key={i}
            titleStyle={[h7Style, { color: "grey" }]}
            type='clear'
            iconRight
            title={`Move ${xMember.displayName} to ${i + 1}`}
            icon={<Icon name='seat' type='material' size={20} color='grey' />}
            onPress={() => updateSeating(i)}
          />
        );
      })}

      <Button
        icon={<Icon name='plus' size={15} color='blue' />}
        type='outline'
        title='Add To Waitlist'
        onPress={
          _game?.members[`${xMember.id}`]?.borrowed?.length > 0 ||
          _game?.members[`${xMember.id}`]?.bought?.length > 0
            ? () => {
                Alert.alert(
                  "Cash Out First",
                  "Cash Out chips first",
                  [{ text: "OK" }],
                  { cancelable: false }
                );
              }
            : () => addToWaitlist(_member)
        }
      />

      {waitList?.map((u, i) => {
        return (
          <ListItem
            key={i}
            titleStyle={h7Style}
            roundAvatar
            containerStyle={{
              backgroundColor: _member.id === u.uid ? "lightblue" : "khaki",
            }}
            onPress={async () =>
              dispatch({
                type: SET_MEMBER_OF_GROUP,
                payload: { id: u.uid, ...xGame.members[u.uid] },
              })
            }
            title={`${i + 1}. ${u.displayName}`}
            leftIcon={<Icon name='clock' size={15} />}
            leftAvatar={{ size: "small", source: { uri: u?.photoURL } }}
            rightElement={
              <Button
                icon={
                  <Icon
                    name='arrow-up'
                    type='material'
                    size={15}
                    color='grey'
                  />
                }
                type='outline'
                onPress={() => moveUpOnWaitList(i)}
              />
            }
          />
        );
      })}

      <View style={vs30} />
      <Text style={h5Style}>Game Transactions</Text>
      {_gameTransactions
        ?.sort((a, b) => a.creationDate < b.creationDate)
        .map((u, i) => {
          return (
            <ListItem
              key={i}
              roundAvatar
              containerStyle={{ height: 50 }}
              leftIcon={
                u.chipTransactionType === CHIP_TRANSATIONS.PAY_OUT ? (
                  <Icon
                    name='currency-usd'
                    type='material'
                    size={20}
                    color='grey'
                  />
                ) : u.chipTransactionType === CHIP_TRANSATIONS.RECLAIM ? (
                  <Icon
                    name='poker-chip'
                    type='material'
                    size={20}
                    color='grey'
                  />
                ) : u.chipTransactionType === CHIP_TRANSATIONS.BACKPAY ? (
                  <Icon
                    name='currency-usd'
                    type='material'
                    size={20}
                    color='grey'
                  />
                ) : u.chipTransactionType === CHIP_TRANSATIONS.CARRY ? (
                  <Icon
                    name='currency-usd'
                    type='material'
                    size={20}
                    color='grey'
                  />
                ) : u.chipTransactionType === CHIP_TRANSATIONS.BUY ? (
                  <Icon
                    name='poker-chip'
                    type='material'
                    size={20}
                    color='grey'
                  />
                ) : u.chipTransactionType === CHIP_TRANSATIONS.BORROW ? (
                  <Icon
                    name='poker-chip'
                    type='material'
                    size={20}
                    color='grey'
                  />
                ) : null
              }
              titleStyle={[moneyText, { color: "grey" }]}
              subtitleStyle={h7Style}
              subtitle={format(u.creationDate, "Pp")}
              title={`${u.memberName} ${
                u.chipTransactionType === CHIP_TRANSATIONS.PAY_OUT
                  ? "was paid"
                  : u.chipTransactionType === CHIP_TRANSATIONS.RECLAIM
                  ? "paid back"
                  : u.chipTransactionType === CHIP_TRANSATIONS.BACKPAY
                  ? "was backpaid"
                  : u.chipTransactionType === CHIP_TRANSATIONS.CARRY
                  ? "is owed"
                  : u.chipTransactionType === CHIP_TRANSATIONS.BUY
                  ? "bought"
                  : u.chipTransactionType === CHIP_TRANSATIONS.BORROW
                  ? "borrowed"
                  : null
              } ${u.amount}`}
              rightAvatar={{
                size: "small",
                source: { uri: u?.memberPhotoURL },
              }}
            />
          );
        })}
    </ScrollView>
  );
};

export default ManagePlayerInGameScreen;
