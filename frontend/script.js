class Board {
  el;
  data;

  constructor(el, data = []) {
    this.el = el;
    this.data = data;
  }

  //getData
  getData = async () => {
    const board = await getBoard("todoboard");
    this.data = board.lists;
  };

  //renderALl
  renderAll = async (data) => {
    const yes = data.map((list) => {
      return getListById(list._id);
    });
    const promisedList = await Promise.all(yes);

    const lists = promisedList.map((list) => {
      return `
        <div id="${list._id}" class="listDiv">
            <div class="listName">
                <span id="name-${list._id}" class="listNameSpan">${
        list.name
      }</span>
                <span class="deleteList" id="delete-${list._id}">\u00D7</span>
            </div>
            <input type="text" id="inputTask-${
              list._id
            }" class="inputTask" placeholder="Add another task...">
            <button id="buttonAddTask-${list._id}" class="addTask">Add</button>
            <ul>
                ${this.renderList(list.tasks)}
            </ul>
        </div>
        `;
    });
    this.el.innerHTML = lists.join("");
  };

  //renderList
  renderList = (data) => {
    const tasks = data.map((task) => {
      const styleSpanWhenChecked = task.checked
        ? "text-decoration:line-through;text-decoration-thickness:2px;"
        : "";
      return `
        <li id="${task._id}" class="list">
            <input type="checkbox" class="checkbox" id="checkbox-${task._id}" ${
        task.checked ? "checked" : ""
      }>
            <span class="taskName" id="taskName-${
              task._id
            }" style=${styleSpanWhenChecked}>${task.name}</span>
            <span class="delete" id="delete-${task._id}">\u00D7</span>
        </li>
        `;
    });
    return tasks.join("");
  };

  //addList
  addList = async (event) => {
    if (inputList.value === "") return;
    const listName = inputList.value;
    const newList = await postList({
      name: listName,
    });
    this.data = [...this.data, newList];
    await this.renderAll(this.data);
    inputList.value = "";
  };

  //addTask
  addTask = async (event) => {
    const button = document.getElementById(event.target.id);
    const listDiv = button.closest(".listDiv");
    const inputTask = listDiv.querySelector(".inputTask");
    if (inputTask.value === "") return;
    const taskName = inputTask.value;
    const newTask = await postTaskToOneList(listDiv.id, {
      name: taskName,
      checked: false,
    });
    this.data.forEach((l) => {
      if (l._id === listDiv.id) {
        l.tasks = l.tasks.concat(newTask);
      }
    });
    await this.renderAll(this.data);
    inputTask.value = "";
  };

  buttonAddTask = () => {
    this.el.addEventListener("click", async (event) => {
      if (event.target.matches(".addTask")) {
        await this.addTask(event);
      }
    });
  };

  //onClickCheckbox;
  onClickCheckbox = () => {
    this.el.addEventListener("click", async (event) => {
      if (event.target.matches(".checkbox")) {
        const checkbox = document.getElementById(event.target.id);
        const li = checkbox.closest(".list");
        const listDiv = checkbox.closest(".listDiv");
        await updateCheckedStatus(listDiv.id, {
          id: li.id,
          checked: checkbox.checked,
        });
        this.data.forEach((l) => {
          if (l._id === listDiv.id) {
            l.tasks.forEach((t) => {
              if (t._id === li.id) {
                t.checked = !t.checked;
              }
            });
          }
        });
        this.renderAll(this.data);
      }
    });
  };

  //onClickDeleteList
  onClickDeleteList = () => {
    this.el.addEventListener("click", async (event) => {
      if (event.target.matches(".deleteList")) {
        const del = document.getElementById(event.target.id);
        const listDiv = del.closest(".listDiv");
        await deleteListById(listDiv.id);
        this.data = this.data.filter((l) => l._id !== listDiv.id);
        await this.renderAll(this.data);
      }
    });
  };

  //onClickDeleteTask
  onClickDeleteTask = () => {
    this.el.addEventListener("click", async (event) => {
      if (event.target.matches(".delete")) {
        const del = document.getElementById(event.target.id);
        const li = del.closest(".list");
        const listDiv = del.closest(".listDiv");
        await deleteTaskFromOneList(listDiv.id, li.id);
        this.data.forEach((l) => {
          if (l._id === listDiv.id) {
            l.tasks = l.tasks.filter((t) => t._id !== li.id);
          }
        });
        await this.renderAll(this.data);
      }
    });
  };

  reorderTask = async (from, to) => {
    const newListsArray = [...this.data[to[0]].tasks];
    console.log(">>> new list array", newListsArray);
    if (from[0] === to[0]) {
      newListsArray.splice(to[1], 0, newListsArray.splice(from[1], 1)[0]);
      console.log(newListsArray);
      this.data[to[0]].tasks = [...newListsArray];

      await updateListById({
        id: this.data[to[0]]._id,
        tasks: this.data[to[0]].tasks,
      });

      await this.getData();
      await this.renderAll(this.data);
    } else {
      const listIdToRemove = this.data[from[0]]._id;
      const taskIdToRemove = this.data[from[0]].tasks[from[1]];
      const listIdToPost = this.data[to[0]]._id;

      const task = await getTaskById(listIdToRemove, taskIdToRemove);

      await postTaskToOneList(listIdToPost, {
        name: task.name,
        checked: task.checked,
      });

      await deleteTaskFromOneList(listIdToRemove, taskIdToRemove);

      await this.getData();
      await this.renderAll(this.data);
    }
  };

  onMouseDownTask = () => {
    this.el.addEventListener("mousedown", (event) => {
      if (event.target.matches(".taskName")) {
        const taskNameSpan = document.getElementById(event.target.id);
        const li = taskNameSpan.closest(".list");
        const listDiv = taskNameSpan.closest(".listDiv");

        let listDivIndexMoveFrom = this.data.findIndex(
          (l) => l._id === listDiv.id
        );

        let liIndexMoveFrom = this.data[listDivIndexMoveFrom].tasks.findIndex(
          (l) => l === li.id
        );

        const liClone = li.cloneNode();
        liClone.innerHTML = li.innerHTML;
        listDiv.appendChild(liClone);

        const rect = li.getBoundingClientRect();

        liClone.style.position = "absolute";
        liClone.style.zIndex = 1000;
        liClone.style.backgroundColor = "whitesmoke";
        li.style.visibility = "hidden";

        let distLeft = event.clientX - rect.left;
        let distTop = event.clientY - rect.top;

        move(event.pageX, event.pageY);

        //move
        function move(pageX, pageY) {
          liClone.style.left =
            pageX - distLeft - 20 - 372 * listDivIndexMoveFrom + "px";
          liClone.style.top = pageY - distTop - 96 + "px";
        }

        const onMouseMove = (event) => {
          move(event.pageX, event.pageY);
          liClone.style.pointerEvents = "none";
        };

        const onMouseUp = async (event) => {
          const listDivMoveTo = event.target.closest(".listDiv");
          let listDivIndexMoveTo =
            listDivMoveTo !== null
              ? this.data.findIndex((l) => l._id === listDivMoveTo.id)
              : listDivIndexMoveFrom;

          const liMoveTo = event.target.closest(".list");
          const liIndexMoveTo =
            liMoveTo !== null
              ? this.data[listDivIndexMoveTo].tasks.findIndex(
                  (l) => l === liMoveTo.id
                )
              : liIndexMoveFrom;

          await this.reorderTask(
            [listDivIndexMoveFrom, liIndexMoveFrom],
            [listDivIndexMoveTo, liIndexMoveTo]
          );

          document.removeEventListener("mousemove", onMouseMove);
          document.removeEventListener("mouseup", onMouseUp);
        };

        // const listClone
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
      }
    });
  };

  reorderList = async (from, to) => {
    const newListsArray = [...this.data];
    newListsArray.splice(to, 0, newListsArray.splice(from, 1)[0]);
    await updateBoard({ lists: newListsArray });
    this.data = [...newListsArray];
    await this.renderAll(this.data);
  };

  onMouseDownList = () => {
    this.el.addEventListener("mousedown", (event) => {
      if (event.target.matches(".listNameSpan")) {
        const listNameSpan = document.getElementById(event.target.id);
        const listDiv = listNameSpan.closest(".listDiv");

        let listIndexMoveFrom = this.data.findIndex(
          (l) => l._id === listDiv.id
        );

        console.log(listIndexMoveFrom);

        const listClone = listDiv.cloneNode();
        listClone.innerHTML = listDiv.innerHTML;
        this.el.appendChild(listClone);

        const rect = listDiv.getBoundingClientRect();

        //create a clone <li> based on the coordinates retrieved
        //styling the clone as absolute so the relativity of <ul> does not affect its movement
        //hide the original <li> when onmousedown is detected, leaving only the clone visible
        listClone.style.position = "absolute";
        listClone.style.zIndex = 1000;
        listClone.style.backgroundColor = "whitesmoke";
        listDiv.style.visibility = "hidden";

        //get the correlative distance between the mouseclick point and the xy-axis
        //when the mouse moves, the <li> moves accordingly
        let distLeft = event.clientX - rect.left;
        let distTop = event.clientY - rect.top;

        move(event.pageX, event.pageY);

        //move
        function move(pageX, pageY) {
          listClone.style.left = pageX - distLeft - 20 + "px";
          listClone.style.top = pageY - distTop - 96 + "px";
        }

        const onMouseMove = (event) => {
          move(event.pageX, event.pageY);
          listClone.style.pointerEvents = "none";
        };

        const onMouseUp = async (event) => {
          const listDivMoveTo = event.target.closest(".listDiv");
          console.log(listDivMoveTo);
          const listIndexMoveTo =
            listDivMoveTo !== null
              ? this.data.findIndex((l) => l._id === listDivMoveTo.id)
              : listIndexMoveFrom;
          await this.reorderList(listIndexMoveFrom, listIndexMoveTo);

          document.removeEventListener("mousemove", onMouseMove);
          document.removeEventListener("mouseup", onMouseUp);
        };

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
      }
    });
  };
}

//init = ()
const div = new Board(document.getElementById("todoboard"));

div.getData().then(() => {
  div.renderAll(div.data);
});

const buttonList = document.querySelector(".addList");
const inputList = document.querySelector(".inputList");

//add task to one list
div.buttonAddTask();

//add list
buttonList.addEventListener("click", async () => {
  await div.addList();
});
inputList.addEventListener("keypress", async (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    await div.addList();
  }
});

//deleteTask
div.onClickDeleteTask();
div.onClickDeleteList();
div.onClickCheckbox();
div.onMouseDownList();
div.onMouseDownTask();
