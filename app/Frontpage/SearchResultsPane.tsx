import React, { CSSProperties, useEffect, useState } from "react";
import { VidispineItem } from "../vidispine/item/VidispineItem";
import ItemTile from "./ItemTile";
import { FixedSizeGrid, GridChildComponentProps } from "react-window";

interface SearchResultsPaneProps {
  results: VidispineItem[];
  parentRef: React.RefObject<HTMLDivElement>;
  onItemClicked: (itemId: string) => void;
}

const SearchResultsPane: React.FC<SearchResultsPaneProps> = (props) => {
  const [dimensions, setDimensions] = useState({
    height: window.innerHeight,
    width: window.innerWidth,
  });

  //tile sizes, in pixels
  const tileWidth = 240;
  const tileHeight = 220;
  const tileMargin = 20;

  //react-window uses absolute positioning so we need to do a bit of maths...
  const totalResults = props.results.length;
  const columnCount = Math.floor(dimensions.width / (tileWidth + tileMargin));
  const rowCount = Math.ceil(totalResults / columnCount);

  useEffect(() => {
    if (props.parentRef.current) {
      const parentDiv = props.parentRef.current as HTMLDivElement;
      const newval = {
        height: parentDiv.clientHeight,
        width: parentDiv.clientWidth,
      };

      setDimensions(newval);
      console.log("debug: set search results pane to ", newval);
    }
  }, [props.parentRef]);

  const itemTileContainer = (childProps: GridChildComponentProps) => {
    const { columnIndex, rowIndex, style } = childProps;
    const itemIndex = rowIndex * columnCount + columnIndex;

    const outerDivStyle = Object.assign({} as CSSProperties, style, {
      marginLeft: tileMargin / 2,
      marginRight: tileMargin / 2,
    });
    return itemIndex < totalResults ? (
      <div style={outerDivStyle}>
        <ItemTile
          item={props.results[itemIndex]}
          imageMaxWidth={240}
          imageMaxHeight={135}
          onClick={props.onItemClicked}
        />
      </div>
    ) : (
      <></>
    );
  };

  return (
    <FixedSizeGrid
      columnCount={columnCount}
      columnWidth={tileWidth + tileMargin}
      height={dimensions.height}
      rowCount={rowCount}
      rowHeight={tileHeight + tileMargin}
      width={dimensions.width}
    >
      {itemTileContainer}
    </FixedSizeGrid>
  );
};

export default SearchResultsPane;
