let highestZ = 30;
function bringToFront(win){
    highestZ+=1;
    win.style.zIndex=highestZ;
}
function toggleFullscreen(winId){
    const win = document.getElementById(winId);
    if (!win.classList.contains('fullscreen')){
        win.dataset.prevTop = win.style.top;
        win.dataset.prevLeft = win.style.left;
        win.dataset.prevWidth = win.style.width;
        win.dataset.prevHeight = win.style.height;
        win.classList.add('fullscreen');

    }else {
        win.classList.remove('fullscreen');
        if (win.dataset.prevTop) win.style.top = win.dataset.prevTop;
        if (win.dataset.prevLeft) win.style.left=win.dataset.prevLeft;
        if (win.dataset.prevWidth) win.style.width = win.dataset.prevWidth;
        if (win.dataset.prevHeight) win.style.height = win.dataset.prevHeight;
        
    }
    bringToFront(win);
}
function closeWindow(winId, dockId) {
    const win = document.getElementById(winId);

    win.style.display = 'none';
    win.classList.remove('minimized');
    win.classList.remove('fullscreen');

    if (dockId) {
        document.getElementById(dockId)?.classList.remove('active');
    }

    resetSession(winId);
}
function resetSession(winId){
    if (winId === 'win-terminal'){
        document.getElementById('term-history').innerHTML=`
        <p style= "color:#f0f3f6;">DevOS Runtime Shell v2.1 </p>
        <p style = "color:#f0f3f6;"> Type <span style="color:var(--accent);">help</span> for system commands.</p>
        `;
        document.getElementById('term-input').value="";


    }else if (winId === 'win-notes'){
        document.getElementById('notes-textarea').value = 'none';

    } else if (winId === 'win-calc'){
        calcScreenVal ="0";
        currentOp=null;
        prevCalcVal=null;
        updateCalcScreen();
    }
}
function minimizeWindow(winId){
    document.getElementById(winId).classList.add('minimized');

}
function dockToggle(winId,dockId){
    const win = document.getElementById(winId);
    const dockIcon = document.getElementById(dockId);
    if (win.style.display === 'none'){
        win.style.display = 'flex';
        setTimeout(() => win.classList.remove('minimized'), 10);
        dockIcon.classList.add('active');
        bringToFront(win);

    } else if (win.classList.contains('minimized')){
        win.classList.remove('minimized');
        dockIcon.classList.add('active');
        bringToFront(win);
    } else{
        minimizeWindow(winId);
    }
}
document.querySelectorAll('.window').forEach(win => {
    const header = win.querySelector('.window-header');

    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    win.addEventListener('pointerdown', () => {
        bringToFront(win);
    });

    header.addEventListener('pointerdown', (e) => {
        if (e.target.classList.contains('dot')) return;
        if (win.classList.contains('fullscreen')) return;

        isDragging = true;

        offsetX = e.clientX - win.offsetLeft;
        offsetY = e.clientY - win.offsetTop;

        header.setPointerCapture(e.pointerId);
        e.preventDefault();
    });

    header.addEventListener('pointermove', (e) => {
        if (!isDragging) return;

        win.style.left = `${e.clientX - offsetX}px`;
        win.style.top = `${e.clientY - offsetY}px`;
    });

    const stopDrag = (e) => {
        if (!isDragging) return;

        isDragging = false;

        try {
            header.releasePointerCapture(e.pointerId);
        } catch (_) {}
    };

    header.addEventListener('pointerup', stopDrag);
    header.addEventListener('pointercancel', stopDrag);
});

function loadSavedNotes(){
    const container = document.getElementById('saved-notes-container');
    container.innerHTML = '';
    const notes = JSON.parse(localStorage.getItem('devos_notes') || '[]');
    if (notes.length === 0){
        container.innerHTML = '<span style = "font-size:0.75rem; color:var(--text-muted);">No Saved Notes </span>';
        return;
    }
    notes.forEach((note, index) => {
        const item = document.createElement('div');
        item.className = 'saved-note-item';
        item.innerHTML = `
          <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:200px;">${escapeHtml(note)}</span>
          <span class="note-del" onclick="deleteNote(${index}, event)">✕</span>
        `;
        item.onclick = () => { document.getElementById('notes-textarea').value = note; };
        container.appendChild(item);
      });
}
function saveCurrentNote(){
    const text = document.getElementById("notes-textarea").value.trim();
    if (!text) return;
    const notes = JSON.parse(localStorage.getItem('devos_notes')|| '[]');
    notes.unshift(text);
    localStorage.setItem('devos_notes',JSON.stringify(notes));
    document.getElementById('notes-textarea').value ='';
    loadSavedNotes();
    
}
function deleteNote(index,event){
    event.stopPropagation();
    const notes = JSON.parse(localStorage.getItem('devos_notes') || '[]');
    notes.splice(index,1);
    localStorage.setItem('devos_notes',JSON.stringify(notes));
    loadSavedNotes();
}
function escapeHtml(text){
    const div= document.createElement('div');
    div.textContent = text;
    return div.innerHTML;

}
loadSavedNotes();
let calcScreenVal= '0';
let prevCalcVal=null;
let currentOp=null;
let resetScreenNext = false;

function updateCalcScreen(){
    document.getElementById('calc-screen').textContent=calcScreenVal;

}

function calcAction(btn) {
      if (!isNaN(btn) || btn === '.') {
        if (resetScreenNext || calcScreenVal === '0') {
          calcScreenVal = btn === '.' ? '0.' : btn;
          resetScreenNext = false;
        } else {
          if (btn === '.' && calcScreenVal.includes('.')) return;
          calcScreenVal += btn;
        }
      } else if (btn === 'C') {
        calcScreenVal = '0';
        prevCalcVal = null;
        currentOp = null;
      } else if (btn === '±') {
        calcScreenVal = (parseFloat(calcScreenVal) * -1).toString();
      } else if (btn === '%') {
        calcScreenVal = (parseFloat(calcScreenVal) / 100).toString();
      } else if (['+', '-', '*', '/'].includes(btn)) {
        prevCalcVal = parseFloat(calcScreenVal);
        currentOp = btn;
        resetScreenNext = true;
      } else if (btn === '=') {
        if (currentOp && prevCalcVal !== null) {
          const current = parseFloat(calcScreenVal);
          let result = 0;
          if (currentOp === '+') result = prevCalcVal + current;
          if (currentOp === '-') result = prevCalcVal - current;
          if (currentOp === '*') result = prevCalcVal * current;
          if (currentOp === '/') result = current !== 0 ? prevCalcVal / current : 'Error';
          calcScreenVal = result.toString();
          currentOp = null;
          prevCalcVal = null;
          resetScreenNext = true;
        }
      }
      updateCalcScreen(); 
}
const termInput= document.getElementById('term-input');
const termHistory = document.getElementById('term-history');
const termBox = document.getElementById('terminal-box');
termInput.addEventListener('keydown',(e) =>{
    if (e.key === 'Enter'){
        const full = termInput.value.trim();
        if (full){
            logTerm(`user@devos:~$ ${full}`, '#8b949e');
            executeCommand(full);

        }
        termInput.value ='';
        termBox.scrollTop = termBox.scrollHeight;

    }
});
function logTerm(text,color='#f0f3f6'){
    const p = document.createElement('p');
    p.style.color = color;
    p.textContent= text;
    termHistory.appendChild(p);
    termBox.scrollTop = termBox.scrollHeight;
}

function executeCommand(input){
    const parts = input.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.splice(1).join('');
    switch (cmd){
        case 'echo':
            logTerm(args || '');
            break;
        case 'help':
            logTerm('Commands: echo <text>, clear, date, whoami');
            break;
        case 'clear':
            termHistory.innerHTML='';
            break;
        case 'date':
            logTerm(new Date().toString());
            break;
        case 'whoami':
            logTerm('user9857');
            break;
        
        default:
            logTerm('Command not found');
    }
}
function setAccent(color,el){
    document.documentElement.style.setProperty('--accent',color);
    document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
    if (el) el.classList.add('active');

}
function updateClock(){
    document.getElementById('top-clock').textContent = new Date().toLocaleTimeString();

}
setInterval(updateClock, 1000);
updateClock();
