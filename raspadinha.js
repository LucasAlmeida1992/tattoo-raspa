// --- Documentação JavaScript (Design "Premium" - Correção de Transparência) ---

// 1. Obter os Elementos
const canvas = document.getElementById('scratch-canvas');
const ctx = canvas.getContext('2d');
const scratchSound = document.getElementById('som-raspar');
const prizeContent = document.querySelector('.prize-content');
const prizeContainer = document.querySelector('.scratch-wrapper'); 

let isDrawing = false;
let lastPosition = null;

// 2. Função para desenhar a camada "raspável" (A TINTA)
function setupCanvas() {
    
    /* * MUDANÇA: CORREÇÃO DE TRANSPARÊNCIA
     * A tinta agora é um gradiente prateado SÓLIDO (opaco).
     * O 'rgba' semi-transparente estava a mostrar o prémio por baixo.
     */
    const silverGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    silverGradient.addColorStop(0, '#c0c0c0'); // Prata (sólido)
    silverGradient.addColorStop(0.5, '#a9a9a9'); // Cinza (sólido)
    silverGradient.addColorStop(1, '#c0c0c0'); // Prata (sólido)
    ctx.fillStyle = silverGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Pinta a cor sólida
    
    // Texto "RASPE AQUI"
    const fontSize = canvas.height / 3; // Ajustado para altura
    
    /* * MUDANÇA: Cor do texto "RASPE AQUI"
     * Trocado para uma cor escura que aparece bem
     * em cima do fundo prateado.
     */
    ctx.fillStyle = '#3f3020'; // Castanho escuro (para combinar com o design)
    ctx.font = `700 ${fontSize}px 'Oswald', sans-serif`; // Fonte do título
    ctx.textTransform = 'uppercase'; // Letras maiúsculas
    
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('RASPE AQUI', canvas.width / 2, canvas.height / 2);
}

// 3. Funções para obter a posição
// (Sem alteração)
function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
    };
}
function getTouchPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
    };
}

// 5. A função "raspar" (com "arranhado")
// (Sem alteração)
function scratch(x, y) {
    ctx.globalCompositeOperation = 'destination-out';
    const scratchRadiusBase = canvas.width / 40;
    const scratchRandom = canvas.width / 25;
    for (let i = 0; i < 20; i++) {
        const radius = scratchRadiusBase + Math.random() * (scratchRadiusBase / 2); 
        const offsetX = Math.random() * scratchRandom - (scratchRandom / 2); 
        const offsetY = Math.random() * scratchRandom - (scratchRandom / 2);
        ctx.beginPath();
        ctx.arc(x + offsetX, y + offsetY, radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Função que desenha uma "linha de arranhões"
// (Sem alteração)
function drawScratchLine(from, to) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const stepSize = canvas.width / 50; 
    if (distance < stepSize) {
        scratch(to.x, to.y);
        return;
    }
    const steps = distance / stepSize;
    const stepX = dx / steps;
    const stepY = dy / steps;
    for (let i = 1; i < steps; i++) {
        const x = from.x + stepX * i;
        const y = from.y + stepY * i;
        scratch(x, y);
    }
    scratch(to.x, to.y);
}

// --- Funções de controlo de som ---
// (Sem alteração)
function playSound() {
    scratchSound.play().catch(e => console.warn("Som bloqueado pelo navegador."));
}
function stopSound() {
    scratchSound.pause();
    scratchSound.currentTime = 0;
}

// 6. Event Listeners (com 'mouseup' na 'window')
// (Sem alteração - está a usar a última correção)
window.addEventListener('mouseup', () => {
    if (isDrawing) {
        isDrawing = false;
        stopSound();
        lastPosition = null;
    }
});
canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    playSound();
    lastPosition = getMousePos(e); 
    scratch(lastPosition.x, lastPosition.y); 
});
canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    const currentPos = getMousePos(e);
    if (lastPosition) {
        drawScratchLine(lastPosition, currentPos);
    }
    lastPosition = currentPos;
});
canvas.addEventListener('mouseenter', (e) => {
    if (e.buttons === 1) {
        isDrawing = true;
        playSound();
        lastPosition = getMousePos(e);
    }
});
canvas.addEventListener('mouseout', () => {
    stopSound();
    lastPosition = null; 
});
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault(); 
    isDrawing = true;
    playSound();
    lastPosition = getTouchPos(e);
    scratch(lastPosition.x, lastPosition.y);
}, { passive: false });
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    const currentPos = getTouchPos(e);
    if(lastPosition){
        drawScratchLine(lastPosition, currentPos);
    }
    lastPosition = currentPos;
}, { passive: false });
canvas.addEventListener('touchend', () => {
    isDrawing = false;
    stopSound();
    lastPosition = null;
});
canvas.addEventListener('touchcancel', () => {
    isDrawing = false;
    stopSound();
    lastPosition = null;
});


// 7. LÓGICA DE URL
// (Sem alteração)
const urlParams = new URLSearchParams(window.location.search);

// --- Lógica do Valor ---
const valorDoVale = urlParams.get('valor');
if (valorDoVale) {
    const spanDoValor = document.getElementById('valor-premio');
    spanDoValor.textContent = `(Vale R$${valorDoVale})`;
}

// --- ✨ MUDANÇA AQUI: Lógica do Gênero ---
const genero = urlParams.get('genero'); // Pega o ?genero=
const tituloElement = document.getElementById('titulo-presente');

if (genero === 'a') {
    // Se for 'a' (feminino)
    tituloElement.textContent = 'VOCÊ FOI PRESENTEADA COM UM VALE TATTOO';
} else if (genero === 'o') {
    // Se for 'o' (masculino)
    tituloElement.textContent = 'VOCÊ FOI PRESENTEADO COM UM VALE TATTOO';
}
// Se o parâmetro 'genero' não existir ou for diferente, 
// ele simplesmente mantém o texto original "PRESENTEADO(A)".


// 8. LÓGICA DE REDIMENSIONAMENTO
// (Sem alteração)
function resizeAndSetupCanvas() {
    const containerWidth = prizeContainer.clientWidth;
    const containerHeight = prizeContainer.clientHeight;
    
    canvas.width = containerWidth;
    canvas.height = containerHeight;
    
    setupCanvas();
    prizeContent.style.visibility = 'visible';
}
function debounce(func, wait = 100) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(this, args);
        }, wait);
    };
}
window.addEventListener('resize', debounce(resizeAndSetupCanvas));

// 9. Iniciar:
// (Sem alteração)
resizeAndSetupCanvas();