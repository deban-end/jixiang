document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.querySelector('.game-container');
    const mainCharacter = document.getElementById('main-character');
    const scoreElement = document.getElementById('score');
    
    let score = 0;
    let eggs = [];
    let lastClickTime = 0;
    let clickTimeout;
    
    // 音效预载
    const eggSound = new Audio("ass/xiadan.mp3");
    eggSound.preload = "auto";
    
    // 点击效果
    function createClickEffect(x, y) {
        const effect = document.createElement('div');
        effect.className = 'click-effect';
        effect.style.left = `${x - 20}px`;
        effect.style.top = `${y - 20}px`;
        gameContainer.appendChild(effect);
        
        setTimeout(() => {
            effect.remove();
        }, 600);
    }
    
    // 创建鸡蛋（基于角色位置）
    function createEgg() {
        const charRect = mainCharacter.getBoundingClientRect();
        const containerRect = gameContainer.getBoundingClientRect();
        
        // 计算角色底部中心位置
        const x = charRect.left - containerRect.left + charRect.width/2;
        const y = charRect.top - containerRect.top + charRect.height;
        
        const egg = document.createElement('div');
        egg.className = 'egg';
        egg.style.left = `${x - 22}px`; // 鸡蛋宽度的一半
        egg.style.top = `${y}px`;
        gameContainer.appendChild(egg);
        
        eggs.push({
            element: egg,
            createdAt: Date.now(),
            isHatching: false
        });
        
        try {
            eggSound.currentTime = 0;
            eggSound.play().catch(e => console.log("media error:", e));
        } catch (e) {
            console.log("media error:", e);
        }
    }
    
    // 开始孵化
    function startHatching(egg) {
        if (egg.isHatching) return;
        
        egg.isHatching = true;
        egg.element.className = 'hatching-egg';
        
        setTimeout(() => {
            hatchEgg(egg);
        }, 500);
    }
    
    // 鸡蛋孵化
    function hatchEgg(egg) {
        if (!egg.element.parentNode) return;
        
        const x = parseInt(egg.element.style.left) + 22;
        const y = parseInt(egg.element.style.top) + 32;
        
        egg.element.remove();
        
        const baby = document.createElement('div');
        baby.className = 'baby-character';
        baby.style.left = `${x - 32}px`;
        baby.style.top = `${y - 32}px`;
        gameContainer.appendChild(baby);
        
        const moveInterval = setInterval(() => {
            const currentLeft = parseInt(baby.style.left);
            baby.style.left = `${currentLeft - 4}px`;
            
            // 移出屏幕后移除
            if (currentLeft < -100) {
                clearInterval(moveInterval);
                baby.remove();
            }
        }, 50);
        
        score++;
        scoreElement.textContent = score;
        
        eggs = eggs.filter(e => e !== egg);
    }
    
    // 检测鸡蛋孵化
    function checkEggsHatching() {
        const now = Date.now();
        const inactiveTime = now - lastClickTime;
        
        if (inactiveTime > 1500) {
            eggs.forEach(egg => {
                if (!egg.isHatching) {
                    startHatching(egg);
                }
            });
        }
    }
    
    // 处理点击/触摸事件
    function handleInteraction(x, y) {
        // 移动角色
        mainCharacter.style.left = `${x - 50}px`;
        mainCharacter.style.top = `${y - 50}px`;
        
        // 添加动画效果
        mainCharacter.style.transform = 'scale(1.1) rotate(5deg)';
        setTimeout(() => {
            mainCharacter.style.transform = 'scale(1) rotate(0deg)';
        }, 300);
        
        // 创建点击效果
        createClickEffect(x, y);
        
        // 创建鸡蛋
        createEgg();
        
        // 更新最后点击时间
        lastClickTime = Date.now();
        
        // 停止正在孵化的鸡蛋
        eggs.forEach(egg => {
            if (egg.isHatching) {
                egg.element.className = 'egg';
                egg.isHatching = false;
            }
        });
        
        // 重置超时检测
        clearTimeout(clickTimeout);
        clickTimeout = setTimeout(checkEggsHatching, 2000);
    }
    
    // 鼠标点击事件
    gameContainer.addEventListener('click', (e) => {
        const rect = gameContainer.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        handleInteraction(x, y);
    });
    
    // 触摸事件处理
    gameContainer.addEventListener('touchstart', (e) => {
        e.preventDefault(); // 阻止默认行为（缩放）
        
        const rect = gameContainer.getBoundingClientRect();
        const touch = e.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        handleInteraction(x, y);
    }, { passive: false });
    
    // 初始化角色位置
    const initPosition = () => {
        mainCharacter.style.left = `${gameContainer.clientWidth / 2 - 50}px`;
        mainCharacter.style.top = `${gameContainer.clientHeight / 2 - 50}px`;
    };
    
    // 初始化和窗口大小变化时重置位置
    window.addEventListener('load', initPosition);
    window.addEventListener('resize', initPosition);
    
    // 移动端提示
    if ('ontouchstart' in window) {
        document.querySelector('.mobile-notice').style.display = 'block';
    }
});