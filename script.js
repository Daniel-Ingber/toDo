// links to the API and svg libs
import { svgs } from './svgs.js';

// global variables
const tasksList = document.querySelector('#tasks');

const STORAGE_KEY = 'todoTasks';
const tasks = [];
const currentTasks = [];
let currentFilter;
let currentId;


// the Task class
// task {id:int,category:int,urgency:string,date:Date(),content:string,user:string}
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
    if (!list || list.length === 0) {
        tasksList.innerHTML = '<li><div><p>לא נמצא מה שרצית... אתה בטוח שזה קיים?</p></div></li>';
        return;
    }
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
    category.title = svgs[task.category-1]['name'];

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'taskCheck';
    checkbox.checked = !!task.checked;
    checkbox.addEventListener('change', () => {
        const t = tasks.find(x => String(x.id) === String(task.id));
        if (t) {
            t.checked = checkbox.checked;
            saveToLocal();
        }
    });

    const content = document.createElement('span');
    content.className = 'toDoTask';
    content.textContent = task.content || '';

    const user = document.createElement('span');
    user.className = 'toDoUser';
    user.textContent = task.user || '';

    const date = document.createElement('span');
    date.className = 'toDoDate';
    date.textContent = dateFormat(task.date);

    const urgency = document.createElement('div');
    const urgencyLevel = (task.urgency || '').toString().toLowerCase();
    urgency.className = `urgency ${urgencyLevel}`.trim();

    const remove = document.createElement('div');
    remove.className = 'removeTask';
    remove.innerHTML = getIcon(10);
    remove.style.cursor = 'pointer';
    remove.title = 'Remove task';
    remove.addEventListener('click', () => {
        removeTask(task.id);
    });

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


// Task loading
async function fetchInitialTasks() {
    try {
        const apiCall = await fetch("https://daniel-ingber.github.io/APIS/toDoCallback/data.json");
        const items = await apiCall.json();
        items.forEach(task => {
            tasks.push(new Task(...Object.values(task)));
        });

        loadFromLocal();
        displayTaskList(tasks);
        currentId = (findMaxID(tasks) || 0) + 1;
    } catch (err) {
        console.error(err);

        loadFromLocal();
        displayTaskList(tasks);
        currentId = (findMaxID(tasks) || 0) + 1;
    }
}
fetchInitialTasks();

function saveToLocal() {
    try {
        const localTasks = tasks.map(task => ({
            id: task.id,
            category: task.category,
            urgency: task.urgency,
            date: task.date,
            content: task.content,
            user: task.user,
            checked: task.checked
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(localTasks));
    } catch (e) {
        console.warn('Failed to save tasks to localStorage', e);
    }
}

function loadFromLocal() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        
        const saved = JSON.parse(raw);
        if (!Array.isArray(saved)) return;

        // merge saved tasks into tasks array, avoid duplicate ids
        const existingIds = new Set(tasks.map(t => String(t.id)));
        saved.forEach(s => {
            if (!existingIds.has(String(s.id))) {
                tasks.push(new Task(s.id, s.category, s.urgency, s.date, s.content, s.user, s.checked));
            } else {
                // if id exists, update the existing task with saved values (so user edits persist)
                const idx = tasks.findIndex(t => String(t.id) === String(s.id));
                if (idx !== -1) {
                    tasks[idx].category = s.category;
                    tasks[idx].urgency = s.urgency;
                    tasks[idx].date = s.date;
                    tasks[idx].content = s.content;
                    tasks[idx].user = s.user;
                    tasks[idx].checked = s.checked;
                }
            }
        });
    } catch (e) {
        console.warn('Failed to load tasks from localStorage', e);
    }
}

function removeTask(id){
    const idx = tasks.findIndex(task => String(task.id) === String(id));
    if (idx === -1) return;
    tasks.splice(idx, 1);
    saveToLocal();
    displayTaskList(tasks);
}

// Add task
const urgencyOptions = [
    { value: 'unurgent', label: 'לא חשוב' },
    { value: 'low', label: 'חשיבות נמוכה' },
    { value: 'medium', label: 'חשיבות בינונית' },
    { value: 'high', label: 'חשיבות גבוהה' },
    { value: 'urgent', label: 'קריטי' }
];

const iconOptions = [
    { value: 1, label: 'מסמך' },
    { value: 2, label: 'קוד' },
    { value: 3, label: 'אוכל' },
    { value: 4, label: 'בית' },
    { value: 5, label: 'הנפצות' },
    { value: 6, label: 'בריאות' },
    { value: 7, label: 'כלכלה' },
    { value: 8, label: 'למידה' },
    { value: 9, label: 'חברתי' }
];

function populateSelect(selectId, options) {
    const select = document.getElementById(selectId);
    select.innerHTML = ''; // clear existing
    options.forEach(opt => {
        const el = document.createElement('option');
        el.value = opt.value;
        el.textContent = opt.label;
        select.appendChild(el);
    });
}

populateSelect('taskUrgency', urgencyOptions);
populateSelect('taskIcon', iconOptions);

const addButton = document.getElementById('addTask');
const taskInput = document.getElementById('taskInput');
const taskUser = document.getElementById('taskUser');
const taskUrgency = document.getElementById('taskUrgency');
const taskIcon = document.getElementById('taskIcon');
const taskDate = document.getElementById('taskDate');


function addTaskFromUI() {
    const textInput = (taskInput.value || '').trim();
    if (!textInput) return;
    const userInput = (taskUser.value || '').trim();
    if (!userInput) return;
    const urgencyInput = taskUrgency.value;
    const iconInput = taskIcon.value;
    const dateInput = taskDate.value ? new Date(taskDate.value) : new Date();
    const newTask = new Task(currentId, iconInput, urgencyInput, dateInput, textInput, userInput, false);
    tasks.push(newTask);
    currentId += 1;
    saveToLocal();
    displayTaskList(tasks);
    taskInput.value = '';
    taskUser.value = '';
    taskDate.value = '';
    taskUrgency.value = 'unurgent';
    taskIcon.value = 1;
    taskInput.focus();
}    

addButton.addEventListener('click', addTaskFromUI);
taskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTaskFromUI();
});    


