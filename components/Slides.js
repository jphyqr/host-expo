import React from "react";

import { View, Text, ScrollView, Dimensions } from "react-native";
import { Button } from "react-native-elements";

const SCREEN_WIDTH = Dimensions.get("window").width;
const Slides = ({ data, onComplete }) => {
  const renderLastSlide = (index) => {
    if (index === data.length - 1) {
      return (
        <Button
          title="Begin"
          buttonStyle={styles.buttonStyle}
          onPress={onComplete}
        />
      );
    }
  };

  const renderSlides = () => {
    return data.map((slide, index) => {
      return (
        <View
          key={slide.text}
          style={[styles.slideStyle, { backgroundColor: slide.color }]}
        >
          <Text style={styles.textStyle}>{slide.text}</Text>
          {renderLastSlide(index)}
        </View>
      );
    });
  };

  return (
    <ScrollView horizontal style={{ flex: 1 }} pagingEnabled>
      {renderSlides()}
    </ScrollView>
  );
};

const styles = {
  slideStyle: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: SCREEN_WIDTH,
  },
  textStyle: {
    fontSize: 30,
    color: "white",
  },
  buttonStyle: {
    backgroundColor: "#0288D1",
    marginTop: 15,
  },
};

export default Slides;
