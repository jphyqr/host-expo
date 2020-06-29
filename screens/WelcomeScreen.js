import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import Slides from "../components/Slides";
import { AppLoading } from "expo";
const SLIDE_DATA = [{ text: "Private Host", color: "#03A9F4" }];

const WelcomeScreen = ({ navigation }) => {
  const auth = useSelector((state) => state.firebase.auth);

  const onSlidesComplete = () => {
    navigation.navigate("Auth");
  };

  useEffect(() => {
    if (auth?.isLoaded && !auth.isEmpty) {
      navigation.navigate("Main");
    }
  }, [auth]);
  if (!auth?.isLoaded) {
    return <AppLoading />;
  }

  return <Slides data={SLIDE_DATA} onComplete={onSlidesComplete} />;
};

export default WelcomeScreen;
