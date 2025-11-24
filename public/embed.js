(function () {
    // Get the current script tag
    const currentScript = document.currentScript;

    // Get configuration from data attributes
    const workflowId = currentScript.getAttribute('data-workflow');
    const siteId = currentScript.getAttribute('data-site');
    const position = currentScript.getAttribute('data-position') || 'bottom-right';
    const color = currentScript.getAttribute('data-color') || '#3b82f6';
    const title = currentScript.getAttribute('data-title') || 'Chat with us';

    // Get the base URL (where this script is hosted)
    const scriptSrc = currentScript.src;
    const baseUrl = new URL(scriptSrc).origin;

    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.bottom = '0';
    iframe.style.right = position === 'bottom-right' ? '0' : 'auto';
    iframe.style.left = position === 'bottom-left' ? '0' : 'auto';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.zIndex = '999999';
    iframe.style.pointerEvents = 'none';
    iframe.style.background = 'transparent';

    // Build embed URL with parameters
    const embedUrl = new URL('/embed', baseUrl);
    if (workflowId) embedUrl.searchParams.set('workflow', workflowId);
    if (siteId) embedUrl.searchParams.set('site', siteId);
    embedUrl.searchParams.set('position', position);
    embedUrl.searchParams.set('color', color);
    embedUrl.searchParams.set('title', title);

    iframe.src = embedUrl.toString();

    // Allow pointer events on the iframe content
    iframe.onload = function () {
        iframe.style.pointerEvents = 'auto';
    };

    // Add iframe to page
    document.body.appendChild(iframe);

    // Handle messages from iframe (for future features like resize)
    window.addEventListener('message', function (event) {
        if (event.origin !== baseUrl) return;

        // Handle different message types
        if (event.data.type === 'chatkit-resize') {
            // Future: handle dynamic resizing
        }
    });
})();
