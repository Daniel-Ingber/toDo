// links to the API and svg libs
import { svgs } from './svgs.js';


// global variables
const tasksList = document.querySelector('#tasks');
const tasks = [];
const currentTasks = [];
let currentFilter;
let currentId;

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


// API handling
async function fetchInitialTasks() {
    try {
    // mock API built to suite object type
    const apiCall = await fetch("https://daniel-ingber.github.io/APIS/toDoCallback/data.json");

    const items = await apiCall.json();
    items.forEach(task => {
        tasks.push(new Task(...Object.values(task)));
    });
    displayTaskList(tasks);
    currentId = findMaxID(tasks) + 1;
    } catch (err) {
    console.error(err);
    }
}
fetchInitialTasks();


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
    category.innerHTML = getIcon(task.category);

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'taskCheck';
    checkbox.checked = !!task.checked;

    const content = document.createElement('span');
    content.className = 'toDoTask';
    content.textContent = task.content || '';

    const user = document.createElement('span');
    user.className = 'toDoUser';
    user.textContent = task.user;

    const date = document.createElement('span');
    date.className = 'toDoDate';
    date.textContent = dateFormat(task.date);

    const urgency = document.createElement('div');
    const urgencyLevel = (task.urgency || '').toString().toLowerCase();
    urgency.className = `urgency ${urgencyLevel}`.trim();

    const remove = document.createElement('div');
    remove.className = 'removeTask';
    remove.innerHTML = getIcon(10);

    container.appendChild(category);
    container.appendChild(checkbox);
    container.appendChild(content);
    container.appendChild(user);
    if (date.innerHTML != '')
    container.appendChild(date);
    container.appendChild(urgency);
    container.appendChild(remove);

    li.appendChild(container);
    tasksList.appendChild(li);
}

function clearTaskList(){
    tasksList.innerHTML = '';
}


// svg handling
function getIcon(category){
    if (category > 0)
    return svgs[category-1].svg;
    else console.error("the function fillCategory only takes values starting from 1!");
}


// filter the task array
function returnFilteredTasks(key, value) {
    return currentTasks.filter(task => task[key] === value);
}


// change the display order of the tasks
function orderTasksBy(tasks, key){

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

function findMaxID(arr){
    return arr.length ? arr.slice().sort((a,b) => b.id - a.id)[0].id : undefined;
}

function removeTask(id){

}


// Event listeners
