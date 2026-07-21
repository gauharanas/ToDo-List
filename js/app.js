/*=========================================================
    TASKFLOW
    Modern Todo App
    Part 1
=========================================================*/

/*=========================================================
    DOM ELEMENTS
=========================================================*/

const taskInput = document.getElementById("taskInput");
const category = document.getElementById("category");
const priority = document.getElementById("priority");
const dueDate = document.getElementById("dueDate");
const addTaskBtn = document.getElementById("addTask");

const searchInput = document.getElementById("searchInput");

const taskContainer = document.getElementById("taskContainer");
const emptyState = document.getElementById("emptyState");

const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const remainingTasks = document.getElementById("remainingTasks");
const overdueTasks = document.getElementById("overdueTasks");

const progressFill = document.getElementById("progressFill");
const progressCount = document.getElementById("progressCount");

const clearCompletedBtn = document.getElementById("clearCompleted");

const filterButtons = document.querySelectorAll(".filter");
const sortSelect = document.getElementById("sortTasks");

const themeToggle = document.getElementById("themeToggle");

/*=========================================================
    APPLICATION STATE
=========================================================*/

let tasks = JSON.parse(localStorage.getItem("taskflow")) || [];

let searchText = "";

let currentFilter = "All";

let currentSort = "Newest";

/*=========================================================
    LOCAL STORAGE
=========================================================*/

function saveTasks() {
  localStorage.setItem("taskflow", JSON.stringify(tasks));
}

function loadTasks() {
  const saved = localStorage.getItem("taskflow");

  tasks = saved ? JSON.parse(saved) : [];
}

/*=========================================================
    THEME
=========================================================*/

function initializeTheme() {
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark");

    themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
  }
}

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  const dark = document.body.classList.contains("dark");

  themeToggle.innerHTML = dark
    ? '<i class="fa-solid fa-sun"></i>'
    : '<i class="fa-solid fa-moon"></i>';

  localStorage.setItem("theme", dark ? "dark" : "light");
});

/*=========================================================
    ADD TASK
=========================================================*/

function addTask() {
  const title = taskInput.value.trim();

  if (title === "") {
    alert("Please enter a task.");

    return;
  }

  const task = {
    id: Date.now(),

    title: title,

    category: category.value,

    priority: priority.value,

    dueDate: dueDate.value,

    completed: false,

    createdAt: Date.now(),
  };

  tasks.unshift(task);

  saveTasks();

  clearInputs();

  renderTasks();
}

addTaskBtn.addEventListener("click", addTask);

taskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    addTask();
  }
});

/*=========================================================
    CLEAR INPUTS
=========================================================*/

function clearInputs() {
  taskInput.value = "";

  dueDate.value = "";
}

/*=========================================================
    DELETE TASK
=========================================================*/

function deleteTask(id) {
  tasks = tasks.filter((task) => {
    return task.id !== id;
  });

  saveTasks();

  renderTasks();
}

/*=========================================================
    COMPLETE / UNDO
=========================================================*/

function toggleTask(id) {
  tasks.forEach((task) => {
    if (task.id === id) {
      task.completed = !task.completed;
    }
  });

  saveTasks();

  renderTasks();
}

/*=========================================================
    EDIT TASK
=========================================================*/

function editTask(id) {
  const task = tasks.find((t) => t.id === id);

  if (!task) return;

  const updated = prompt("Edit Task", task.title);

  if (updated === null) return;

  const value = updated.trim();

  if (value === "") return;

  task.title = value;

  saveTasks();

  renderTasks();
}

/*=========================================================
    DATE HELPERS
=========================================================*/

function isOverdue(task) {
  if (!task.dueDate) return false;

  if (task.completed) return false;

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const due = new Date(task.dueDate);

  return due < today;
}

function formatDate(date) {
  if (!date) {
    return "No Due Date";
  }

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const due = new Date(date);

  due.setHours(0, 0, 0, 0);

  const diff = (due - today) / (1000 * 60 * 60 * 24);

  if (diff === 0) return "Today";

  if (diff === 1) return "Tomorrow";

  if (diff < 0) return "Overdue";

  return due.toLocaleDateString();
}

/*=========================================================
    SEARCH
=========================================================*/

searchInput.addEventListener("input", (e) => {
  searchText = e.target.value.toLowerCase();

  renderTasks();
});

/*=========================================================
    RENDER TASKS
=========================================================*/

function renderTasks() {

    taskContainer.innerHTML = "";

    let filtered = [...tasks];

    /*=========================
        SEARCH
    =========================*/

    filtered = filtered.filter(task => {

        return (

            task.title
                .toLowerCase()
                .includes(searchText)

            ||

            task.category
                .toLowerCase()
                .includes(searchText)

            ||

            task.priority
                .toLowerCase()
                .includes(searchText)

        );

    });

    /*=========================
        FILTER
    =========================*/

    switch (currentFilter) {

        case "Active":

            filtered = filtered.filter(task =>

                !task.completed

            );

            break;

        case "Completed":

            filtered = filtered.filter(task =>

                task.completed

            );

            break;

        case "Today":

            filtered = filtered.filter(task =>

                formatDate(task.dueDate) === "Today"

            );

            break;

        case "Overdue":

            filtered = filtered.filter(task =>

                isOverdue(task)

            );

            break;

    }

    /*=========================
        SORT
    =========================*/

    switch (currentSort) {

        case "Newest":

            filtered.sort(

                (a, b) => b.createdAt - a.createdAt

            );

            break;

        case "Oldest":

            filtered.sort(

                (a, b) => a.createdAt - b.createdAt

            );

            break;

        case "Alphabetically":

            filtered.sort(

                (a, b) =>

                a.title.localeCompare(b.title)

            );

            break;

        case "Priority":

            const rank = {

                High: 1,

                Medium: 2,

                Low: 3

            };

            filtered.sort(

                (a, b) =>

                rank[a.priority] -

                rank[b.priority]

            );

            break;

        case "Due Date":

            filtered.sort(

                (a, b) =>

                    new Date(a.dueDate || "9999-12-31")

                    -

                    new Date(b.dueDate || "9999-12-31")

            );

            break;

    }

    /*=========================
        EMPTY STATE
    =========================*/

    if (filtered.length === 0) {

        emptyState.style.display = "block";

        taskContainer.style.display = "none";

    }

    else {

        emptyState.style.display = "none";

        taskContainer.style.display = "grid";

    }

    /*=========================
        CREATE TASK CARD
    =========================*/

    filtered.forEach(task => {

        const card = document.createElement("div");

        card.className = "task-card";

        card.dataset.id = task.id;

        card.draggable = true;

        card.innerHTML = `

<div class="task-left">

<h3 class="task-title ${task.completed ? "completed" : ""}">

${task.title}

</h3>

<div class="badges">

<span class="badge ${task.category.toLowerCase()}">

${task.category}

</span>

<span class="badge ${task.priority.toLowerCase()}">

${task.priority}

</span>

</div>

<div class="task-date ${isOverdue(task) ? "overdue" : ""}">

<i class="fa-solid fa-calendar-days"></i>

${formatDate(task.dueDate)}

</div>

</div>

<div class="task-actions">

<button class="action-btn edit">

<i class="fa-solid fa-pen"></i>

</button>

<button class="action-btn ${task.completed ? "undo" : "complete"}">

<i class="fa-solid ${task.completed ? "fa-xmark" : "fa-check"}"></i>

</button>

<button class="action-btn delete">

<i class="fa-solid fa-trash"></i>

</button>

</div>

`;

        card.querySelector(".edit")

            .addEventListener(

                "click",

                () => editTask(task.id)

            );

        card.querySelector(".delete")

            .addEventListener(

                "click",

                () => deleteTask(task.id)

            );

        card.querySelector(".complete,.undo")

            .addEventListener(

                "click",

                () => toggleTask(task.id)

            );

        taskContainer.appendChild(card);

    });

    updateDashboard();

}

/*=========================================================
    DASHBOARD
=========================================================*/

function updateDashboard() {

    const total = tasks.length;

    const completed =

        tasks.filter(

            task => task.completed

        ).length;

    const remaining =

        total - completed;

    const overdue =

        tasks.filter(

            task => isOverdue(task)

        ).length;

    totalTasks.textContent = total;

    completedTasks.textContent = completed;

    remainingTasks.textContent = remaining;

    overdueTasks.textContent = overdue;

    progressCount.textContent =

        `${completed} / ${total}`;

    const percent =

        total === 0

            ?

            0

            :

            (completed / total) * 100;

    progressFill.style.width =

        percent + "%";

}

/*=========================================================
    FILTER BUTTONS
=========================================================*/

filterButtons.forEach(button => {

    button.addEventListener(

        "click",

        () => {

            filterButtons.forEach(btn =>

                btn.classList.remove("active")

            );

            button.classList.add("active");

            currentFilter =

                button.textContent.trim();

            renderTasks();

        }

    );

});

/*=========================================================
    SORT
=========================================================*/

sortSelect.addEventListener(

    "change",

    () => {

        currentSort =

            sortSelect.value;

        renderTasks();

    }

);

/*=========================================================
    CLEAR COMPLETED
=========================================================*/

clearCompletedBtn.addEventListener(

    "click",

    () => {

        tasks = tasks.filter(task =>

            !task.completed

        );

        saveTasks();

        renderTasks();

    }

);

/*=========================================================
    INITIALIZE
=========================================================*/

loadTasks();

initializeTheme();

renderTasks();


