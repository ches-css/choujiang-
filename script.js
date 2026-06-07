
const prizes = [
    { name: '一等奖', color: '#E53935', textColor: '#FFD700' },
    { name: '二等奖', color: '#FFD700', textColor: '#E53935' },
    { name: '三等奖', color: '#E53935', textColor: '#FFD700' },
    { name: '四等奖', color: '#FFD700', textColor: '#E53935' },
    { name: '五等奖', color: '#E53935', textColor: '#FFD700' },
    { name: '幸运奖', color: '#FFD700', textColor: '#E53935' }
];

const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const resultModal = document.getElementById('resultModal');
const prizeResult = document.getElementById('prizeResult');
const closeModal = document.getElementById('closeModal');
const closeBtn = document.querySelector('.close');

let currentRotation = 0;
let isSpinning = false;
let audioContext = null;

function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playStartSound() {
    initAudio();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.3);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
}

function playWinSound() {
    initAudio();
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) =&gt; {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = freq;
        oscillator.type = 'sine';
        
        const startTime = audioContext.currentTime + i * 0.15;
        const duration = 0.3;
        
        gainNode.gain.setValueAtTime(0.3, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
    });
}

function drawWheel() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    const segmentAngle = (2 * Math.PI) / prizes.length;
    
    prizes.forEach((prize, index) =&gt; {
        const startAngle = index * segmentAngle - Math.PI / 2;
        const endAngle = startAngle + segmentAngle;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = prize.color;
        ctx.fill();
        ctx.strokeStyle = '#B71C1C';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + segmentAngle / 2);
        ctx.textAlign = 'center';
        ctx.fillStyle = prize.textColor;
        ctx.font = 'bold 18px Microsoft YaHei';
        ctx.fillText(prize.name, radius * 0.55, 6);
        ctx.restore();
    });
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, 45, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFD700';
    ctx.fill();
    ctx.strokeStyle = '#B71C1C';
    ctx.lineWidth = 4;
    ctx.stroke();
}

function resizeCanvas() {
    const wrapper = document.querySelector('.wheel-wrapper');
    const size = wrapper.clientWidth;
    canvas.width = size;
    canvas.height = size;
    drawWheel();
}

function spinWheel() {
    if (isSpinning) return;
    
    isSpinning = true;
    startBtn.disabled = true;
    
    playStartSound();
    
    const prizeIndex = Math.floor(Math.random() * prizes.length);
    const prize = prizes[prizeIndex];
    
    const segmentAngle = 360 / prizes.length;
    const prizeAngle = prizeIndex * segmentAngle + segmentAngle / 2;
    const spins = 5 + Math.floor(Math.random() * 3);
    const totalRotation = currentRotation + spins * 360 + (360 - prizeAngle);
    
    currentRotation = totalRotation;
    canvas.style.transform = `rotate(${totalRotation}deg)`;
    
    setTimeout(() =&gt; {
        showResult(prize, prizeIndex);
    }, 3000);
}

function showResult(prize, index) {
    playWinSound();
    prizeResult.textContent = prize.name;
    resultModal.classList.remove('hidden');
}

function closeResultModal() {
    resultModal.classList.add('hidden');
    isSpinning = false;
    startBtn.disabled = false;
}

startBtn.addEventListener('click', spinWheel);
closeModal.addEventListener('click', closeResultModal);
closeBtn.addEventListener('click', closeResultModal);
resultModal.addEventListener('click', (e) =&gt; {
    if (e.target === resultModal) {
        closeResultModal();
    }
});

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

document.addEventListener('click', () =&gt; {
    initAudio();
}, { once: true });
