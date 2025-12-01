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

    // Create iframe - start with bubble size only
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.bottom = '0';
    iframe.style.right = position === 'bottom-right' ? '0' : 'auto';
    iframe.style.left = position === 'bottom-left' ? '0' : 'auto';
    iframe.style.width = '80px';
    iframe.style.height = '80px';
    iframe.style.border = 'none';
    iframe.style.zIndex = '999999';
    iframe.style.background = 'transparent';
    iframe.style.colorScheme = 'none';
    iframe.style.overflow = 'visible';
    iframe.setAttribute('allowtransparency', 'true');
    iframe.allow = 'clipboard-write';

    // Build embed URL with parameters
    const embedUrl = new URL('/embed', baseUrl);
    if (workflowId) embedUrl.searchParams.set('workflow', workflowId);
    if (siteId) embedUrl.searchParams.set('site', siteId);
    embedUrl.searchParams.set('position', position);
    embedUrl.searchParams.set('color', color);
    embedUrl.searchParams.set('title', title);

    iframe.src = embedUrl.toString();

    // Add iframe to page
    document.body.appendChild(iframe);

    // Handle messages from iframe for resizing
    window.addEventListener('message', function (event) {
        if (event.origin !== baseUrl) return;

        if (event.data.type === 'chatkit-open') {
            iframe.style.width = '420px';
            iframe.style.height = '680px';
            iframe.style.maxWidth = 'calc(100vw - 20px)';
            iframe.style.maxHeight = 'calc(100vh - 20px)';
        }

        if (event.data.type === 'chatkit-close') {
            iframe.style.width = '80px';
            iframe.style.height = '80px';
            iframe.style.maxWidth = 'none';
            iframe.style.maxHeight = 'none';
        }
    });
})();
