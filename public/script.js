document.addEventListener('DOMContentLoaded', () => {
    const taskNameInput = document.getElementById('taskName');
    const startTimeInput = document.getElementById('startTime');
    const endTimeInput = document.getElementById('endTime');
    const taskBody = document.getElementById('taskBody');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const enableSoundBtn = document.getElementById('enableAlarmBtn');

    let taskList = JSON.parse(localStorage.getItem('myTasks')) || [];
    let activeAudio = null;
    let audioUnlocked = false;

    // --- 1. REQUEST NOTIFICATION PERMISSION ---
    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
    }

    // --- 2. ENABLE SOUND BUTTON LOGIC ---
    if (enableSoundBtn) {
        enableSoundBtn.onclick = () => {
            const tempAudio = new Audio('alarm.mp3');
            tempAudio.volume = 0.1;
            tempAudio.play().then(() => {
                tempAudio.pause();
                audioUnlocked = true;
                enableSoundBtn.innerText = "✅ Sound Active";
                enableSoundBtn.style.background = "#2ecc71";
            }).catch(() => alert("Please click anywhere on the page first, then try again!"));
        };
    }

    // --- 3. ADD TASK ---
    document.getElementById('addBtn').onclick = () => {
        const name = taskNameInput.value;
        const start = startTimeInput.value;
        const end = endTimeInput.value;

        if (name && start && end) {
            taskList.push({ 
                id: Date.now(), 
                name: name, 
                startTime: start, 
                endTime: end, 
                completed: false, 
                notified: false 
            });
            
            taskNameInput.value = '';
            startTimeInput.value = '';
            endTimeInput.value = '';
            saveAndRender();
        } else {
            alert("Please fill in all fields (Task, Start, and End)!");
        }
    };

    // --- 4. STOP ALARM ---
    window.stopAlarm = () => {
        if (activeAudio) {
            activeAudio.pause();
            activeAudio.currentTime = 0;
            activeAudio = null;
        }
        render(); 
    };

    const saveAndRender = () => {
        localStorage.setItem('myTasks', JSON.stringify(taskList));
        render();
    };

    // --- 5. RENDER TABLE ---
    const render = () => {
        taskBody.innerHTML = '';
        taskList.forEach(task => {
            const row = document.createElement('tr');
            
            // Highlight row if it's currently alerting
            if (task.notified && !task.completed) {
                row.style.backgroundColor = "rgba(231, 76, 60, 0.1)"; 
            }

            const sDisplay = task.startTime ? task.startTime.replace('T', ' ') : "N/A";
            const eDisplay = task.endTime ? task.endTime.split('T')[1] : "N/A";

            row.innerHTML = `
                <td>${task.name}</td>
                <td>${sDisplay} <b>to</b> ${eDisplay}</td>
                <td>
                    <input type="checkbox" onchange="window.toggleDone(${task.id}, this.checked)" ${task.completed ? 'checked' : ''}>
                    <span style="color:black; font-weight:bold;">Done</span>
                </td>
                <td>
                    <button class="btn-red" onclick="window.removeTask(${task.id})">Delete</button>
                    ${task.notified && !task.completed ? `<button onclick="window.stopAlarm()" style="background:orange; color:white; border:none; padding:5px; border-radius:4px; margin-left:5px; cursor:pointer;">Stop 🔇</button>` : ''}
                </td>
            `;
            taskBody.appendChild(row);
        });
        updateStats();
    };

    window.toggleDone = (id, val) => {
        const task = taskList.find(t => t.id === id);
        if (task) {
            task.completed = val;
            if (val) window.stopAlarm();
        }
        saveAndRender();
    };

    window.removeTask = (id) => {
        const task = taskList.find(t => t.id === id);
        if (task && task.notified) window.stopAlarm();
        taskList = taskList.filter(t => t.id !== id);
        saveAndRender();
    };

    const updateStats = () => {
        const total = taskList.length;
        const done = taskList.filter(t => t.completed).length;
        const per = total === 0 ? 0 : Math.round((done / total) * 100);
        progressBar.value = per;
        progressText.innerText = per + "%";
    };

    // --- 6. NOTIFICATION & ALARM TIMER (Checks every 5 seconds) ---
    setInterval(() => {
        const now = new Date();
        taskList.forEach(task => {
            if (!task.endTime) return;

            const tEndDate = new Date(task.endTime);
            if (!task.notified && !task.completed && now >= tEndDate) {
                
                // Trigger Browser Notification
                if (Notification.permission === "granted") {
                    new Notification("🚨 Task Deadline!", { body: task.name });
                }

                // Trigger Sound
                if (audioUnlocked && !activeAudio) {
                    activeAudio = new Audio('alarm.mp3');
                    activeAudio.loop = true;
                    activeAudio.play().catch(e => console.log("Audio blocked"));
                }

                task.notified = true;
                saveAndRender();
            }
        });
    }, 5000);

    render();
});