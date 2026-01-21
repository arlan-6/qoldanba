import { useContext } from "react";
import { Sidebar, Search, FloorOption } from "../components";
import { MapContext } from "../shared";
import ShowIOS from "./ShowIOS";
import Show from "./Show";

const Home = ({ isIOS }) => {
  const { selectedBlockOption, selectedFloorOption } = useContext(MapContext);

  return (
    <div className="">
      <FloorOption />
      <Search />
      {/* <Sidebar /> */}
      {isIOS ? (
        <ShowIOS
          selectedFloorBlockOption={selectedFloorOption + selectedBlockOption}
        />
      ) : (
        <Show
          selectedFloorBlockOption={selectedFloorOption + selectedBlockOption}
        />
      )}
    </div>
  );
};

export default Home;
