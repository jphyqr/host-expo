import React, { useEffect, useMemo, useCallback, useState } from "react";
import { View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import UnseatedPlayer from "./UnseatedPlayer";
import Animated from "react-native-reanimated";
import Page from "./Page";

/*
A horizontal ridig list with left/right buttons to animate
the next group to show

items: array of items to show
width: width of slider 
itemWidth: width of items
gutter: width of margin of items


*/

const Slider = ({ items, sliderWidth, itemWidth, gutter }) => {
  useEffect(() => {
    console.log("ITEMS CHANGED");
    f(_f + 1);
  }, [items]);

  const [_page, changePage] = useState(0);

  const [_middleItems, setMiddleItems] = useState([]);
  const [_leftItems, setLeftItems] = useState([]);
  const [_rightItems, setRightItems] = useState([]);
  const [_pages, setPages] = useState([]); // [[page1], [page2]]
  const [_f, f] = useState(1);
  const loadArrays = () => {
    console.log("LOAD ARRAYS");
    const maxNum = parseInt(
      (sliderWidth - 100) / (parseInt(itemWidth) + parseInt(gutter))
    );
    let numPages = parseInt(items.length / maxNum);
    if (items.length % maxNum > 0) numPages++;

    console.log(
      "page",
      _page,
      "maxNum",
      maxNum,
      "sliderWidth",
      sliderWidth,
      "item length",
      items.length,
      "pages",
      numPages
    );

    let loadedPages = [];

    for (var i = 0; i < numPages; i++) {
      let mI = items.slice(i * maxNum, maxNum * i + maxNum);
      loadedPages.push(mI);
    }

    console.log(loadedPages);
    setMiddleItems(loadedPages);
  };

  useEffect(() => {
    loadArrays();
    f(_f + 1);
  }, [_page]);

  useEffect(() => {
    loadArrays();
    f(_f + 1);
  }, []);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        width: sliderWidth,
        height: itemWidth + 10,
        backgroundColor: "lightgrey",
        position: "relative",
      }}
    >
      <View
        style={{
          width: 50,
          height: "100%",
          backgroundColor: "black",
          opacity: 0.7,
          zIndex: 50,
          position: "absolute",
          left: 0,
          top: 0,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <TouchableOpacity onPress={() => changePage(_page - 1)}>
          <Icon name='arrow-left' color='white' size={30} />
        </TouchableOpacity>
      </View>

      <View
        style={{
          width: sliderWidth - 100,
          flexDirection: "row",
          backgroundColor: "green",
          left: 100,

          bottom: 0,
          position: "absolute",
        }}
      >
        <View style={{ position: "reative" }}>
          {_middleItems.map((page, i) => {
            return (
              <Page
                sliderWidth={sliderWidth}
                gutter={gutter}
                page={page}
                activePageIndex={_page}
                key={i}
                i={i}
              />
            );
          })}
        </View>
      </View>
      <View
        style={{
          width: 50,
          height: "100%",
          justifyContent: "center",
          backgroundColor: "black",
          zIndex: 20,
          position: "absolute",
          right: 0,
          alignItems: "center",
          opacity: 0.7,
        }}
      >
        <TouchableOpacity onPress={() => changePage(_page + 1)}>
          <Icon name='arrow-right' color='white' size={30} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Slider;
