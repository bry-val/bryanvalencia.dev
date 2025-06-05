document.addEventListener('DOMContentLoaded', () => {
    const headerFragment = document.getElementById('header-fragment');
    const subtitleFragment = document.getElementById('subtitle-fragment');
    const footerEcho = document.getElementById('footer-echo');
    const glyphs = document.querySelectorAll('.glyph');
    const realityContents = document.querySelectorAll('.reality-content');

    const typeText = (element, delay = 0, charDelay = 100) => {
        const text = element.dataset.text || element.dataset.subText || '';
        element.textContent = ''; // Clear existing content
        let i = 0;
        setTimeout(() => {
            element.style.opacity = '1'; // Make visible before typing if hidden by CSS
            function typeChar() {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                    setTimeout(typeChar, charDelay);
                }
            }
            typeChar();
        }, delay);
    };

    const scrambleText = (pElement, finalDelay = 0) => {
        const originalText = pElement.dataset.scramble;
        if (!originalText) return;

        let iteration = 0;
        const maxIterations = originalText.length + 10; // More iterations for longer text
        const intervalDuration = 50;
        pElement.textContent = '';
        pElement.style.opacity = '1';

        const interval = setInterval(() => {
            let displayText = '';
            for (let i = 0; i < originalText.length; i++) {
                if (i < iteration - 5) { // Reveal character if iteration passed it by a margin
                    displayText += originalText[i];
                } else {
                    // Show random char
                    displayText += String.fromCharCode(33 + Math.random() * 94);
                }
            }
            pElement.textContent = displayText;

            if (iteration >= maxIterations) {
                clearInterval(interval);
                pElement.textContent = originalText; // Ensure final text is correct
            }
            iteration++;
        }, intervalDuration);
    };

    // Initial animations for header/footer
    typeText(headerFragment, 500, 120); // Start after 0.5s, 120ms per char
    typeText(subtitleFragment, 2000, 70); // Start after 2s, 70ms per char
    // Footer echo is animated by CSS opacity, but we can still set its text if dynamic
    if (footerEcho && footerEcho.dataset.text) {
        // typeText(footerEcho, 5000, 50); // Or just let CSS handle it
    }

    glyphs.forEach(glyph => {
        glyph.addEventListener('click', () => {
            const targetId = glyph.dataset.target;
            
            glyphs.forEach(g => g.classList.remove('active'));
            glyph.classList.add('active');

            let revealDelay = 0;
            realityContents.forEach(content => {
                if (content.id === targetId) {
                    content.style.display = 'block';
                    // Animate paragraphs within the selected content
                    content.querySelectorAll('p[data-scramble]').forEach((p, index) => {
                        // Stagger the start of each paragraph's animation
                        scrambleText(p, revealDelay + index * 500);
                    });
                } else {
                    content.style.display = 'none';
                    // Reset opacity for paragraphs in hidden sections so they re-animate if shown again
                    content.querySelectorAll('p[data-scramble]').forEach(p => {
                        p.style.opacity = '0';
                        p.textContent = ''; // Clear them to re-scramble
                    });
                }
            });
        });
    });

    // Optionally, make the first glyph active and show its content on load
    if (glyphs.length > 0) {
        // Delay this to let initial animations play out
        setTimeout(() => {
             // glyphs[0].click(); // Uncomment to auto-select first tab after intro
        }, 5000); // Adjust delay as needed
    }
});
