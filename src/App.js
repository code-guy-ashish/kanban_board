import { useState } from 'react';
import './App.css';
import Board from './Components/Board/Board';
import Editable from './Components/Editable/Editable';
import { useEffect } from 'react';


function App() {

  const [boards, setBoards] = useState([]);
  const [target, setTarget] = useState({
    cid: "",
    bid: "",
  });
  const [c, setc] = useState("");

  useEffect(() => {
    const local_boards = JSON.parse(localStorage.getItem("boards") ? localStorage.getItem("boards") : "[]");
    if (local_boards?.length !== 0) {
      setBoards(local_boards);
    }
  }, [])


  useEffect(() => {
    localStorage.setItem("boards", boards.length !== 0 ? JSON.stringify(boards) : "[]");
    boards?.forEach((board_item) => {
      board_item.location_bound = document.getElementById(board_item.id).getBoundingClientRect();
    })
  }, [boards])




  const touchend = (scid, sbid, tclientX, tclientY) => {
    let s_bIndex = boards.findIndex(item => item.id === sbid);
    if (s_bIndex < 0) return;

    let s_cIndex = boards[s_bIndex].cards?.findIndex(item => item.id === scid);
    if (s_cIndex < 0) return;

    // console.log("Source Card: ", boards[s_bIndex].cards[s_cIndex]);
    // console.log("Click End Coordinates: (", tclientX, ",", tclientY, ")");

    boards.forEach((item) => {
      let xstart, xend, ystart, yend;

      let t_board = boards.findIndex(i => i.id === item.id);

      xstart = item.location_bound.x;
      xend = item.location_bound.right;
      ystart = item.location_bound.y;
      yend = item.location_bound.bottom;
      if (tclientX >= xstart && tclientX <= xend && tclientY >= ystart && tclientY <= yend) {
        const tempBoards = [...boards];
        const tempCard = tempBoards[s_bIndex].cards[s_cIndex];

        tempBoards[s_bIndex].cards.splice(s_cIndex, 1);
        tempBoards[t_board].cards.push(tempCard);

        setBoards(tempBoards);
        sortCards();
      }
    })


  }


  const sortCards = () => {
    const temp_board = [...boards];
    temp_board.forEach((item) => {
      let data = item.cards;
      data.sort((a, b) => {
        return a.t_stamp - b.t_stamp
      })
    })

    setBoards(temp_board);
  }

  const addBoard = (title) => {
    setBoards([...boards, {
      id: Date.now() + Math.random(),
      title,
      cards: [],
    },]);
  };

  const removeBoard = (bid) => {
    const tempBoards = boards.filter(item => item.id !== bid)
    setBoards(tempBoards);
  };

  const desc_shorthand = (description) => {
    let desc_arr = description.split(" ");
    let desc_arr_len = desc_arr.length;
    if (desc_arr_len > 4)
      description = desc_arr.slice(0, 4).join(" ") + '...';
    if (description === "")
      description = "No Description";

    return description;
  }

  const addCard = (title = "No title", bid, description, label, lab_col) => {
    let date = new Date();
    const card = {
      id: Date.now() + Math.random(),
      title: title ? title : "No Title",
      labels: label === "" ? [] : label.split(/[ ,]+/),
      label_colors: lab_col,
      tasks: [],
      date: `${String(date.getDate()).padStart(2, 0)} ${['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'][date.getMonth()]},  ${String(date.getHours()).padStart(2, 0)}:${String(date.getMinutes()).padStart(2, 0)} ${date.getHours() < 12 ? 'AM' : 'PM'}`,
      t_stamp: new Date().getTime(),
      desc: desc_shorthand(description),
      real_desc: description,
    };

    const index = boards.findIndex(item => item.id === bid);
    if (index < 0) return;
    const tempBoards = [...boards];
    tempBoards[index].cards.push(card);
    setBoards(tempBoards);
    sortCards();
  };

  const editCardValues = (cid, bid, title, descc, label) => {
    let b_index = boards.findIndex(item => item.id === bid);
    let c_index = boards[b_index].cards?.findIndex(item => item.id === cid);
    const colors = ["#a8193d", "#4fcc25", "#1ebffa", "#8da377", "#9975bd", "#cf61a1", "#240959",];
    let labels = label.split(/[ ,]+/);
    if (labels[0] === '')
      labels.pop();
    const tempBoards = [...boards];

    tempBoards[b_index].cards[c_index].title = title;
    tempBoards[b_index].cards[c_index].title = title;
    tempBoards[b_index].cards[c_index].labels = labels;
    labels.forEach((e) => {
      tempBoards[b_index].cards[c_index].label_colors.push(colors[Math.floor(Math.random() * colors.length)]);
    })
    tempBoards[b_index].cards[c_index].real_desc = descc;
    tempBoards[b_index].cards[c_index].desc = desc_shorthand(descc);

    setBoards(tempBoards);
  }

  const vis_cid = (cid) => {
    console.log("cid", cid, typeof cid);
    setTimeout(() => {

      setc(cid.toString());
      console.log("statec", c);
    }, 2000);
  }
  const handleDragEnter = (cid, bid) => {
    setTarget({
      cid,
      bid,
    });
  };

  const handleDragEnd = (cid, bid) => {
    let s_bIndex, s_cIndex, t_bIndex, t_cIndex;
    if (cid !== null)
      document.getElementById(cid).style.opacity = "1";

    s_bIndex = boards.findIndex(item => item.id === bid);
    if (s_bIndex < 0) return;

    s_cIndex = boards[s_bIndex].cards?.findIndex(item => item.id === cid);
    if (s_cIndex < 0) return;

    t_bIndex = boards.findIndex(item => item.id === target.bid);
    if (t_bIndex < 0) return;

    t_cIndex = boards[t_bIndex].cards?.findIndex(item => item.id === target.cid);
    if (target.cid === null) t_cIndex = 0;
    if (t_cIndex < 0) return;

    const tempBoards = [...boards];
    const tempCard = tempBoards[s_bIndex].cards[s_cIndex];

    tempBoards[s_bIndex].cards.splice(s_cIndex, 1);
    tempBoards[t_bIndex].cards.splice(t_cIndex, 0, tempCard);

    setBoards(tempBoards);
    sortCards();

  }

  const removeCard = (cid, bid) => {
    const bIndex = boards.findIndex((item) => item.id === bid);
    if (bIndex < 0) return;

    const cIndex = boards[bIndex].cards.findIndex((item) => item.id === cid);
    if (cIndex < 0) return;

    const tempBoards = [...boards];
    tempBoards[bIndex].cards.splice(cIndex, 1);
    setBoards(tempBoards);

  };


  return (
    <div data-testid="App" className="app">
      <div className="app_navbar">
        <h2>Kanban Board</h2>
      </div>
      <div className="app_outer">
        <div className="app_boards">
          {
            boards?.map((item) => {
              return <Board
                key={item.id}
                board={item}
                removeBoard={removeBoard}
                addCard={addCard}
                removeCard={removeCard}
                handleDragEnter={handleDragEnter}
                handleDragEnd={handleDragEnd}
                editcard={editCardValues}
                v={vis_cid}
                touchend={touchend}
              />
            })
          }
          <div className="app_boards_board">
            <Editable
              text="Add New State"
              placeholder="Enter State Title"
              onSubmit={(value) => addBoard(value)} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
