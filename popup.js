const conversationMask = [
    {
        className: 'sticky top-0 mb-1.5 flex items-center justify-between z-10 h-14 p-2 font-semibold bg-token-main-surface-primary',
        modify: (element) => { element.innerHTML = '<br>'; }
    },
    {
        className: 'fixed left-0 top-1/2 z-40',
        modify: (element) => { element.remove(); }
    },
    {
        className: 'w-full pt-2 md:pt-0 dark:border-white/20 md:border-transparent md:dark:border-transparent md:w-[calc(100%-.5rem)]',
        modify: (element) => { element.remove(); }
    },
    {
        className: 'cursor-pointer absolute z-10 rounded-full bg-clip-padding border text-token-text-secondary border-token-border-light right-1/2 bg-token-main-surface-primary',
        modify: (element) => { element.remove(); }
    },
    {
        className: 'mt-1 flex gap-3 empty:hidden',
        modify: (element) => { element.remove(); }
    },
    {
        className: 'group fixed bottom-3 right-3 z-10 hidden gap-1 lg:flex',
        modify: (element) => { element.remove(); }
    },
    {
        className: 'flex-1 overflow-hidden',
        modify: (element) => { element.className = 'flex-1'; }
    }
];

function applyConversationMask(conversationHTML)
{
    const parser = new DOMParser();
    const doc = parser.parseFromString(conversationHTML, "text/html");

    // Wähle den <main> Container
    const mainContainer = doc.querySelector('main');

    // Durchlaufe das Array mit Ersetzungsobjekten
    conversationMask.forEach(item =>
    {
        const { className, modify } = item;

        // Erstelle einen Selektor, der alle Klassen im className-String beinhaltet
        const selector = className.split(' ').map(cls => '.' + CSS.escape(cls)).join('');

        // Wende den Selektor an, um Elemente zu finden
        mainContainer.querySelectorAll(selector).forEach(el =>
        {
            modify(el);
        });
    });

    // Rückgabe der modifizierten HTML des <main> Containers
    return mainContainer.innerHTML;
}


function buildDocument(conversationTitle, conversationHTML)
{
    const conversation = applyConversationMask(conversationHTML);

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="de">
    <head>
        <meta charset="UTF-8">
        <title>${conversationTitle}</title>
        <link rel="preload" href="https://cdn.oaistatic.com/_next/static/css/943d3bb12f23e4fe.css?dpl=7f79f217dddba3dc0f8a2845e2a9c1b16a374104" as="style" crossorigin="anonymous">
        <link rel="stylesheet" href="https://cdn.oaistatic.com/_next/static/css/943d3bb12f23e4fe.css?dpl=7f79f217dddba3dc0f8a2845e2a9c1b16a374104" crossorigin="anonymous" data-n-g="">
        <link rel="stylesheet" type="text/css" href="https://cdn.oaistatic.com/_next/static/css/b2b5486bcec590b9.css?dpl=7f79f217dddba3dc0f8a2845e2a9c1b16a374104" crossorigin="anonymous">
        <style>
            * {
                color: black !important; 
            }

            pre * {
                color: white !important; 
            }
        </style>
        </head>
    <body>
        ${conversation}
    </body>
    </html>
    `;

    return htmlContent;
}

document.addEventListener('DOMContentLoaded', function ()
{
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs)
    {
        var activeTab = tabs[0];
        const actionButton = document.getElementById('action');

        if (activeTab.url.includes('chat.openai.com'))
        {
            chrome.scripting.executeScript({
                target: { tabId: activeTab.id },
                function: getPageHtml
            }, (injectionResults) =>
            {
                if (injectionResults[0])
                {
                    const pageHtml = injectionResults[0].result;
                    actionButton.onclick = function ()
                    {
                        const sanitizedTitle = activeTab.title.replace(/[^a-zA-Z0-9 \-_\.]/g, '_');
                        const htmlContent = buildDocument(sanitizedTitle, pageHtml);
                        downloadHtml(htmlContent, sanitizedTitle + '.html');
                    };
                    actionButton.disabled = false;
                }
            });
        } else
        {
            actionButton.disabled = true;
        }
    });
});

function getPageHtml()
{
    return document.documentElement.outerHTML;
}

function downloadHtml(htmlContent, filename)
{
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = filename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
}
