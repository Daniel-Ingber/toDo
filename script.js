// links to the API and svg libs
import { svgs } from './svgs.js';


// global variables
const tasksList = document.querySelector('#tasks');
const tasks = [];
const currentTasks = [];
let currentFilter;


// API handling
function fetchInitialTasks(){
    fetch('https://jsonplaceholder.typicode.com/todos/5')
        .then(response => response.json())
        .then(json => console.log(json));
}

// task handling


// the Task class
// task {id:int,category:int,urgency:string,date:Date(),content:string,user:string}
// Task1 = new Task(1,3,'medium',20/7/2025,'make breakfast','Omer Lael')

class Task {
    constructor(id, category, urgency, date, content, user, checked){
        this.id = id;
        this.category = category;
        this.urgency = urgency;
        this.date = date;
        this.content = content;
        this.user = user;
        this.checked = checked ? checked : false;
        this.urgencyLevels = {
            unurgent: 0,
            low: 1,
            medium: 2,
            high: 3,
            urgent: 4
        };
        this.checkUrgency = () => {
            if (this.urgency === "unurgent") { console.log(`task ${this.id} has been marked as Unurgent and has been skipped :)`); return;};

            const now = new Date();
            const taskDate = new Date(this.date);
            const diffMs = taskDate.getTime() - now.getTime();
            const diffDays = diffMs / (1000 * 60 * 60 * 24);

            let autoUrgency;

            // אם תג"ב משימה גדול בשבועיים אז הוא לא דחוף, אם גדול בשבוע אז הוא מתחיל להתקרב לתג"ב, אם הוא פחות משבוע אז הוא בעדיפות גבוהה, אם הוא אחרי או ביום התג"ב אז הוא דחוף
            if (diffDays > 14) autoUrgency = "low";
            else if (diffDays > 7) autoUrgency = "medium";
            else if (diffDays > 0) autoUrgency = "high";
            else autoUrgency = "urgent";

            if (this.urgencyLevels[autoUrgency] > this.urgencyLevels[this.urgency]) {
                this.urgency = autoUrgency;
            }
        };

        this.checkUrgency();
    }
}

// PAGE BUILDING
function displayTaskList(list){
    clearTaskList();
    list.forEach(task => {
        createTask(task);
    });
}

function createTask(task){
    const li = document.createElement('li');
    li.className = 'task';
    li.id = task.id || '';
    if (task.user !== undefined) li.dataset.user = task.user;

    const container = document.createElement('div');

    const category = document.createElement('div');
    category.className = 'taskCategory';
    category.innerHTML = getCategoryIcon(task.category);

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'taskCheck';
    checkbox.checked = !!task.checked;

    const content = document.createElement('span');
    content.className = 'toDoTask';
    content.textContent = task.content || '';

    const date = document.createElement('span');
    date.className = 'toDoDate';
    date.textContent = dateFormat(task.date);

    const urgency = document.createElement('div');
    const urgencyLevel = (task.urgency || '').toString().toLowerCase();
    urgency.className = `urgency ${urgencyLevel}`.trim();

    container.appendChild(category);
    container.appendChild(checkbox);
    container.appendChild(content);
    container.appendChild(date);
    container.appendChild(urgency);

    li.appendChild(container);
    tasksList.appendChild(li);
}

function clearTaskList(){
    tasksList.innerHTML = '';
}


// svg handling
function getCategoryIcon(category){
    if (category > 0)
    return svgs[category-1].svg;
    else console.error("the function fillCategory only takes values starting from 1!");
}

// filter the task array
function filterTasks(filter){

}

// change the display order of the tasks
function orderTasksBy(key){

}


// data helpers
function dateFormat(dateInput) {
    const d = (dateInput instanceof Date) ? dateInput : new Date(dateInput);
    if (isNaN(d)) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

for (let i=0;i<9;i++){let task = new Task(i, i+1, 'low', "2026-03-19", `${i}33`, 'Lael');tasks.push(task);};
displayTaskList(tasks);