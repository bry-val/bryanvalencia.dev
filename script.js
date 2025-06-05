document.addEventListener('DOMContentLoaded', () => {
    const output = document.getElementById('output');
    const commandInput = document.getElementById('command-input');
    const cursor = document.getElementById('cursor');
    const commandPalette = document.getElementById('command-palette');
    const promptElement = document.getElementById('prompt');
    const preloadContent = document.getElementById('preload-content');

    let currentCommand = '';
    let commandHistory = [];
    let historyIndex = -1;
    let systemLock = false; // Lock input during system operations

    const bootSequence = [
        { text: 'INITIATING SYS_ACCESS <BRYN.V>...', delay: 100, speed: 50 },
        { text: 'KERNEL_VER: 5.0.4-GHOST_FRAGMENT', delay: 500, speed: 30 },
        { text: 'MEMORY_CHECK: 65536KB OK', delay: 300, speed: 30 },
        { text: 'LOADING MODULES:', delay: 300, speed: 30 },
        { text: '  > crypto_engine.mod', delay: 200, speed: 20, indent: true },
        { text: '  > io_interface.mod', delay: 200, speed: 20, indent: true },
        { text: '  > stealth_protocol.mod', delay: 200, speed: 20, indent: true },
        { text: 'SYSTEM ONLINE. AWAITING INPUT.', delay: 500, speed: 40 },
        { text: 'Type \'help\' for a list of available commands.', delay: 200, speed: 40, postDelay: 500}
    ];

    async function typeLine(line, targetElement, speed = 50, isCommand = false) {
        return new Promise(resolve => {
            let text = line;
            if (typeof line === 'object') text = line.text;
            
            const p = document.createElement('p');
            if(line.indent) p.style.paddingLeft = '20px';
            if(isCommand) p.innerHTML = `<span class="prompt-echo">${promptElement.textContent}</span> ${text}`;
            else p.textContent = '';
            targetElement.appendChild(p);
            targetElement.scrollTop = targetElement.scrollHeight; // Auto-scroll

            if (isCommand) {
                resolve();
                return;
            }

            let i = 0;
            function typeChar() {
                if (i < text.length) {
                    p.textContent += text.charAt(i);
                    i++;
                    targetElement.scrollTop = targetElement.scrollHeight;
                    setTimeout(typeChar, speed);
                } else {
                    resolve();
                }
            }
            typeChar();
        });
    }

    async function runBootSequence() {
        systemLock = true;
        for (const line of bootSequence) {
            if (line.delay) await new Promise(res => setTimeout(res, line.delay));
            await typeLine(line, output, line.speed || 50);
            if (line.postDelay) await new Promise(res => setTimeout(res, line.postDelay));
        }
        systemLock = false;
        commandPalette.style.display = 'block'; // Show commands after boot
        promptElement.style.display = 'inline';
        cursor.style.display = 'inline-block';
    }

    function simulateCommandExecution(cmd) {
        if (systemLock) return;
        systemLock = true;
        commandInput.textContent = '';
        currentCommand = '';

        typeLine(cmd, output, 0, true).then(() => { // Echo command immediately
            commandHistory.push(cmd);
            historyIndex = commandHistory.length;

            if (cmd.toLowerCase() === 'clear') {
                output.innerHTML = '';
                systemLock = false;
                return;
            }

            const responseContainer = preloadContent.querySelector(`div[data-command-response="${cmd}"]`);
            if (responseContainer) {
                const elementsToProcess = Array.from(responseContainer.children);
                processResponseElements(elementsToProcess);
            } else if (cmd.toLowerCase().startsWith('open ')) {
                const fileName = cmd.substring(5);
                 typeLine(`SYS: Opening '${fileName}' is a simulated action. No detailed view implemented.`, output, 30);
                 systemLock = false;
            } else {
                typeLine(`CMD_ERR: Unknown command '${cmd}'. Type 'help'.`, output, 30);
                systemLock = false;
            }
        });
    }

    async function processResponseElements(elements) {
        for (const el of elements) {
            if (el.classList.contains('progress-bar-container')) {
                const progressBar = el.querySelector('.progress-bar');
                await typeLine('[SYSTEM IS PROCESSING REQUEST]', output, 20); // Placeholder for progress message
                output.appendChild(el.cloneNode(true)); // Add progress bar to output
                const actualProgressBar = output.lastChild.querySelector('.progress-bar');
                
                await new Promise(res => setTimeout(res, 100)); // Short delay before bar starts
                actualProgressBar.style.width = '100%';
                await new Promise(res => setTimeout(res, 400)); // Time for bar to fill
            } else {
                // Refined text reveal: Type out quickly, no prolonged scramble
                const text = el.textContent;
                const p = document.createElement(el.tagName.toLowerCase());
                p.className = el.className;
                output.appendChild(p);
                
                let i = 0;
                const typingSpeed = 15; // Faster typing speed
                function typeCharInResponse() {
                    if (i < text.length) {
                        p.textContent += text.charAt(i);
                        i++;
                        output.scrollTop = output.scrollHeight;
                        setTimeout(typeCharInResponse, typingSpeed);
                    } else {
                        // Move to next element only when current one is done typing
                        if (elements.indexOf(el) < elements.length - 1) {
                            // No explicit call, loop handles it
                        } else {
                            systemLock = false; // Unlock after last element
                        }
                    }
                }
                await new Promise(resolveCharTyping => {
                    let k = 0;
                    function typeChar() {
                        if (k < text.length) {
                            p.textContent += text.charAt(k);
                            k++;
                            output.scrollTop = output.scrollHeight;
                            setTimeout(typeChar, typingSpeed);
                        } else {
                            resolveCharTyping();
                        }
                    }
                    typeChar();
                });
            }
        }
        systemLock = false; // Ensure unlock after all elements are processed
    }

    // Event listener for command palette clicks
    commandPalette.addEventListener('click', (e) => {
        if (e.target.classList.contains('command')) {
            const cmd = e.target.dataset.command;
            simulateCommandExecution(cmd);
        }
    });

    // Simulated keyboard input (basic for demo)
    // A full CLI input would be more complex, handling backspace, enter, history, etc.
    // This is a simplified version to just show commands typing out.
    // For a real input, you'd capture keystrokes on the document.

    runBootSequence();
});
