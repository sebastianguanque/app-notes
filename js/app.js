const addBox = document.querySelector(".add-box");
const popupBox = document.querySelector(".popup-box");
const popupTitle = popupBox.querySelector("header p");

const closeIcon = popupBox.querySelector("header i");
const titleTag = popupBox.querySelector("input");
const taskInput = popupBox.querySelector(".task-input");
const taskList = popupBox.querySelector(".task-list");
const addTaskBtn = popupBox.querySelector(".add-task-btn");
const addBtn = popupBox.querySelector(".add-btn");

const months = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const notes = JSON.parse(localStorage.getItem("notes") || "[]");
let isUpdate = false,
  updateId;

addBox.addEventListener("click", () => {
  popupTitle.innerText = "Agregar nueva Nota";
  addBtn.innerText = "Agregar Nota";
  popupBox.classList.add("show");
  document.querySelector("body").style.overflow = "hidden";
  titleTag.value = "";
  taskInput.value = "";
  taskList.innerHTML = "";
  if (window.innerWidth > 660) titleTag.focus();
});

closeIcon.addEventListener("click", () => {
  isUpdate = false;
  titleTag.value = "";
  taskInput.value = "";
  taskList.innerHTML = "";
  popupBox.classList.remove("show");
  document.querySelector("body").style.overflow = "auto";
});

addTaskBtn.addEventListener("click", (e) => {
  const taskText = taskInput.value.trim();
  if (taskText) {
    const li = document.createElement("li");
    li.innerHTML = `<label>
      <input type='checkbox'> 
      <p>${taskText}</p>
    </label>
    <i class="ri-close-line"></i>`;
    taskList.appendChild(li);
    taskInput.value = "";
  }
});
taskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault(); // evita que se envíe el formulario
    addTaskBtn.click(); // simula el click al botón
  }
});

function showNotes() {
  if (!notes) return;
  document.querySelectorAll(".note").forEach((li) => li.remove());

  notes.forEach((note, id) => {
    if (!note.tasks || !Array.isArray(note.tasks)) return;

    let tasksHtml = note.tasks
      .map(
        (task, taskId) =>
          `<li>
            <label>
              <input type='checkbox' data-note-id='${id}' data-task-id='${taskId}' ${
            task.done ? "checked" : ""
          }>
              <p style="text-decoration: ${
                task.done ? "line-through" : "none"
              }">${task.text}</p>
            </label>	
            <i class="ri-close-line delete-task" data-note-id='${id}' data-task-id='${taskId}'></i>
          </li>`
      )
      .join("");

    let liTag = `<li class="note" data-note-id="${id}">
        <div class="details">
          <p>${note.title}</p>
          <ul>${tasksHtml}</ul>
        </div>
        <div class="bottom-content">
          <span>${note.date}</span>
          <div class="settings">
              <span onclick="deleteNote(${id})">
                <i class="ri-delete-bin-line"></i>
                <span>Eliminar</p>
              </span>
          </div>
        </div>
      </li>`;

    addBox.insertAdjacentHTML("afterend", liTag);

    const noteElem = addBox.nextElementSibling;

    noteElem.addEventListener("click", (e) => {
      const tag = e.target.tagName.toLowerCase();

      // Evita activar si se hizo clic en p, input, ul, li, i o label
      if (["p", "input", "ul", "i", "label", "span"].includes(tag)) return;

      updateNote(id);
    });
  });

  document
    .querySelectorAll(".note input[type='checkbox']")
    .forEach((checkbox) => {
      checkbox.addEventListener("change", (e) => {
        const noteId = e.target.getAttribute("data-note-id");
        const taskId = e.target.getAttribute("data-task-id");

        notes[noteId].tasks[taskId].done = e.target.checked;
        localStorage.setItem("notes", JSON.stringify(notes));
        showNotes(); // volver a renderizar para aplicar el estilo de tachado
      });
    });

  // 🗑️ Escuchar eventos para eliminar tareas desde la vista
  document.querySelectorAll(".note .delete-task").forEach((icon) => {
    icon.addEventListener("click", (e) => {
      const noteId = e.target.getAttribute("data-note-id");
      const taskId = e.target.getAttribute("data-task-id");

      notes[noteId].tasks.splice(taskId, 1); // eliminar la tarea
      localStorage.setItem("notes", JSON.stringify(notes));
      showNotes(); // volver a mostrar actualizado
    });
  });
}
showNotes();

function showMenu(elem) {
  elem.parentElement.classList.add("show");
  document.addEventListener("click", (e) => {
    if (e.target.tagName != "I" || e.target != elem) {
      elem.parentElement.classList.remove("show");
    }
  });
}

function deleteNote(noteId) {
  let confimDel = confirm("¿Seguro que quieres eliminar esta nota?");
  if (!confimDel) return;

  notes.splice(noteId, 1);
  localStorage.setItem("notes", JSON.stringify(notes));
  showNotes();
}

function updateNote(noteId) {
  updateId = noteId;
  isUpdate = true;
  const note = notes[noteId];
  addBox.click();
  titleTag.value = note.title;
  taskList.innerHTML = "";
  addBtn.innerText = "Guardar Nota";
  popupTitle.innerText = "Actualizar Nota";
  taskInput.value = "";
  note.tasks.forEach((task) => {
    const li = document.createElement("li");
    li.innerHTML = `<label>
    <input type='checkbox' ${task.done ? "checked" : ""}> <p>${task.text}</p>
    </label>
    <i class="ri-close-line"></i>`;
    taskList.appendChild(li);
  });
}

addBtn.addEventListener("click", (e) => {
  e.preventDefault();

  let title = titleTag.value.trim();
  let tasks = [];
  taskList.querySelectorAll("li").forEach((li) => {
    const text = li.querySelector("p").textContent;
    const done = li.querySelector("input").checked;
    tasks.push({ text, done });
  });

  if (title && tasks.length >= 0) {
    let currentDate = new Date();
    let day = currentDate.getDate();
    let month = months[currentDate.getMonth()];
    let year = currentDate.getFullYear();

    let noteInfo = { title, tasks, date: `${month} ${day}, ${year}` };

    if (!isUpdate) {
      notes.push(noteInfo);
    } else {
      isUpdate = false;
      notes[updateId] = noteInfo;
    }

    localStorage.setItem("notes", JSON.stringify(notes));
    closeIcon.click();
    showNotes();
  }
});

taskList.addEventListener("click", (event) => {
  if (event.target.tagName === "I") {
    event.target.parentElement.remove();
  }
});
